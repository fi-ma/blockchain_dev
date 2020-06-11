var SquareVerifier = artifacts.require("Verifier");
const fs = require('fs');
const path = require('path');
const zkProof = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, '../zokrates/code/square/proof.json')
    )
);

contract('Verifier', accounts => {
    const account_one = accounts[0];

    describe('verify zokrates proof', function () {
        beforeEach(async function () {
            this.contract = await SquareVerifier.new({from: account_one});
        })
        
        it('should pass verifying a proof', async function () {
            let receipt = await this.contract.verifyTx(
                zkProof.proof.a,
                zkProof.proof.b,
                zkProof.proof.c,
                zkProof.inputs
            );

            let result = receipt.logs[0].event == 'Verified';

            assert.equal(result, true, "Should pass the verification of the proof");
        })

        it('should fail verifying a proof', async function () {
            let result;
            
            let receipt = await this.contract.verifyTx(
                zkProof.proof.c,
                zkProof.proof.b,
                zkProof.proof.a,
                zkProof.inputs
            );

            try {
                result = receipt.logs[0].event == 'Verified';
            } catch(e) {
                result = false;
            }

            assert.equal(result, false, "Should fail the verification of the proof");
        })
    });
})