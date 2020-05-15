pragma solidity >=0.4.21 <0.7.0;

import "./BokkyPooBahsDateTimeLibrary.sol";

contract Balance {

	// NEW
	using BokkyPooBahsDateTimeLibrary for uint;

	struct Claim {
		uint index;
		uint day;
		uint month;
		uint year;
		uint amount;
	}

	//mapping(address => uint[]) public claims;
	mapping(uint => address) public children;
	// NEW
	mapping(uint => address) public claims;
	mapping(address => Claim[]) public childClaims;

	uint public numClaims;
	uint public numChild;


	event eventClaim (
		uint indexed _numClaim
	);

	constructor () public {
		numClaims = 0;
	}

	function addClaim(uint _tokenClaim) public returns (bool) {

		uint today = now;
		uint year; 
		uint month; 
		uint day;
		(year, month, day) = today.timestampToDate();

		childClaims[msg.sender].push(Claim({index: numClaims, day: day, month: month, year: year, amount: _tokenClaim}));

		claims[numClaims] = msg.sender;
		numClaims ++;

		emit eventClaim(numClaims);

		return true;
		/*numClaims ++;
		claims[msg.sender].push(_tokenClaim);
		emit Claim(numClaims);*/
	}

	function listClaims() public view returns (uint[] memory returnIndexes, uint[] memory returnDays, uint[] memory returnMonths, uint[] memory returnYears, uint[] memory returnAmounts) {
		
		uint[] memory claimIndexes = new uint[](numClaims);
		uint[] memory claimDays = new uint[](numClaims);
		uint[] memory claimMonths = new uint[](numClaims);
		uint[] memory claimYears = new uint[](numClaims); 
		uint[] memory claimAmounts = new uint[](numClaims); 

		for(uint i = 0; i < numClaims; i++){
			claimIndexes[i] = childClaims[claims[i]][i].index;
			claimDays[i] = childClaims[claims[i]][i].day;
			claimMonths[i] = childClaims[claims[i]][i].month;
			claimYears[i] = childClaims[claims[i]][i].year;
			claimAmounts[i] = childClaims[claims[i]][i].amount;
		}

		return(claimIndexes, claimDays, claimMonths, claimYears, claimAmounts);
	}

	function deleteClaim(uint _numClaim) public {

		address childAddress = claims[_numClaim];

		// DELETE CLAIM FROM CHILDCLAIMS
		for(uint i = 0; i < childClaims[childAddress].length; i++){

			if(childClaims[childAddress][i].index == _numClaim){

				for(uint j = _numClaim; j < childClaims[childAddress].length - 1; j++){
					childClaims[childAddress][j] = childClaims[childAddress][j+1];
				}
				childClaims[childAddress].length--;
			}	
		}

		// UPDATE INDEXES IN CLAIMS AND CHILDCLAIMS
		for(uint i = _numClaim; i < numClaims - 1; i++){

			claims[i] = claims[i + 1];

			for(uint j = 0; j < childClaims[claims[i + 1]].length; j++){
				if(childClaims[claims[i + 1]][j].index == i + 1){
					childClaims[claims[i + 1]][j].index--;
				}	
			}
		}

		numClaims --;
	}

	/*function getClaim(uint _index) public view returns (uint) {
        return claims[msg.sender][_index];
    }

    function getClaimsLength() public view returns (uint) {
        return claims[msg.sender].length;
    }*/

    function addChild(address _childAddress) public {
    	numChild ++;
    	children[numChild] = _childAddress; 
    }

}