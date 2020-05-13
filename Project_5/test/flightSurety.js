const Test = require('../config/testConfig.js');

contract('Flight Surety Tests', async (accounts) => {
    let config;
    let timestamp = Date.parse('19 Oct 2020 08:00:00 GMT+0200') / 1000;

    before('setup contract', async () => {
        config = await Test.Config(accounts);
        
        await config.flightSuretyData.authorizeContract(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        // Get operating status
        let status = await config.flightSuretyData.operational.call();

        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;

        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        } catch (e) {
            accessDenied = true;
        }

        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;

        try {
            await config.flightSuretyData.setOperatingStatus(false);
        } catch (e) {
            accessDenied = true;
        }

        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        await config.flightSuretyData.setOperatingStatus(false);

        let reverted = false;

        try {
            await config.flightSuretyData.deauthorizeContract(config.flightSuretyApp.address);
        } catch(e) {
            reverted = true;
        }

        assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);
    });

    it('(airline) cannot register itself', async () => {
        // ARRANGE
        let newAirline = accounts[2];
        let result = true;

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, "Second Airline", { from: newAirline });
        } catch(e) {
            result = false;
        }

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register itself");
    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
        // ARRANGE
        let newAirline = accounts[2];
        let result = true;

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, "Second Airline", { from: config.firstAirline });
        } catch(e) {
            result = false;
        }

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline) can register an Airline using registerAirline() once funded', async () => {
        // ARRANGE
        let newAirline = accounts[2];
        let result = true;

        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.utils.toWei("15", "ether") });

        let funded = await config.flightSuretyData.getFundedStatus(config.firstAirline);

        try {
            await config.flightSuretyApp.registerAirline(newAirline, "Second Airline", { from: config.firstAirline });
        } catch(e) {
            result = false;
        }

        // ASSERT
        assert.equal(funded, true, "Airline should be funded");
        assert.equal(result, true, "Airline should be able to register another airline after funding");
    });

    it('(airline) can register Fifth and Sixth Airline once at least 50% of existing airlines vote for it', async () => {
        // ARRANGE
        let secondAirline = accounts[2];
        let thirdAirline = accounts[3];
        let fourthAirline = accounts[4];
        let fifthAirline = accounts[5];
        let sixthAirline = accounts[6];
        let resultFifth = true;
        let resultSixth = true;

        await config.flightSuretyData.fund({ from: secondAirline, value: web3.utils.toWei("10", "ether") });

        await config.flightSuretyApp.registerAirline(thirdAirline, "Third Airline", { from: secondAirline });
        await config.flightSuretyData.fund({ from: thirdAirline, value: web3.utils.toWei("10", "ether") });

        await config.flightSuretyApp.registerAirline(fourthAirline, "Fourth Airline", { from: thirdAirline });
        await config.flightSuretyData.fund({ from: fourthAirline, value: web3.utils.toWei("10", "ether") });

        await config.flightSuretyApp.registerAirline(fifthAirline, "Fifth Airline", { from: config.firstAirline });
        await config.flightSuretyApp.registerAirline(fifthAirline, "Fifth Airline", { from: secondAirline });
        
        try {
            await config.flightSuretyData.fund({ from: fifthAirline, value: web3.utils.toWei("10", "ether") });
        } catch(e) {
            resultFifth = false;
        }

        await config.flightSuretyApp.registerAirline(sixthAirline, "Sixth Airline", { from: thirdAirline });
        await config.flightSuretyApp.registerAirline(sixthAirline, "Sixth Airline", { from: fourthAirline });
        await config.flightSuretyApp.registerAirline(sixthAirline, "Sixth Airline", { from: fifthAirline });

        try {
            await config.flightSuretyData.fund({ from: sixthAirline, value: web3.utils.toWei("10", "ether") });
        } catch(e) {
            resultSixth = false;
        }
        
        // ASSERT
        assert.equal(resultFifth, true, "Fifth airline should be able to get funded once registered");
        assert.equal(resultSixth, true, "Sixth airline should be able to get funded once registered");
    });

    it('(passenger) can buy insurance', async () => {
        // ARRANGE
        let passenger = accounts[7];
        let result = true;

        try {
            await config.flightSuretyData.buy(
                config.firstAirline,
                "1N1234",
                timestamp,
                { from: passenger, value: web3.utils.toWei("1", "ether") }
            );
        } catch(e) {
            result = false;
        }

        // ASSERT
        assert.equal(result, true, "Passenger should be able to buy insurance for a flight");
    });

    it('(passenger) cannot buy insurance for the same flight twice', async () => {
        // ARRANGE
        let passenger = accounts[7];
        let result = true;

        try {
            await config.flightSuretyData.buy(
                config.firstAirline,
                "1N1234",
                timestamp,
                { from: passenger, value: web3.utils.toWei("1", "ether") }
            );
        } catch(e) {
            result = false;
        }

        // ASSERT
        assert.equal(result, false, "Passenger should not be able to buy insurance for the same flight twice");
    });
});