import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

// write to fs!

web3.eth.getAccounts()
.then(accounts => {
    web3.eth.defaultAccount = accounts[0];
    
    for (let i = 100, p = Promise.resolve(); i < 150; i++) {
        p = p.then(_ => new Promise(resolve =>
            flightSuretyApp.methods.registerOracle().send({
                from: accounts[i],
                value: web3.utils.toWei("1", "ether"),
                gas: 2000000
            })
            .then(() => {
                return flightSuretyApp.methods.getMyIndexes().call({
                    from: accounts[i]
                })
            })
            .then(result => {
                console.log(`Oracle account #${i} registered: ${result[0]}, ${result[1]}, ${result[2]}`);
                resolve();
            })
        ));
    };
});

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)
    console.log(event)
});

const app = express();

app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!',
        flights: [
            {
                number: '1A9245',
                departure: '19 Oct 2020 08:00:00 GMT+0200',
                timestamp: Date.parse('19 Oct 2020 08:00:00 GMT+0200') / 1000
            },
            {
                number: '2A5231',
                departure: '19 Oct 2020 13:30:00 GMT+0200',
                timestamp: Date.parse('19 Oct 2020 13:30:00 GMT+0200') / 1000
            },
            {
                number: '3A3092',
                departure: '20 Oct 2020 10:15:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 10:15:00 GMT+0200') / 1000
            },
            {
                number: '4A0356',
                departure: '20 Oct 2020 12:00:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 12:00:00 GMT+0200') / 1000
            },
            {
                number: '5A8231',
                departure: '20 Oct 2020 17:45:00 GMT+0200',
                timestamp: Date.parse('20 Oct 2020 17:45:00 GMT+0200') / 1000
            }
        ]
    })
});

export default app;