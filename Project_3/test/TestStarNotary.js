const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can create a Star', async() => {
    let instance = await StarNotary.deployed();

    let tokenRes = await instance.createStar('Awesome Star!', { from: owner });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];
    let tokenInfo = await instance.tokenIdToStarInfo.call(tokenId);

    assert.equal(tokenInfo, 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    
    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });
    
    assert.equal(await instance.starsForSale.call(tokenId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });

    let user2 = accounts[2];
    let balance = web3.utils.toWei(".05", "ether");
    
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(tokenId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];
    
    let starPrice = web3.utils.toWei(".01");
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });

    let user2 = accounts[2];
    let balance = web3.utils.toWei(".05");

    await instance.buyStar(tokenId, {from: user2, value: balance});
    
    assert.equal(await instance.ownerOf.call(tokenId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    let starPrice = web3.utils.toWei(".01");
    await instance.putStarUpForSale(tokenId, starPrice, { from: user1 });

    let user2 = accounts[2];
    let balance = web3.utils.toWei(".05");

    let balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(tokenId, { from: user2, value: balance, gasPrice: 0 });
    let balanceOfUser2AfterTransaction = await web3.eth.getBalance(user2);

    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceOfUser2AfterTransaction);

    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', {from: user1});
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let starNotarySymbol = await instance.symbol.call();
    assert.equal(starNotarySymbol, "STAR");

    let starNotaryName = await instance.name.call();
    assert.equal(starNotaryName, "StarItem");
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let tokenRes1 = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId1 = tokenRes1.logs[0].args.tokenId.words[0];

    let user2 = accounts[2];
    let tokenRes2 = await instance.createStar('Awesome Star!', { from: user2 });
    let tokenId2 = tokenRes2.logs[0].args.tokenId.words[0];

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    let ownerTokenId1Before = await instance.ownerOf(tokenId1);
    let ownerTokenId2Before = await instance.ownerOf(tokenId2);
    await instance.exchangeStars(tokenId1, tokenId2, { from: user1 });
    let ownerTokenId1After = await instance.ownerOf(tokenId1);
    let ownerTokenId2After = await instance.ownerOf(tokenId2);

    // 3. Verify that the owners changed
    assert.equal(ownerTokenId1Before, ownerTokenId2After);
    assert.equal(ownerTokenId2Before, ownerTokenId1After);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    // 2. use the transferStar function implemented in the Smart Contract
    let ownerTokenIdBefore = await instance.ownerOf(tokenId);
    let user2 = accounts[2];
    await instance.transferStar(user2, tokenId, { from: user1 });
    let ownerTokenIdAfter = await instance.ownerOf(tokenId);

    // 3. Verify the star owner changed.
    assert.notEqual(ownerTokenIdBefore, ownerTokenIdAfter);
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();

    // 1. create a Star with different tokenId
    let user1 = accounts[1];
    let tokenRes = await instance.createStar('Another awesome Star!', { from: user1 });
    let tokenId = tokenRes.logs[0].args.tokenId.words[0];

    // 2. Call your method lookUptokenIdToStarInfo
    let starInfo = await instance.lookUptokenIdToStarInfo(tokenId, { from: user1 })

    // 3. Verify if you Star name is the same
    assert.equal(starInfo, 'Another awesome Star!');
});