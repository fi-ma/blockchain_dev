// migrating the appropriate contracts
const SquareVerifier = artifacts.require("Verifier");
const SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

module.exports = function(deployer) {
    deployer.deploy(SquareVerifier)
        .then(() => {
            return deployer.deploy(SolnSquareVerifier, SquareVerifier.address)
                .then(() => {
                    console.log(`SquareVerifier: ${SquareVerifier.address}\nSolnSquareVerifier: ${SolnSquareVerifier.address}`);
                });
        });
};