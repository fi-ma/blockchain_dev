import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        // this.airlines = [];
        this.airlines = {};
        this.passengers = [];
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

            let counter = 6;

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
        let self = this;

        self.flightSuretyApp.methods
            .isOperational()
            .call({from: self.owner}, callback);
    }

    authorizeContract(callback) {
        let self = this;

        self.flightSuretyData.methods
            .authorizeContract(self.flightSuretyApp._address)
            .send({from: self.owner, gas: 2000000}, callback);
    }

    fundAirline(airlineName, callback) {
        let self = this;

        self.flightSuretyData.methods
            .fund()
            .send({from: self.airlines[airlineName], value: self.web3.utils.toWei("10", "ether")}, callback)
    }

    registerAirline(fromAirlineName, airlineName, callback) {
        let self = this;

        self.flightSuretyApp.methods
            .registerAirline(self.airlines[airlineName], airlineName)
            .send({from: self.airlines[fromAirlineName], gas: 2000000}, callback);
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
            .send({from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }
}