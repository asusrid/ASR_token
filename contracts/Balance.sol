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
	}

	function listClaims() public view returns (uint[] memory returnIndexes, uint[] memory returnDays, uint[] memory returnMonths, uint[] memory returnYears, uint[] memory returnAmounts, address[] memory returnAddresses) {
		
		uint[] memory claimIndexes = new uint[](numClaims);
		uint[] memory claimDays = new uint[](numClaims);
		uint[] memory claimMonths = new uint[](numClaims);
		uint[] memory claimYears = new uint[](numClaims); 
		uint[] memory claimAmounts = new uint[](numClaims);
		address[] memory claimAddresses = new address[](numClaims); 

		uint j = 0;
		uint k = 0;

		for(uint i = 0; i < numClaims; i++){

			address currentAddress = claims[i];

			if(currentAddress == children[0]){
				claimIndexes[i] = childClaims[currentAddress][j].index;
				claimDays[i] = childClaims[currentAddress][j].day;
				claimMonths[i] = childClaims[currentAddress][j].month;
				claimYears[i] = childClaims[currentAddress][j].year;
				claimAmounts[i] = childClaims[currentAddress][j].amount;
				claimAddresses[i] = currentAddress;

				j++;
				
			} else {
				claimIndexes[i] = childClaims[currentAddress][k].index;
				claimDays[i] = childClaims[currentAddress][k].day;
				claimMonths[i] = childClaims[currentAddress][k].month;
				claimYears[i] = childClaims[currentAddress][k].year;
				claimAmounts[i] = childClaims[currentAddress][k].amount;
				claimAddresses[i] = currentAddress;

				k++;
			}
		}

		return(claimIndexes, claimDays, claimMonths, claimYears, claimAmounts, claimAddresses);
	}

	function deleteClaim(uint _numClaim) public returns(bool){

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

		return true;
	}

    function addChild(address _childAddress) public {
    	children[numChild] = _childAddress; 
    	numChild ++;
    }

}