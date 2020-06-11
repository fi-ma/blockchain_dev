var ERC721MintableComplete = artifacts.require('CustomERC721Token');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];

    describe('match erc721 spec', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: account_one});

            await this.contract.mint(account_two, 1, {from: account_one});
            await this.contract.mint(account_two, 2, {from: account_one});
            await this.contract.mint(account_two, 3, {from: account_one});
            await this.contract.mint(account_one, 4, {from: account_one});
            await this.contract.mint(account_one, 5, {from: account_one});
        })

        it('should return total supply', async function () { 
            let totalSupply = await this.contract.totalSupply.call();
            
            assert.equal(totalSupply, 5, "Should return total supply of 5");
        })

        it('should get token balance', async function () { 
            let balance = await this.contract.balanceOf.call(account_two);

            assert.equal(balance, 3, "Should return balance of 3 for account_two");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            let tokenURI = await this.contract.tokenURI.call(4);

            assert.equal(tokenURI, "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/4", "Should return complete URI for token Id 4");
        })

        it('should transfer token from one owner to another', async function () { 
            let tokenOwnerPre = await this.contract.ownerOf.call(2);

            await this.contract.safeTransferFrom(account_two, account_one, 2, {from: account_two});

            let tokenOwnerPost = await this.contract.ownerOf.call(2);

            assert.notEqual(tokenOwnerPre, tokenOwnerPost, "Token Id 2 should not have the same owner");
        })
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new({from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () { 
            let result = false;

            try {
                await this.contract.mint(account_two, 1, {from: account_two});
            } catch(e) {
                result = true;
            }
            
            assert.equal(result, true, "Should not be possible to mint tokens, unless you are an owner")
        })

        it('should return contract owner', async function () { 
            let contractOwner = await this.contract.getOwner.call();

            assert.equal(contractOwner, account_one, "Should return account_one as contract owner");
        })
    });
})