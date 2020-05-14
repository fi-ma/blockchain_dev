import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3User = null;
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.user = null;
        this.airlines = {};
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];

            this.airlines['First National'] = accts[1];
            this.airlines['Second National'] = accts[2];
            this.airlines['Third National'] = accts[3];
            this.airlines['Fourth National'] = accts[4];
            this.airlines['Fifth National'] = accts[5];

            console.log(this.airlines);
        });

        if (window.ethereum) {
            this.web3User = new Web3(window.ethereum);

            try {
                // Request account access
                window.ethereum.enable().then(function() {});
            } catch (error) {
                // User denied account access...
                console.error("User denied account access");
                alert("You have to allow using Ethereum in order to use this dApp!");
            }
        }// Legacy dapp browsers...
        else if (window.web3) {
            this.web3User = new Web3(window.web3.currentProvider);
        }
        // No injected web3 instance is detected
        else {
            alert("You have to install MetaMask to use this dApp!");
        }

        this.web3User.eth.getAccounts((error, accts) => {
            this.user = accts[0];

            console.log("user account", this.user);

            callback();
        });
    }
    
    isOperational(callback) {
        let self = this;

        self.flightSuretyApp.methods
            .isOperational()
            .call({from: self.owner}, (error, result) => {
                callback(error, result);
            });
    }

    authorizeContract(callback) {
        let self = this;

        self.flightSuretyData.methods
            .authorizeContract(self.flightSuretyApp._address)
            .send({from: self.owner, gas: 2000000}, (error, result) => {
                callback(error, result);
            });
    }

    fundAirline(airlineName, callback) {
        let self = this;

        self.flightSuretyData.methods
            .fund()
            .send({from: self.airlines[airlineName], value: self.web3.utils.toWei("10", "ether")}, (error, result) => {
                callback(error, result);
            });
    }

    registerAirline(fromAirlineName, airlineName, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerAirline(self.airlines[airlineName], airlineName)
            .send({from: self.airlines[fromAirlineName], gas: 2000000}, (error, result) => {
                callback(error, result);
            });
    }

    fetchFlightStatus(flight, airlineName, timestamp, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[airlineName],
            flight: flight,
            timestamp: timestamp
        };

        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({from: self.owner, gas: 4712388, gasPrice: 100000000000}, (error, result) => {
                callback(error, result);
            });
    }

    buy(flight, airlineName, timestamp, amount, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[airlineName],
            flight: flight,
            timestamp: timestamp
        };

        self.flightSuretyData.methods
            .buy(payload.airline, payload.flight, payload.timestamp)
            .send({from: self.user, value: self.web3.utils.toWei(amount, "ether")}, (error, result) => {
                callback(error, result);
            });
    }

    withdraw(callback) {
        let self = this;

        self.flightSuretyData.methods
            .withdraw()
            .call({from: self.user}, (error, result) => {
                callback(error, result);
            });
    }
}