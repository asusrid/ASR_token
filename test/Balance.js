const Balance = artifacts.require("Balance");

contract('Balance', function(accounts){

	var balanceInstance;

	it('check correct values', function(){
		return Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.addClaim(10, {from: accounts[0]});
		}).then(function(receipt){
			return balanceInstance.claims(accounts[0]);
		}).then(function(amount){
			assert.equal(amount, 10, 'claim amount must be equal.');
		});
	});

});