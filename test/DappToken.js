const DappToken = artifacts.require("DappToken");

contract('DappToken', function(accounts){

	it('sets the total sumply upon deployment', function(){
		return DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply){
			assert.equal(totalSupply.toNumber(), 1000000, 'the total number supply must be 1M');
		});
	});
})



