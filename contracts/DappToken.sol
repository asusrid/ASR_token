pragma solidity >=0.4.21 <0.7.0;



contract DappToken {

	string public name = 'Dapp Token asusrid';
	string public symbol = 'ASR';
	string public standard = 'ASR Token v1.0';
	uint256 public totalSupply;
	mapping (address => uint256) public balanceOf;


	// Constructor (set the number of tokens we need)
	// Set the total number of tokens
	// Read the total number of tokens
	constructor (uint256 _initialSupply) public {
		totalSupply = _initialSupply;
		// allocate the initial supply
		balanceOf[msg.sender] = _initialSupply;
	}


} 