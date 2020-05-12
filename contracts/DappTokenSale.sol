pragma solidity >=0.4.21 <0.7.0;

import "./DappToken.sol";

contract DappTokenSale{

	// its gonna be written into the blockchain
	address payable admin;
	DappToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokenSold;

	event Sell(
		address _buyer,
		uint256 _amount
	);
	
	constructor (DappToken _tokenContract, uint256 _tokenPrice) public {
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	function multiply(uint x, uint y) internal pure returns(uint z){
		require(y == 0 || (z = x * y) / y == x);
	}

	function buyTokens(uint256 _numberOfTokens) public payable{
		require(msg.value == multiply(_numberOfTokens, tokenPrice));
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		require (tokenContract.transfer(msg.sender, _numberOfTokens));
		
		tokenSold += _numberOfTokens;

		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale() public {
		require(msg.sender == admin);
		require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
		selfdestruct(admin);
	}


	// AUXILIARY FUNCTIONS

	/*function parseAddr(string memory _a) internal pure returns (address _parsedAddress) {
	    bytes memory tmp = bytes(_a);
	    uint160 iaddr = 0;
	    uint160 b1;
	    uint160 b2;
	    for (uint i = 2; i < 2 + 2 * 20; i += 2) {
	        iaddr *= 256;
	        b1 = uint160(uint8(tmp[i]));
	        b2 = uint160(uint8(tmp[i + 1]));
	        if ((b1 >= 97) && (b1 <= 102)) {
	            b1 -= 87;
	        } else if ((b1 >= 65) && (b1 <= 70)) {
	            b1 -= 55;
	        } else if ((b1 >= 48) && (b1 <= 57)) {
	            b1 -= 48;
	        }
	        if ((b2 >= 97) && (b2 <= 102)) {
	            b2 -= 87;
	        } else if ((b2 >= 65) && (b2 <= 70)) {
	            b2 -= 55;
	        } else if ((b2 >= 48) && (b2 <= 57)) {
	            b2 -= 48;
	        }
	        iaddr += (b1 * 16 + b2);
	    }
	    return address(iaddr);
	}*/







}