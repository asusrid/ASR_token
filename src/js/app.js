
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
					console.log("event sell triggered", event);
					//alert("Purchase made!")
					App.render();
				}
			});

		});

		App.contracts.Balance.deployed().then(function(instance){
			instance.Claim({}, {
				fromBlock: 'latest',
			}).watch(function(err, event){
				if(!err){
					console.log("event claim triggered", event);
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


		let loader = $("#loader");
		let content = $("#content");
		

		loader.show();
		content.hide();

		// show account data in web page
		web3.eth.getCoinbase(function(err, account){
			if(err == null){
				App.account = account;
				$("#accountAddress").html(account);

				App.contracts.Balance.deployed().then(function(instance){
					balanceInstance = instance;
					return balanceInstance.numChild();
				}).then(function(numChild){
					let numUser = 0;
					let found = false;
					for(var i = 1; i <= numChild; i++){
						balanceInstance.children(i).then(function(address){
							numUser ++;

							if(account == address) { 

								found = true;
								// ************ CHILD 1 AND 2 *************
								
								$('#content-user' + numUser).css('border', '2px solid lightblue');
								let dappBalance = $('.dapp-balance'+ numUser);

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

								$('#content-user' + 0).css('border', '2px solid lightblue');

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

								App.contracts.Balance.deployed().then(function(instance){
									balanceInstance = instance;
									claimsResult = $("#resultClaims");
						      		claimsResult.empty();
									return balanceInstance.numClaims();
								}).then(function(numClaims){
									console.log("NumClaims: " + numClaims);
									if(numClaims != 0) {
										for(var i = 0; i < numClaims; i++){
											// NO FUNCIONA A PARTIR DE AQUI
											balanceInstance.getClaim(i).then(function(amount){
												var claimTemplate = "<tr><td><span class='idChildClaim'></span>New</td><td><span id='childClaim'></span>" + amount + "</td></tr>";
						      					claimsResult.append(claimTemplate);
											});
										}
									} else { 
										var claimTemplate = "<tr><td><span id='idChildClaim'></span>No Claims Yet</td><td><span id='childClaim'></span> - </td></tr>";
										claimsResult.append(claimTemplate);
									}
								});


								App.contracts.Balance.deployed().then(function(instance){
									balanceInstance = instance;
									return balanceInstance.numChild();
								}).then(function(numChild){
									var candidatesSelect = $("#childrenSelect");
						      		candidatesSelect.empty();
						      		let numUser = 0;
									for(var i = 1; i <= numChild; i++){
										balanceInstance.children(i).then(function(address){
											numUser ++;
											var candidateOption = "<option value='" + address + "'> Child " + numUser + "</option>";
						          			candidatesSelect.append(candidateOption);
										});
									}
								});


								App.contracts.Balance.deployed().then(function(instance){
									balanceInstance = instance;
									return balanceInstance.numChild();
								}).then(function(numChild){
									balanceResult = $("#resultBalance");
						      		balanceResult.empty();
						      		let numUser = 0;
									for(var i = 1; i <= numChild; i++){
										balanceInstance.children(i).then(function(address){
											address = address;
											App.contracts.DappToken.deployed().then(function(instance){
												dappTokenInstance = instance;
												return dappTokenInstance.balanceOf(address)
											}).then(function(balance){
												numUser ++;
												balanceTemplate = "<tr><td><span id='idChildBalance'> Child "+ numUser +"</span></td><td><span id='childBalance'></span>" + balance + "</td></tr>";
						  						balanceResult.append(balanceTemplate);
											});
										});
									}
								});


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
		$('#content').hide();
		$('#loader').show();
		let  numberOfToken = $('#numberOfTokenBuy').val();
		App.contracts.DappTokenSale.deployed().then(function(instance){
			return instance.buyTokens(numberOfToken, {
				from: App.account,
				value: numberOfToken * App.tokenPrice,
				gas: 600000
			});
		}).then(function(result){
			console.log('Tokens boughts...');
			$('form').trigger('reset');
			$('#loader').hide();
			$('#content').show();
		});
	},

	transferFrom: function() {
		$('#content').hide();
		$('#loader').show();

		let numberOfToken = $('#numberOfTokenTransfer').val();
		let toAccount = $("#childrenSelect").val();
		let spendingAccount;
		let tokenInstance;

		App.contracts.DappToken.deployed().then(function(instance){
			tokenInstance = instance;
			return tokenInstance.transfer(toAccount, numberOfToken, {
				from: App.account,
				gas: 500000
			});
		}).then(function(result){
			console.log('Transfer done...');
			$('form').trigger('reset');
			$('#loader').hide();
			$('#content').show();
		})
	},

	addClaim: function() {
		$('#content').hide();
		$('#loader').show();

		let numberOfToken = $('#numberOfTokenClaim').val();
		App.contracts.Balance.deployed().then(function(instance){
			balanceInstance = instance;
			console.log("Number tokens: " + numberOfToken);
			return balanceInstance.addClaim(numberOfToken, {
				from: App.account,
				gas: 500000
			});
		}).then(function(result){
			console.log('Claim requested...');
			$('form').trigger('reset');
			$('#loader').hide();
			$('#content').show();
		})
	},

	getAccounts: function(callback) {
	    web3.eth.getAccounts((error,result) => {
	        if (error) {
	            console.log(error);
	        } else {

	            //callback(result);
	        }
    	});
	},

}

$(function(){
	$(window).on("load",function(){
		App.init();
	})
});

