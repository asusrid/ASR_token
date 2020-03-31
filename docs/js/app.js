
App = {

	web3Provider: null,
	contracts: {},
	account: "0x0",
	loading: false,
	tokenPrice: 1000000000000000,
	tokenSold: 0,
	tokensAvailable: 750000,

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
		console.log("version: ", ver);

		return App.initContracts();
	},

	initContracts: function() {
		$.getJSON("DappTokenSale.json", function(dappTokenSale){
			App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
			App.contracts.DappTokenSale.setProvider(App.web3Provider);
			App.contracts.DappTokenSale.deployed().then(function(dappTokenSale){
				console.log("ASR token sale", dappTokenSale.address);
			});
		}).done(function(){
			$.getJSON("DappToken.json", function(dappToken){
				App.contracts.DappToken = TruffleContract(dappToken);
				App.contracts.DappToken.setProvider(App.web3Provider);
				App.contracts.DappToken.deployed().then(function(dappToken){
					console.log("ASR token sale", dappToken.address);
				});	
				App.listenForEvents();	
				return App.render();
			});				
		});
	},


	listenForEvents: function() {
		App.contracts.DappTokenSale.deployed().then(function(instance){
			instance.Sell({}, {
				fromBlock: 0,
				toBlock: 'latest',

			}).watch(function(err, event){
				console.log("event triggered", event);
				App.render();
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
				console.log("account", account);
				App.account = account;
				$("#accountAddress").html("Your account " + account);
			}
		});


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
				$('.dapp-balance').html(balance.toNumber());
				App.loading = false;
				loader.hide();
				content.show();
			})
		});
	},

	buyTokens: function() {
		$('#content').hide();
		$('#loader').show();
		let  numberOfToken = $('#numberOfToken').val();
		App.contracts.DappTokenSale.deployed().then(function(instance){
			console.log("App account", App.account);
			return instance.buyTokens(numberOfToken, {
				from: App.account,
				value: numberOfToken * App.tokenPrice,
				gas: 500000
			});
		}).then(function(result){
			console.log('Tokens boughts...');
			$('form').trigger('reset');
			$('#loader').hide();
			$('#content').show();
		});
	}

}

$(function(){
	$(window).load(function(){
		App.init();
	})
});

