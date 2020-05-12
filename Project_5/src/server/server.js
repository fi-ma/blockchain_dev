import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

const FLIGHT_STATUS_CODE = [0, 10, 20, 30, 40, 50];

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let oracles = [];
let airlines = {};

web3.eth.getAccounts()
.then(accounts => {
    web3.eth.defaultAccount = accounts[0];

    airlines['First National'] = accounts[1];
    airlines['Second National'] = accounts[2];
    airlines['Third National'] = accounts[3];
    airlines['Fourth National'] = accounts[4];
    airlines['Fifth National'] = accounts[5];

    for (let i = 20, p = Promise.resolve(); i < 100; i++) {
        let address = accounts[i];
        
        p = p.then(_ => new Promise(resolve =>
            flightSuretyApp.methods.registerOracle().send({
                from: address,
                value: web3.utils.toWei("1", "ether"),
                gas: 2000000
            })
            .then(() => {
                return flightSuretyApp.methods.getMyIndexes().call({
                    from: address
                })
            })
            .then(result => {
                console.log(`Oracle account #${i} registered: ${result[0]}, ${result[1]}, ${result[2]}`);

                oracles.push({
                    address: address,
                    indexes: result
                });

                resolve();
            })
        ));
    };
});

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error);
    console.log(event);

    let index = event.returnValues._index;
    let airlineAddr = event.returnValues._airline;
    let flight = event.returnValues._flight;
    let timestamp = event.returnValues._timestamp;

    for (let i = 0, p = Promise.resolve(); i < oracles.length; i++) {
        let address = oracles[i].address;
        // let statusCode = FLIGHT_STATUS_CODE[Math.floor(Math.random() * FLIGHT_STATUS_CODE.length)];
        let statusCode = 0;

        if (Math.floor(Math.random() * 1.5) === 0) {
            statusCode = 20;
        }

        if (oracles[i].indexes.includes(index)) {
            console.log(`Oracle account ${address} contains index ${index} among ${oracles[i].indexes} - submitting status code ${statusCode}`);

            p = p.then(_ => new Promise(resolve => {
                flightSuretyApp.methods.submitOracleResponse(
                    index,
                    airlineAddr,
                    flight,
                    timestamp,
                    statusCode
                ).send({
                    from: address
                }, (err) => {
                    if (err) console.log(`${err}`);
                });

                resolve();
            }));
        }
    }
});

flightSuretyApp.events.OracleReport({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)

    let status = event.returnValues._status;
    let airlineAddr = event.returnValues._airline;
    let flight = event.returnValues._flight;
    let timestamp = event.returnValues._timestamp;

    console.log(`The flight ${flight} by ${airlineAddr} on ${timestamp} is having status of ${status}`);
});

flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)

    let status = event.returnValues._status;
    let airlineAddr = event.returnValues._airline;
    let flight = event.returnValues._flight;
    let timestamp = event.returnValues._timestamp;

    console.log(`The flight ${flight} by ${airlineAddr} on ${timestamp} has been finalized with status ${status}`);
});

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    next();
});

app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!',
        flights: [
            {
                number: '1N9245',
                airlineName: 'First National',
                departure: '19 Oct 2020 08:00:00 GMT+0200',
                timestamp: Date.parse('19 Oct 2020 08:00:00 GMT+0200') / 1000
            },
            {
                number: '2N5231',
                airlineName: 'Second National',
                departure: '19 Oct 2020 13:30:00 GMT+0200',
                timestamp: Date.parse('19 Oct 2020 13:30:00 GMT+0200') / 1000
            },
            {
                number: '3N3092',
                airlineName: 'Third National',
                departure: '20 Oct 2020 10:15:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 10:15:00 GMT+0200') / 1000
            },
            {
                number: '4N0356',
                airlineName: 'Fourth National',
                departure: '20 Oct 2020 12:00:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 12:00:00 GMT+0200') / 1000
            },
            {
                number: '5N8231',
                airlineName: 'Fifth National',
                departure: '20 Oct 2020 17:45:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 17:45:00 GMT+0200') / 1000
            }
        ],
        oracles: oracles,
        airlines: airlines
    })
});

export default app;