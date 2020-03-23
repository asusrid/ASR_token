const DappToken = artifacts.require("DappToken");

module.exports = function(deployer) {
	//passing arguments to the constructor
	deployer.deploy(DappToken, 1000000);
};
