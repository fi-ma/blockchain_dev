pragma solidity ^0.6.2;

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
    FlightSuretyData flightSuretyData;

    // Flight status codes
    uint8 private constant _STATUS_CODE_UNKNOWN = 0;
    uint8 private constant _STATUS_CODE_ON_TIME = 10;
    uint8 private constant _STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant _STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant _STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant _STATUS_CODE_LATE_OTHER = 50;

    uint8 private constant _MULTI_PARTY = 4; // Multi-party concensus is required above this number of registered airlines
    address private _contractOwner; // Account used to deploy contract

    mapping (address => address[]) public _airlineVoters; // Accounts of airlines that already participated in multi-party voting process

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        address airline;
        uint256 updatedTimestamp;
    }

    mapping (bytes32 => Flight) private _flights;

    event Voted(
        address _votedFor,
        address _voter,
        uint256 _votes,
        uint256 _neededVotes
    );

    constructor (address _dataContract) public {
        _contractOwner = msg.sender;
        flightSuretyData = FlightSuretyData(_dataContract);
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
        require(flightSuretyData.operational(), "Contract is currently not operational");
        _;
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner() {
        require(msg.sender == _contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() public view returns (bool) {
        return flightSuretyData.operational();
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
    * @dev Add an airline to the registration queue
    *
    */
    function registerAirline(address _address, string calldata _name)
        external
        requireIsOperational
        returns (bool _success, uint256 _votes)
    {
        require(
            flightSuretyData.hasAirlinerRole(msg.sender),
            "Sender does not have Airliner Role"
        );
        require(
            flightSuretyData.getFundedStatus(msg.sender),
            "Calling airline is not funded"
        );
        require(
            !flightSuretyData.hasAirlinerRole(_address),
            "Airline is registered already"
        );

        uint256 _airlinesCount = flightSuretyData.airlinesCount();

        if (_airlinesCount < _MULTI_PARTY) {
            _success = flightSuretyData.registerAirline(_address, _name);

            return (_success, 0);
        }

        bool _isDuplicate;

        for (uint256 i = 0; i < _airlineVoters[_address].length; i++) {
            if (_airlineVoters[_address][i] == msg.sender) {
                _isDuplicate = true;
                break;
            }
        }

        require(!_isDuplicate, "Caller voted already");

        _airlineVoters[_address].push(msg.sender);

        if (_airlinesCount.mod(2) != 0) {
            _airlinesCount = _airlinesCount.add(1);
        }

        emit Voted(
            _address,
            msg.sender,
            _airlineVoters[_address].length,
            _airlinesCount.div(2)
        );

        if (_airlineVoters[_address].length >= _airlinesCount.div(2)) {
            _airlineVoters[_address] = new address[](0);
            _success = flightSuretyData.registerAirline(_address, _name);
        }

        return (_success, _airlineVoters[_address].length);
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
        private
        requireIsOperational
    {
        if (_statusCode == _STATUS_CODE_LATE_AIRLINE) {
            bytes32 _flightKey = keccak256(
                abi.encodePacked(_airline, _flight, _timestamp)
            );

            flightSuretyData.creditInsurees(_flightKey);
        }
    }

    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
    (
        address _airline,
        string calldata _flight,
        uint256 _timestamp
    )
        external
        requireIsOperational
    {
        uint8 _index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 _key = keccak256(
            abi.encodePacked(_index, _airline, _flight, _timestamp)
        );

        _oracleResponses[_key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(_index, _airline, _flight, _timestamp);
    }

// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private _nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant _MIN_RESPONSES = 3;

    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping (address => Oracle) private _oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping (uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping (bytes32 => ResponseInfo) private _oracleResponses;

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
    function registerOracle() external payable requireIsOperational {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory _indexes = generateIndexes(msg.sender);

        _oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: _indexes
        });
    }

    function getMyIndexes() external view returns (uint8[3] memory) {
        require(_oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return _oracles[msg.sender].indexes;
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
        requireIsOperational
    {
        require(
            (_oracles[msg.sender].indexes[0] == _index) ||
            (_oracles[msg.sender].indexes[1] == _index) ||
            (_oracles[msg.sender].indexes[2] == _index),
            "Index does not match oracle request"
        );

        bytes32 _key = keccak256(
            abi.encodePacked(_index, _airline, _flight, _timestamp)
        );

        require(
            _oracleResponses[_key].isOpen,
            "Flight or timestamp do not match oracle request"
        );

        _oracleResponses[_key].responses[_statusCode].push(msg.sender);

        // Information isn't considered verified until at least _MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(_airline, _flight, _timestamp, _statusCode);

        if (_oracleResponses[_key].responses[_statusCode].length >= _MIN_RESPONSES) {
            emit FlightStatusInfo(_airline, _flight, _timestamp, _statusCode);

            // Handle flight status as appropriate
            processFlightStatus(_airline, _flight, _timestamp, _statusCode);
        }
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(address _account) private returns (uint8[3] memory) {
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
    function getRandomIndex(address _account) private returns (uint8) {
        uint8 _maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 _random = uint8(
            uint256(
                keccak256(
                    abi.encodePacked(blockhash(block.number - _nonce++), _account)
                )
            ) % _maxValue
        );

        if (_nonce > 250) {
            _nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return _random;
    }

// endregion

}

abstract contract FlightSuretyData {
    bool public operational;
    uint256 public airlinesCount;

    function hasAirlinerRole(address _address)
        external
        virtual
        view
        returns (bool);
    
    function getFundedStatus(address _address)
        external
        virtual
        view
        returns (bool);

    function registerAirline(address _address, string calldata _name)
        external
        virtual
        returns (bool);
    
    function creditInsurees(bytes32 _flight) external virtual;
}