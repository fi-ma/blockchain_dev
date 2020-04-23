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
    // An airline is approved once majority consensus from existing airlines, participating in
    // the program is achieved
    // An airline can be funded only once it is approved
    struct Airline {
        bool isApproved;
        bool isFunded;
    }

    mapping (address => Airline) private _airlines;
    mapping (bytes32 => address[]) private _insurances; // Flight number to insuree addresses
    mapping (bytes32 => uint256) private _insurees; // Insuree to insured amount
    mapping (address => uint256) private _pendingWithdrawals; // Insuree to withdrawal amount

    event Received(address _address, address indexed _iAddress, uint256 _amount);
    event Funded(address _address, address indexed _iAddress, uint256 _amount);

    constructor () public {
        _contractOwner = msg.sender;
        super._setupRole(_AIRLINER_ROLE, msg.sender);
        super._setupRole(_ORACLE_ROLE, msg.sender);
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
    */
    modifier requireContractOwner() {
        require(msg.sender == _contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireApprovedAirline() {
        require(_airlines[msg.sender].isApproved, "Calling airline is not approved");
        _;
    }

    modifier requireHasAirlinerRole() {
        require(super.hasRole(_AIRLINER_ROLE, msg.sender), "Sender does not have Airliner Role");
        _;
    }

    modifier requireHasOracleRole() {
        require(super.hasRole(_ORACLE_ROLE, msg.sender), "Sender does not have Oracle Role");
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
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline(address _address)
        external
        requireIsOperational
        requireHasAirlinerRole
    {
        _airlines[_address] = Airline({
            isApproved: true,
            isFunded: false
        });
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
            _insurees[keccak256(abi.encodePacked(_flight, msg.sender))] == 0,
            "Passenger already insured for given flight"
        );

        _insurances[_flight] += msg.sender;
        _insurees[keccak256(abi.encodePacked(_flight, msg.sender))] = msg.value;
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees(bytes32 _flight) external requireIsOperational requireHasOracleRole {
        require(
            _insurees[_address].isInsured &&
            _insurees[_address].isEnded &&
            _insurees[_address].isDelayed
        );

        uint256 amount = _insurees[_flight][msg.sender];
        _insurees[_flight][msg.sender] = 0;
        _pendingWithdrawals[_address] = _pendingWithdrawals[_address].add(amount);
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay() external pure {

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
        requireHasAirlinerRole
        requireApprovedAirline
    {
        require(!_airlines[msg.sender].isFunded, "Airline is funded already");
        require(msg.value >= _AIRLINE_REG_FEE, "Funding fee for a new airline is too low");

        _airlines[msg.sender].isFunded = true;

        emit Funded(msg.sender, msg.sender, msg.value);
    }

    function getFlightKey
    (
        address _airline,
        string memory _flight,
        uint256 _timestamp
    )
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_airline, _flight, _timestamp));
    }

    /**
    * @dev Receive ether function for funding smart contract.
    *
    */
    receive() external payable requireIsOperational {
        emit Received(msg.sender, msg.sender, msg.value);
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    fallback() external payable requireIsOperational {
        emit Received(msg.sender, msg.sender, msg.value);
    }
}