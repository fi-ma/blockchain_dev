pragma solidity ^0.6.2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FlightSuretyData is AccessControl {
    using SafeMath for uint256;

    // Roles definition
    bytes32 public constant AIRLINER_ROLE = keccak256("AIRLINER");

    // Airlines registration fee and flight insurance cap
    uint256 private constant _AIRLINE_REG_FEE = 10 ether;
    uint256 private constant _FLIGHT_INSURANCE_CAP = 1 ether;

    bool public operational = true; // Blocks all state changes throughout the contract if false
    address private _contractOwner; // Account used to deploy contract
    mapping (address => uint256) private _authorizedContracts; // Keeps track of authorized app contract(s)
    
    // Tuple to store registration info on airlines
    struct Airline {
        bool isFunded;
        string name;
    }

    uint256 public airlinesCount;
    mapping (address => Airline) private _airlines;
    mapping (bytes32 => address[]) private _insurances; // Flight number to insuree addresses
    mapping (bytes32 => uint256) private _insurees; // Insuree to insured amount
    mapping (address => uint256) private _pendingWithdrawals; // Insuree to withdrawal amount

    event Received(address _address, address indexed _iAddress, uint256 _amount);
    event Funded(address _address, address indexed _iAddress, uint256 _amount);

    constructor (address _address) public {
        _contractOwner = _msgSender();

        super._setupRole(AIRLINER_ROLE, _msgSender());
        super._setRoleAdmin(AIRLINER_ROLE, AIRLINER_ROLE);
        super.grantRole(AIRLINER_ROLE, _address);
        
        _airlines[_address] = Airline({
            isFunded: false,
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

    modifier requireIsAuthorized() {
        require(
            _authorizedContracts[_msgSender()] == 1,
            "Caller is not an authorized app contract"
        );
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
    function setOperatingStatus(bool _mode) public requireContractOwner {
        operational = _mode;
    }

    /**
    * @dev Authorizes `_address` for remote calls
    *
    */
    function authorizeContract(address _address)
        public
        requireIsOperational
        requireContractOwner
    {
        if (_authorizedContracts[_address] == 0) {
            _authorizedContracts[_address] = 1;

            super.grantRole(AIRLINER_ROLE, _address);
        }
    }

    /**
    * @dev Deauthorizes `_address` for remote calls
    *
    */
    function deauthorizeContract(address _address)
        public
        requireIsOperational
        requireContractOwner
    {
        if (_authorizedContracts[_address] == 1) {
            _authorizedContracts[_address] = 0;

            super.revokeRole(AIRLINER_ROLE, _address);
        }
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Returns `true` if `_address` has Airliner Role
    *
    */
    function hasAirlinerRole(address _address) external view returns (bool) {
        return super.hasRole(AIRLINER_ROLE, _address);
    }

    /**
    * @dev Gets `isFunded` for an airliner `_address`
    *
    */
    function getFundedStatus(address _address) external view returns (bool) {
        return _airlines[_address].isFunded;
    }

    /**
    * @dev Add an airline to the registration queue
    * 
    * Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _address, string calldata _name)
        external
        requireIsOperational
        requireIsAuthorized
        returns (bool)
    {
        if (_airlines[_address].isFunded == true) {
            return false;
        }
        
        _airlines[_address] = Airline({
            isFunded: false,
            name: _name
        });

        super.grantRole(AIRLINER_ROLE, _address);

        return true;
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
    (
        address _airline,
        string calldata _flight,
        uint256 _timestamp
    )
        external
        payable
        requireIsOperational
    {
        require(
            msg.value > 0 &&
            msg.value <= _FLIGHT_INSURANCE_CAP,
            "Flight insurance out of range"
        );

        bytes32 _flightKey = keccak256(
            abi.encodePacked(_airline, _flight, _timestamp)
        );

        require(
            _insurees[keccak256(abi.encodePacked(_flightKey, _msgSender()))] == 0,
            "Passenger already insured for given flight"
        );

        _insurances[_flightKey].push(_msgSender());
        _insurees[keccak256(abi.encodePacked(_flightKey, _msgSender()))] = msg.value;
    }

    /**
    * @dev Credits payouts to insurees
    * 
    * Can only be called from FlightSuretyApp contract
    *
    */
    function creditInsurees(bytes32 _flightKey)
        external
        requireIsOperational
        requireIsAuthorized
    {
        for (uint256 i = 0; i < _insurances[_flightKey].length; i++) {
            address _insuree = _insurances[_flightKey][i];

            uint256 _insuredAmount = _insurees[
                keccak256(abi.encodePacked(_flightKey, _insuree))
            ];

            if (_insuredAmount > 0) {
                uint256 _amount = _insuredAmount.add(_insuredAmount.div(2));

                _insurees[keccak256(abi.encodePacked(_flightKey, _insuree))] = 0;

                _pendingWithdrawals[_insuree] =
                    _pendingWithdrawals[_insuree].add(_amount);
            }
        }
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function withdraw() external requireIsOperational {
        uint256 _amount = _pendingWithdrawals[_msgSender()];

        require(
            _amount > 0,
            "Passenger has no pending withdrawal"
        );

        _pendingWithdrawals[_msgSender()] = 0;

        (bool success,) = _msgSender().call{value: _amount}("");

        require(success);
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
            super.hasRole(AIRLINER_ROLE, _msgSender()),
            "Sender does not have Airliner Role"
        );
        require(!_airlines[_msgSender()].isFunded, "Airline is funded already");
        require(
            msg.value >= _AIRLINE_REG_FEE,
            "Sent funding fee for a new airline is too low"
        );

        _airlines[_msgSender()].isFunded = true;
        airlinesCount = airlinesCount.add(1);

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