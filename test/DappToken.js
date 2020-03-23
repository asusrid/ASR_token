const DappToken = artifacts.require("DappToken");

contract('DappToken', function(accounts){

	var tokenInstance;

	it('sets the total sumply upon deployment', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), 1000000, 'the total number supply must be 1M');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance){
			assert.equal(adminBalance.toNumber(), 1000000, 'the total number supply must be 1M');
		});
	});
})



