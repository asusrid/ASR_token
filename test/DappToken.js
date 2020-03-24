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
			// results of the event triggered
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

	it('approves tokens for delegated transfer', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100, {from: accounts[0]});
		}).then(function(success){
			assert.equal(success, true, 'Approval not succeded');
			return tokenInstance.approve(accounts[1], 100);
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Approval', 'Incorrect event');
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'Incorrect origin account');
			assert.equal(receipt.logs[0].args._spender, accounts[1], 'Incorrect destination account');
			assert.equal(receipt.logs[0].args._value, 100, 'Incorrect value');
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then(function(allowance){
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
		});
	});

	it('handles delegated token transfers', function(){
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
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'Incorrect event');
			assert.equal(receipt.logs[0].args._from, accounts[2], 'Incorrect origin account');
			assert.equal(receipt.logs[0].args._to, accounts[3], 'Incorrect destination account');
			assert.equal(receipt.logs[0].args._value, 10, 'Incorrect value');
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(balance){
			assert.equal(balance.toNumber(), 90);
			return tokenInstance.balanceOf(toAccount);
		}).then(function(balance){
			assert.equal(balance, 10);
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance){
			assert.equal(allowance, 0, 'No more to transfer in the allowance account');
		});
	});





});



