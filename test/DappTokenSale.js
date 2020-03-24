const DappTokenSale = artifacts.require("DappTokenSale");


contract('DappTokenSale', function(accounts){

	var tokenInstance;
	// IN WEI UNITS
	var tokenPrice = 1000000000000000; 

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

});