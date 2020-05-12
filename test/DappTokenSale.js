const DappTokenSale = artifacts.require("DappTokenSale");
const DappToken = artifacts.require("DappToken");


contract('DappTokenSale', function(accounts){

	var tokenInstance;
	var tokenSaleInstance;
	// IN WEI UNITS
	var tokenPrice = 1000000000000000;
	// 75% of the total supply
	var tokenAvailable = 750000;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tx = accounts[2];
	var numTokens;

	it('initializes the contract with the correct values', function(){
		return DappTokenSale.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.address;
		}).then(function(address){
			assert.notEqual(address, 0x0, 'There is no address for DappTokenInstance');
			return tokenInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'There is no address for DappTokenInstance');
			return tokenInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price, tokenPrice, 'Token price is not correct');
		});
	});

	it('process of buying a token', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenInstance.transfer(tokenSaleInstance.address, tokenAvailable, {from: admin});
		}).then(function(receipt){
			numTokens = 10;
			return tokenSaleInstance.buyTokens(numTokens, {from: buyer, value: numTokens * tokenPrice});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Sell', 'Incorrect event');
			assert.equal(receipt.logs[0].args._buyer, buyer, 'Incorrect buyer account');
			assert.equal(receipt.logs[0].args._amount, numTokens, 'Incorrect number of tokens');
			return tokenSaleInstance.tokenSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(), numTokens, 'The number of tokens sold and the number of tokens actually sold are not the same...');
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(), tokenAvailable - numTokens, 'Not enough tokens');
			return tokenSaleInstance.buyTokens(numTokens, {from: buyer, value: 1});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'msg.value and computed value must be equal');
			return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numTokens * tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'not enough tokens available');
		});
	});

	/*it('finishes sale process', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({from: buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'admin is the responsable to finish a sale');
			return tokenSaleInstance.endSale({from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens');
			return tokenSaleInstance.tokenPrice();	
		}).then(function(price){
			assert.equal(price.toNumber(), 0,'token price was reset');
		});
	});*/




	it('transfering between accounts', function(){

		let balanceBeforeTranfer;

		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];
			return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
		}).then(function(receipt){
			//approve
			return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
		}).then(function(receipt){
			return tokenInstance.transferFrom(fromAccount, toAccount, 10000, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'Balance must be positive');
			return tokenInstance.transferFrom(fromAccount, toAccount, 15, {from: spendingAccount});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'Cannot transfer an amount higher than the approved one');
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(success){
			assert.equal(success, true, 'ASR transfered!');
		});	
	});



	/*it('transfering between accounts', function(){

		let balanceBeforeTranfer;

		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return DappTokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			balanceBeforeTranfer = balance.toNumber();
			console.log("Balance: ", balanceBeforeTranfer);
			return tokenSaleInstance.transferFromBank(buyer, 25, {from:admin,value:25*tokenPrice});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'TransferTo', 'Incorrect event');
			assert.equal(receipt.logs[0].args._to, buyer, 'Incorrect buyer account');
			assert.equal(receipt.logs[0].args._amount, 25, 'Incorrect number of tokens');
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			console.log("Balance 2: ", balance.toNumber());
			assert(balanceBeforeTranfer, balance.toNumber(), 'transferFromBank not done correctly');
		});
	});*/



























});