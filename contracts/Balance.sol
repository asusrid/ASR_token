pragma solidity >=0.4.21 <0.7.0;



contract Balance {


	mapping(address => address[]) public family;
	mapping(address => uint[]) public claims;
	mapping(uint => address) public children;

	uint public numClaims;
	uint public numChild;


	event Claim (
		uint indexed _numClaim
	);

	constructor () public {
	}

	function addClaim(uint _tokenClaim) public {
		numClaims ++;
		claims[msg.sender].push(_tokenClaim);
		emit Claim(numClaims);
	}

	function getClaim(uint _index) public view returns (uint) {
        return claims[msg.sender][_index];
    }

    function addChild(address _childAddress) public {
    	numChild ++;
    	children[numChild] = _childAddress; 
    }

}