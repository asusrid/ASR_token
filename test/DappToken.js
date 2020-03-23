const DappToken = artifacts.require("DappToken");

contract('DappToken', function(accounts){

	var tokenInstance;

	it('it initializes the contract with the correct values', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name){
			assert.equal(name, 'Dapp Token asusrid', 'It has NOT the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol){
			assert.equal(symbol, 'ASR', 'It has NOT the correct symbol');
			return tokenInstance.standard();
		}).then(function(standard){
			assert.equal(standard, 'ASR Token v1.0', 'It has NOT the correct version standard');
		});
	});

	it('it allocates the initial sumply upon deployment', function(){
		// instance is the value returned by the previous function
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		// totalSupply is the value returned by the previous function
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), 1000000, 'the total number supply must be 1M');
			return tokenInstance.balanceOf(accounts[0]);
		// adminBalance is the value returned by the previous function
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(), 1000000, 'the total number supply must be 1M');
		});
	});

	it('transfers token ownership', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			// with call we trigger a transaction with no cost
			// it will return the real value of the function
			return tokenInstance.transfer.call(accounts[1], 100000000);
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >=0, 'Error message must contain revert');
			return tokenInstance.transfer.call(accounts[1], 250, {from: accounts[0]});
		}).then(function(success){
			assert.equal(success, true, 'Something went wrong in Transfer function');
			// triggers a transaction with COST
			return tokenInstance.transfer(accounts[1], 250, {from: accounts[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Incorrect event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'Incorrect origin account');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'Incorrect destination account');
			assert.equal(receipt.logs[0].args._value, 250, 'Incorrect value');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 250, 'Not well added to the destinatary account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 999750, 'Not well substracted from the origin account');
		});
	});



});



