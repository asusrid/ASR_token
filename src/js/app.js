
App = {

	web3Provider: null,
	contracts: {},
	account: "0x0",
	loading: false,
	tokenPrice: 1000000000000000,
	tokenSold: 0,
	tokensAvailable: 750000,
	accounts: {},

	init: function(){
		console.log("App initialized...")
		return App.initWeb3();
	},

	initWeb3: function(){
		if(typeof web3 !== "undefined") {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else { 
			// pointing to the blockchain (in this case ganache)
			App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
			web3 = new Web3(App.web3Provider);
		}
		var ver = web3.version.api;
		//console.log("version: ", ver);

		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("DappTokenSale.json", function(dappTokenSale){
			App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
			App.contracts.DappTokenSale.setProvider(App.web3Provider);
			App.contracts.DappTokenSale.deployed().then(function(instance){
				console.log("ASR token sale", instance.address);
			});
		}).then(function(){
			$.getJSON("DappToken.json", function(dappToken){
				App.contracts.DappToken = TruffleContract(dappToken);
				App.contracts.DappToken.setProvider(App.web3Provider);
				App.contracts.DappToken.deployed().then(function(instance){
					console.log("ASR token", instance.address);
				});
			});
		}).done(function(){
			$.getJSON("Balance.json", function(balance){
				App.contracts.Balance = TruffleContract(balance);
				App.contracts.Balance.setProvider(App.web3Provider);
				App.contracts.Balance.deployed().then(function(instance){
					console.log("Balance", instance.address);
				});
				App.listenForEvents();	
				return App.render();
			});		
		})
	},


	listenForEvents: function() {
		App.contracts.DappTokenSale.deployed().then(function(instance){
			instance.Sell({}, {
				fromBlock: 'latest',
			}).watch(function(err, event){
				if(!err){
					console.log("Event sell triggered!!", event);
					//alert("Purchase made!")
					App.render();
				}
			});

		});

		App.contracts.Balance.deployed().then(function(instance){
			instance.eventClaim({}, {
				fromBlock: 'latest',
			}).watch(function(err, event){
				if(!err){
					console.log("Event claim triggered!!", event);
					App.render();
				}
			});
		});
	},


	// function to show everything in the page
	render: function(){
		if (App.loading){
			return;
		}
		App.loading = true;		


		loader = $("#loader");
		content = $("#content");

		loader.show();
		content.hide();

		// show account data in web page
		web3.eth.getCoinbase(function(err, account){
			if(err == null){
				App.account = account;
				$("#accountAddress").html(account);
				console.log("Account: " + account);

				
				App.contracts.Balance.deployed().then(function(instance){
					balanceInstance = instance;
					return balanceInstance.numChild();
				}).then(function(numChild){
					let numUser = 0;
					let found = false;
					for(var i = 0; i < numChild; i++){
						balanceInstance.children(i).then(function(address){
							numUser ++;
							if(account == address) { 

								found = true;

								// ************ CHILD 1 AND 2 *************
								console.log(numUser)
								$('#content-user' + numUser).css('border', '2px solid lightblue');
								let dappBalance = $('.dapp-balance'+ numUser);
								dappBalance.empty();

								App.contracts.DappToken.deployed().then(function(instance) {
									dappTokenInstance = instance;
									return dappTokenInstance.balanceOf(App.account);
								}).then(function(balance) {
									dappBalance.html(balance.toNumber());
									App.loading = false;
									loader.hide();
									content.show();
								});

							} else if(!found && numUser == numChild){

								// **************  ADMIN  *************
								$('#content-user0').css('border', '2px solid lightblue');

								App.giveMyAccountAndProgressBar();
								App.giveBalances();
								App.giveTransferOperation();
								App.giveClaims();
							}
						});
					}
				});
			} else { 
				console.err(err);
			}
		});
		
	},


	buyTokens: function() {
		content.hide();
		loader.show();
		let  numberOfToken = $('#numberOfTokenBuy').val();
		App.contracts.DappTokenSale.deployed().then(function(instance){
			return instance.buyTokens(numberOfToken, {
				from: App.account,
				value: numberOfToken * App.tokenPrice,
				gas: 500000
			});
		}).then(function(result){
			console.log('Tokens boughts...');
			$('form').trigger('reset');
			loader.hide();
			content.show();
		});
	},

	transferTo: function() {
		content.hide();
		loader.show();

		let numberOfToken = $('#numberOfTokenTransfer').val();
		let toAccount = $("#childrenSelect").val();
		let tokenInstance;

		// ESTE CODIGO Y EL DE MAS ABAJO SE REPITEN
		App.contracts.DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer(toAccount, numberOfToken, {
				from: App.account,
				gas: 500000
			});
		}).then(function(result){
			console.log('Transfer done...');
			$('form').trigger('reset');
			loader.hide();
			content.show();
		})
	},

	addClaim: function(idUser) {
		content.hide();
		loader.show();

		let numberOfToken = $('#numberOfTokenClaim'+idUser).val();
		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.addClaim(numberOfToken, {
				from: App.account,
				gas: 500000
			});
		}).then(function(result){
			console.log('Claim requested...');
			$('form').trigger('reset');
			loader.hide();
			content.show();
		})
	},

	transferClaim: function(idClaim, amount) {
		content.hide();
		loader.show();

		let numberOfToken = amount;
		let toAccount = $("#childAddressClaim").val();
		let tokenInstance;

		App.contracts.DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer(toAccount, numberOfToken, {
				from: App.account,
				gas: 500000
			});
		}).then(function(result){
			console.log('Transfer claim done...');
			if(result){
				App.rejectClaim(idClaim);
			}
		})
	},

	rejectClaim: function(idClaim) {
		content.hide();
		loader.show();

		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.deleteClaim(idClaim);
		}).then(function(result){
			console.log('Claim rejected...');
			if(result){
				loader.hide();
				content.show();
			}
		})
	},

	

	giveMyAccountAndProgressBar: function() {

		App.contracts.DappTokenSale.deployed().then(function(instance){
			dappTokenSaleInstance = instance;
			return dappTokenSaleInstance.tokenPrice();
		}).then(function(tokenPrice){
			App.tokenPrice = tokenPrice;
			$('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
			return dappTokenSaleInstance.tokenSold();
		}).then(function(tokenSold){
			App.tokenSold = tokenSold.toNumber();
			$('.tokens-sold').html(App.tokenSold);
			$('.tokens-available').html(App.tokensAvailable);
			
			let progressPercent = (App.tokenSold / App.tokensAvailable) * 100;
			$('#progress').css('width', progressPercent + '%');
		
			// Load token contract
			App.contracts.DappToken.deployed().then(function(instance) {
				dappTokenInstance = instance;
				return dappTokenInstance.balanceOf(App.account);
			}).then(function(balance) {
				$('.dapp-balance'+0).html(balance.toNumber());
				App.loading = false;
				loader.hide();
				content.show();
			})
		});
	},

	giveBalances: function() {

		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.numChild();
		}).then(function(numChild){
			let balanceResult = $("#resultBalance");
      		balanceResult.empty();
      		let numUser = 0;
			for(var i = 0; i < numChild; i++){
				balanceInstance.children(i).then(function(address){
					address = address;
					App.contracts.DappToken.deployed().then(function(instance){
						dappTokenInstance = instance;
						return dappTokenInstance.balanceOf(address)
					}).then(function(balance){
						numUser ++;
						let balanceTemplate = "<tr>"+
												"<td> Child "+ numUser +"</td>"+
												"<td>" + balance + "</td>"+
											"</tr>";
  						balanceResult.append(balanceTemplate);
					});
				});
			}
		});
	},

	giveTransferOperation: function() {

		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.numChild();
		}).then(function(numChild){
			let candidatesSelect = $("#childrenSelect");
      		candidatesSelect.empty();
      		let numUser = 0;
			for(var i = 0; i < numChild; i++){
				balanceInstance.children(i).then(function(address){
					numUser ++;
					let candidateOption = "<option value='" + address + "'> Child " + numUser + "</option>";
          			candidatesSelect.append(candidateOption);
				});
			}
		});
	},

	giveClaims: function() {

		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			return balanceInstance.numClaims();
		}).then(function(numberOfClaims){
			numClaims = numberOfClaims;
			return balanceInstance.listClaims();
		}).then(function(claims){
			if(numClaims != 0) {
				let claimsResult = $("#resultClaims");
				claimsResult.empty();
				for(var i = 0; i < numClaims; i++){
					var claimTemplate = 
					"<tr>"+
						"<td>"+ claims[0][i] +"<input type='hidden' id='childAddressClaim' value='" + claims[5][i] + "'/></td>"+
						"<td>"+ claims[1][i] + "/" + claims[2][i] + "/" + claims[3][i] + "</td>"+
						"<td>" + claims[4][i] + "</td>"+
						"<td class='text-center'>" +
							"<form onSubmit='App.transferClaim("+claims[0][i]+","+claims[4][i]+"); return false;' role='form' style='display: inline-block;'>" + 
								"<button type='submit' class='btn btn-primary btn-sm'>Send</button>" +
							"</form>" +
							"<form onSubmit='App.rejectClaim("+claims[0][i]+"); return false;' role='form' style='display: inline-block; margin-left: 10%;'>" + 
								"<button type='submit' class='btn btn-primary btn-sm'>Reject</button>" +
							"</form>" +
						"</td>" +
					"</tr>";
  					claimsResult.append(claimTemplate);
				}
			}
		});
	},

	



	/*getAccounts: function(callback) {
	    web3.eth.getAccounts((error,result) => {
	        if (error) {
	            console.log(error);
	        } else {

	            //callback(result);
	        }
    	});
	},*/

}

$(function(){
	$(window).on("load",function(){
		App.init();
	})
});

