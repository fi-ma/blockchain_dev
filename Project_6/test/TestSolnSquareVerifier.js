const https = require('https');

const SquareVerifier = artifacts.require("Verifier");
const SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

const fs = require('fs');
const path = require('path');
const zkProof = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '../zokrates/code/square/proof.json')
    )
);

contract('SolnSquareVerifier', accounts => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('verify solution square verifier', function () {
        beforeEach(async function () {
            this.verifier = await SquareVerifier.new({from: account_one});
            this.contract = await SolnSquareVerifier.new(this.verifier.address, {from: account_one});
        })
        
        it('should add new solution and emit an event', async function () {
            let receipt = await this.contract.mintVerified(
                1,
                account_two,
                zkProof.proof.a,
                zkProof.proof.b,
                zkProof.proof.c,
                zkProof.inputs
            );

            let result = receipt.logs[0].event == 'Submitted';

            assert.equal(result, true, "Should emit an `Submitted` event");
        })

        it('should mint a new NFT', async function () {
            let result = true;
            
            try {
                await this.contract.mintVerified(
                    1,
                    account_two,
                    zkProof.proof.a,
                    zkProof.proof.b,
                    zkProof.proof.c,
                    zkProof.inputs
                );
    
                await this.contract.tokenURI.call(1);
            } catch(e) {
                result = false;
            }
            
            assert.equal(result, true, "Should mint a new NFT");
        })

        it('should not mint a new NFT by submitting previously submitted verification', async function () {
            let result = false;
            
            try {
                await this.contract.mintVerified(
                    1,
                    account_two,
                    zkProof.proof.a,
                    zkProof.proof.b,
                    zkProof.proof.c,
                    zkProof.inputs
                );
    
                await this.contract.mintVerified(
                    2,
                    account_two,
                    zkProof.proof.a,
                    zkProof.proof.b,
                    zkProof.proof.c,
                    zkProof.inputs
                );
            } catch(e) {
                result = true;
            }
            
            assert.equal(result, true, "Should not mint a new NFT");
        })
    });
})