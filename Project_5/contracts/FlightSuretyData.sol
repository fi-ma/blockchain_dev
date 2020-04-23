pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract FlightSuretyData is AccessControl {
    using SafeMath for uint256;

    // Roles definition
    bytes32 private constant _AIRLINER_ROLE = keccak256("AIRLINER_ROLE");

    // Airlines registration
    uint256 private constant _AIRLINE_REG_FEE = 10 ether;

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

    event Received(address _address, address indexed _iAddress, uint256 _amount);

    constructor () public {
        _contractOwner = msg.sender;
        super._setupRole(_AIRLINER_ROLE, msg.sender);
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

    modifier requireFundedAirline() {
        require(_airlines[msg.sender].isFunded, "Calling airline is not funded");
        _;
    }

    modifier requireHasAirlinerRole() {
        require(super.hasRole(_AIRLINER_ROLE, msg.sender), "Sender does not have Airliner Role");
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
    function buy() external payable {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees() external pure {

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
    function fund() public payable requireIsOperational requireHasAirlinerRole {
        require(!_airlines[msg.sender].isFunded, "Airline is funded already");
        require(msg.value >= _AIRLINE_REG_FEE, "Funding fee for a new airline is at least 10 Ether");

        _airlines[msg.sender].isFunded = true;
        
        super.grantRole(_AIRLINER_ROLE, msg.sender);
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