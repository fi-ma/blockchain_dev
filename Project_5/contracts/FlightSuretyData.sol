pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FlightSuretyData is AccessControl {
    using SafeMath for uint256;

    // Roles definition
    bytes32 private constant _AIRLINER_ROLE = keccak256("AIRLINER");
    bytes32 private constant _ORACLE_ROLE = keccak256("ORACLE");

    // Airlines registration fee and flight insurance cap
    uint256 private constant _AIRLINE_REG_FEE = 10 ether;
    uint256 private constant _FLIGHT_INSURANCE_CAP = 1 ether;

    bool public operational = true; // Blocks all state changes throughout the contract if false
    address private _contractOwner; // Account used to deploy contract
    
    // Tuple to store registration info on airlines
    struct Airline {
        bool isFunded;
        string name;
    }

    /**
    *   Figure out how the oracle flow will be, regarding crediting passengers for delayed flights
    *   
    */

    mapping (address => Airline) private _airlines;
    mapping (bytes32 => address[]) private _insurances; // Flight number to insuree addresses
    mapping (bytes32 => uint256) private _insurees; // Insuree to insured amount
    mapping (address => uint256) private _pendingWithdrawals; // Insuree to withdrawal amount

    event Received(address _address, address indexed _iAddress, uint256 _amount);
    event Funded(address _address, address indexed _iAddress, uint256 _amount);

    constructor () public {
        _contractOwner = _msgSender();
        super._setupRole(_AIRLINER_ROLE, _msgSender());
        super._setupRole(_ORACLE_ROLE, _msgSender());
        _airlines[_msgSender()] = Airline({
            isFunded: true,
            name: "First National"
        });
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    *
    */
    modifier requireContractOwner() {
        require(_msgSender() == _contractOwner, "Caller is not contract owner");
        _;
    }

    /**
    * @dev Modifier that requires the caller to have the "_ORACLE_ROLE" role
    *
    */
    modifier requireHasOracleRole() {
        require(super.hasRole(_ORACLE_ROLE, _msgSender()), "Sender does not have Oracle Role");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus(bool _mode) external requireContractOwner {
        operational = _mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Gets `isFunded` for an airliner `_address`
    *
    */
    function getFundedStatus(address _address) external view returns (bool) {
        return _airlines[_address].isFunded;
    }

    /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _address, string calldata _name)
        external
        requireIsOperational
    {
        require(
            super.hasRole(_AIRLINER_ROLE, _msgSender()),
            "Sender does not have Airliner Role"
        );
        require(_airlines[_msgSender()].isFunded, "Airline is not funded");
        
        _airlines[_address] = Airline({
            isFunded: false,
            name: _name
        });

        super.grantRole(_AIRLINER_ROLE, _address);
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy(bytes32 _flight) external payable requireIsOperational {
        require(
            msg.value > 0 &&
            msg.value <= _FLIGHT_INSURANCE_CAP,
            "Flight insurance out of range"
        );
        require(
            _insurees[keccak256(abi.encodePacked(_flight, _msgSender()))] == 0,
            "Passenger already insured for given flight"
        );

        _insurances[_flight].push(_msgSender());
        _insurees[keccak256(abi.encodePacked(_flight, _msgSender()))] = msg.value;
    }

    /**
    *  @dev Credits payouts to insurees
    *
    */
    function creditInsurees(bytes32 _flight)
        external
        requireIsOperational
        requireHasOracleRole
    {
        require(
            _insurances[_flight].length > 0,
            "No passengers insured for given flight"
        );

        for (uint256 i; i < _insurances[_flight].length; i++) {
            address _insuree = _insurances[_flight][i];
            
            uint256 _insuredAmount = _insurees[
                keccak256(abi.encodePacked(_flight, _insuree))
            ];
            uint256 _amount = _insuredAmount.add(_insuredAmount.div(2));

            _insurees[keccak256(abi.encodePacked(_flight, _insuree))] = 0;

            _pendingWithdrawals[_insuree] =
                _pendingWithdrawals[_insuree].add(_amount);
        }

        delete _insurances[_flight];
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external requireIsOperational {
        uint256 _amount = _pendingWithdrawals[_msgSender()];

        if (_amount > 0) {
            _pendingWithdrawals[_msgSender()] = 0;

            (bool success,) = _msgSender().call{value: _amount}("");

            require(success);
        }
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund()
        public
        payable
        requireIsOperational
    {
        require(
            super.hasRole(_AIRLINER_ROLE, _msgSender()),
            "Sender does not have Airliner Role"
        );
        require(!_airlines[_msgSender()].isFunded, "Airline is funded already");
        require(msg.value >= _AIRLINE_REG_FEE, "Funding fee for a new airline is too low");

        _airlines[_msgSender()].isFunded = true;

        emit Funded(_msgSender(), _msgSender(), msg.value);
    }

    /**
    * @dev Receive ether function for funding smart contract.
    *
    */
    receive() external payable requireIsOperational {
        emit Received(_msgSender(), _msgSender(), msg.value);
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable requireIsOperational {
        emit Received(_msgSender(), _msgSender(), msg.value);
    }
}