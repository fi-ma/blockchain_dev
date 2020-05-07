import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';

(async() => {
    let result = null;

    let contract = new Contract('localhost', () => {
        // Read transaction
        contract.isOperational((error, result) => {
            console.log('isOperational', error, result);
            display('Operational Status', 'Check if contract is operational', [{label: 'Operational Status', error: error, value: result}]);
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

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = JSON.parse(DOM.elid('flight-info').value);
            
            console.log(flight.number, flight.airlineName, flight.timestamp);

            // Write transaction
            contract.fetchFlightStatus(flight.number, flight.airlineName, flight.timestamp, (error, result) => {
                display('Oracles', 'Trigger oracles', [{label: 'Fetch Flight Status', error: error, value: `${flight.airlineName} - ${result.flight}; ${flight.departure}`}]);
            });
        });
    });
})();

function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
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