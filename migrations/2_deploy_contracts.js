const DappToken = artifacts.require("./DappToken");
const DappTokenSale = artifacts.require("./DappTokenSale");
const Balance = artifacts.require("./Balance");


module.exports = function(deployer) {
	//passing arguments to the constructor
	deployer.deploy(DappToken, 1000000).then(function(){
		tokenPrice = 1000000000000000;
		return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
	}).then(function(instance){
		return deployer.deploy(Balance);
	});
};
