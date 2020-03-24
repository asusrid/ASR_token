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

	// approve event
	event Approval (
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);

	mapping (address => uint256) public balanceOf;
	// allowance
	mapping(address => mapping(address => uint256)) public allowance;

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
	// Transfer event
	// Return boolean
	function transfer(address _to, uint256 _value) public returns(bool success){

		require(balanceOf[msg.sender] >= _value);

		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		emit Transfer(msg.sender, _to, _value);

		return true;
	}


	// approve function
	function approve(address _spender, uint256 _value) public returns(bool success) {

		allowance[msg.sender][_spender] = _value;

		emit Approval(msg.sender, _spender, _value);		

		return true;
	}

	// transferFrom function
	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success){

		require(_value <= balanceOf[_from]);

		require(_value <= allowance[_from][msg.sender]);

		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		allowance[_from][msg.sender] -= _value;  

		emit Transfer(_from, _to, _value);

		return true;

	}













	 


} 