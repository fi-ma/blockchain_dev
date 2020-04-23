pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight Surety Data contract
    // FlightSuretyData flightSuretyData;

    // Flight status codes
    uint8 private constant _STATUS_CODE_UNKNOWN = 0;
    uint8 private constant _STATUS_CODE_ON_TIME = 10;
    uint8 private constant _STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant _STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant _STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant _STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner; // Account used to deploy contract

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    mapping(bytes32 => Flight) private flights;

    constructor (address _dataContract) public {
        contractOwner = msg.sender;
        // flightSuretyData = FlightSuretyData(_dataContract);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() {
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public pure returns (bool) {
        return true;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/


   /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline() external pure returns
    (
        bool _success,
        uint256 _votes
    )
    {
        return (_success, 0);
    }

   /**
    * @dev Register a future flight for insuring.
    *
    */
    function registerFlight() external pure {

    }

   /**
    * @dev Called after oracle has updated flight status
    *
    */
    function processFlightStatus
    (
        address _airline,
        string memory _flight,
        uint256 _timestamp,
        uint8 _statusCode
    )
        internal
        pure
    {

    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
    (
        address _airline,
        string calldata _flight,
        uint256 _timestamp
    )
        external
    {
        uint8 _index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(_index, _airline, _flight, _timestamp));
        oracleResponses[key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(_index, _airline, _flight, _timestamp);
    }

// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(
        address _airline,
        string _flight,
        uint256 _timestamp,
        uint8 _status
    );

    event OracleReport(
        address _airline,
        string _flight,
        uint256 _timestamp,
        uint8 _status
    );

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(
        uint8 _index,
        address _airline,
        string _flight,
        uint256 _timestamp
    );

    // Register an oracle with the contract
    function registerOracle() external payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory _indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: _indexes
        });
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }

    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse
    (
        uint8 _index,
        address _airline,
        string calldata _flight,
        uint256 _timestamp,
        uint8 _statusCode
    )
    external
    {
        require(
            (oracles[msg.sender].indexes[0] == _index) ||
            (oracles[msg.sender].indexes[1] == _index) ||
            (oracles[msg.sender].indexes[2] == _index),
            "Index does not match oracle request"
        );

        bytes32 _key = keccak256(
            abi.encodePacked(_index, _airline, _flight, _timestamp)
        );

        require(
            oracleResponses[_key].isOpen,
            "Flight or timestamp do not match oracle request"
        );

        oracleResponses[_key].responses[_statusCode].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(_airline, _flight, _timestamp, _statusCode);

        if (oracleResponses[_key].responses[_statusCode].length >= MIN_RESPONSES) {
            emit FlightStatusInfo(_airline, _flight, _timestamp, _statusCode);

            // Handle flight status as appropriate
            processFlightStatus(_airline, _flight, _timestamp, _statusCode);
        }
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

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address _account) internal returns (uint8[3] memory) {
        uint8[3] memory _indexes;
        _indexes[0] = getRandomIndex(_account);

        _indexes[1] = _indexes[0];
        while(_indexes[1] == _indexes[0]) {
            _indexes[1] = getRandomIndex(_account);
        }

        _indexes[2] = _indexes[1];
        while((_indexes[2] == _indexes[0]) || (_indexes[2] == _indexes[1])) {
            _indexes[2] = getRandomIndex(_account);
        }

        return _indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(address _account) internal returns (uint8) {
        uint8 _maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 _random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(blockhash(block.number - nonce++), _account)
                )
            ) % _maxValue
        );

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return _random;
    }

// endregion

}

/*contract FlightSuretyData {
    function()
}*/