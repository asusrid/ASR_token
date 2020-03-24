pragma solidity >=0.4.21 <0.7.0;

import "./DappToken.sol";

contract DappTokenSale{

	// its gonna be written into the blockchain
	address admin;
	DappToken public tokenContract;
	uint256 public tokenPrice;

	constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}
}