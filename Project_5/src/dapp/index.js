import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {
    let result = null;

    let contract = new Contract('localhost', () => {
        // Read transaction
        contract.isOperational((error, result) => {
            console.log('isOperational', error, result);
            displayHeader('Operational Status', 'Check if contract is operational', [{label: 'Operational Status', error: error, value: result}]);
        });

        // Authorize app contract
        contract.authorizeContract((error, result) => {
            console.log('authorizeContract', error, result);
        });

        // Register and fund airlines
        contract.fundAirline('First National', (error, result) => {
            console.log('fundAirline First National', error, result);
        });
        contract.registerAirline('First National', 'Second National', (error, result) => {
            console.log('registerAirline Second National', error, result);
        });
        contract.fundAirline('Second National', (error, result) => {
            console.log('fundAirline Second National', error, result);
        });
        contract.registerAirline('Second National', 'Third National', (error, result) => {
            console.log('registerAirline Third National', error, result);
        });
        contract.fundAirline('Third National', (error, result) => {
            console.log('fundAirline Third National', error, result);
        });
        contract.registerAirline('Third National', 'Fourth National', (error, result) => {
            console.log('registerAirline Fourth National', error, result);
        });
        contract.fundAirline('Fourth National', (error, result) => {
            console.log('fundAirline Fourth National', error, result);
        });
        contract.registerAirline('First National', 'Fifth National', (error, result) => {
            console.log('registerAirline Fifth National', error, result);
        });
        contract.registerAirline('Second National', 'Fifth National', (error, result) => {
            console.log('registerAirline Fifth National', error, result);
        });
        contract.fundAirline('Fifth National', (error, result) => {
            console.log('fundAirline Fifth National', error, result);
        });

        // User-submitted transactions
        DOM.elid('submit-buy-insurance').addEventListener('click', () => {
            let flight = JSON.parse(DOM.elid('flight-info').value);
            let amount = DOM.elid('buy-insurance').value;
            
            console.log(`Buy ${amount} eth worth of insurance for ${flight.number}, ${flight.airlineName}, ${flight.timestamp}`);

            // Write transaction
            contract.buy(flight.number, flight.airlineName, flight.timestamp, amount, (error, result) => {
                displayMid('Oracles', 'Trigger oracles', [{label: 'Fetch Flight Status', error: error, value: `${flight.airlineName} - ${result.flight}; ${flight.departure}`}]);
            });
        });

        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = JSON.parse(DOM.elid('flight-info').value);
            
            console.log(flight.number, flight.airlineName, flight.timestamp);

            // Write transaction
            contract.fetchFlightStatus(flight.number, flight.airlineName, flight.timestamp, (error, result) => {
                displayFooter('Oracles', 'Trigger oracles', [{label: 'Fetch Flight Status', error: error, value: `${flight.airlineName} - ${result.flight}; ${flight.departure}`}]);
            });
        });
    });
})();

function displayHeader(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper-head");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function displayMid(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper-mid");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}

function displayFooter(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper-foot");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);
}