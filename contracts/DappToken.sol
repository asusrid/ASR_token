pragma solidity >=0.4.21 <0.7.0;



contract DappToken {

	string public name = 'Dapp Token asusrid';
	string public symbol = 'ASR';
	string public standard = 'ASR Token v1.0';
	uint256 public totalSupply;

	event Transfer (
		address indexed _from,
		address indexed _to,
		uint256 _value
	);

	mapping (address => uint256) public balanceOf;


	// Constructor (set the number of tokens we need)
	// Set the total number of tokens
	// Read the total number of tokens
	constructor (uint256 _initialSupply) public {
		totalSupply = _initialSupply;
		// allocate the initial supply
		balanceOf[msg.sender] = _initialSupply;
	}


	// Tranfer function
	// Exception (not enough tokens)
	// Return boolean
	// Transfer event
	function transfer(address _to, uint256 _value) public returns(bool success){

		require(balanceOf[msg.sender] >= _value);

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		emit Transfer(msg.sender, _to, _value);

	}

	 


} 