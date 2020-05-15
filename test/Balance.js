const Balance = artifacts.require("Balance");

contract('Balance', function(accounts){

	var balanceInstance;

	/*it('check correct values', function(){
		return Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.addClaim(10, {from: accounts[0]});
		}).then(function(receipt){
			return balanceInstance.claims(accounts[0]);
		}).then(function(amount){
			assert.equal(amount, 10, 'claim amount must be equal.');
		});
	});*/

	it('testing function ADDCLAIM', function(){
		return Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.addClaim(20, {from:accounts[1]});
		}).then(function(receipt){
			return balanceInstance.childClaims(accounts[1], 0);
		}).then(function(claim){
			assert.equal(claim.index, 0, '-addClaim- INDEX INCORRECT');
			assert.equal(claim.day, 15, '-addClaim- DAY INCORRECT');
			assert.equal(claim.month, 5, '-addClaim- MONTH INCORRECT');
			assert.equal(claim.year, 2020, '-addClaim- YEAR INCORRECT');
			assert.equal(claim.amount, 20, '-addClaim- AMOUNT INCORRECT');
			return balanceInstance.claims(claim.index);
		}).then(function(address){
			assert.equal(address, accounts[1], '-addClaim- ADDRESSES INCORRECT');
			return balanceInstance.numClaims();
		}).then(function(numberOfClaims){
			assert.equal(numberOfClaims.toNumber(), 1, '-addClaim- NUMCLAIMS INCORRECT');
			balanceInstance.addClaim(40, {from:accounts[1]});
			return balanceInstance.numClaims();
		}).then(function(numberOfClaims){
			assert.equal(numberOfClaims.toNumber(), 2, '-addClaim- NUMCLAIMS INCORRECT');
		});
	});

	it('testing function GETCLAIMS', function(){
		return Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.listClaims();
		}).then(function(result){
			assert.equal(result[0][1], 1, '-listClaims- INDEX INCORRECT');
			assert.equal(result[1][1], 15, '-listClaims- DAY INCORRECT');
			assert.equal(result[2][1], 5, '-listClaims- MONTH INCORRECT');
			assert.equal(result[3][1], 2020, '-listClaims- YEAR INCORRECT');
			assert.equal(result[4][1], 40, '-listClaims- AMOUNT INCORRECT');
		});
	});

	it('testing function DELETECLAIM', function(){
		return Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.numClaims();
		}).then(function(numClaims){
			assert.equal(numClaims.toNumber(), 2, '-deleteClaim- NUMCLAIMS INCORRECT');
			return balanceInstance.childClaims(accounts[1], 0);
		}).then(function(claim){
			assert.equal(claim.index, 0, '-deleteClaim- INDEX INCORRECT');
			assert.equal(claim.day, 15, '-deleteClaim- DAY INCORRECT');
			assert.equal(claim.month, 5, '-deleteClaim- MONTH INCORRECT');
			assert.equal(claim.year, 2020, '-deleteClaim- YEAR INCORRECT');
			assert.equal(claim.amount, 20, '-deleteClaim- AMOUNT INCORRECT');
			balanceInstance.deleteClaim(0);
			return balanceInstance.childClaims(accounts[1], 0);
		}).then(function(claim){
			return balanceInstance.numClaims();
		}).then(function(numClaims){
			assert.equal(numClaims.toNumber(), 1, '-deleteClaim- NUMCLAIMS INCORRECT');
		});
	});


});