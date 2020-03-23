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
});



