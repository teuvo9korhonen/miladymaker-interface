//connect to MetaMask
document.getElementById("connect").onclick = function(){
	this.disabled = true;
	const msg = document.getElementById("message");
	if(!window.ethereum || !window.ethereum.isMetaMask){
		msg.innerHTML = "MetaMask was not detected. Please <a href='https://metamask.io/'>Install MetaMask</a> to continue."; 
		return;
	}
	
	if(window.ethereum.isConnected()){
		start();
		return;
	}
	
	ethereum.on("connect", start);
	msg.innerHTML = "Connecting to MetaMask....";

}
//begin basic eth operations
var wallet = null;
function start(){

	const msg = document.getElementById("message");
	msg.innerHTML = "Connected to MetaMask.";
	
	window.ethereum.request({	method: "eth_requestAccounts" })
		.then( function( accounts ){
			msg.innerHTML = "Connected to MetaMask. Wallet ID: " + accounts[0];
			wallet = accounts[0];
			buy_init();
		})
		.catch( function(error){
			if(error.code == 4001){
				msg.innerHTML = "MetaMask declined request.";
			}
			else{
				msg.innerHTML = error.message;
			}
		});

	const web3 = new Web3(window.ethereum);
	if(!web3){
		msg.innerHTML = "web3.js errror.";
		return;
	}
	
	contract = new web3.eth.Contract(ABI, ADDRESS);
	if(!contract){
		msg.innerHTML = "could not read contract at " + ADDRESS;
		return;
	}
	
	const mint_msg = document.getElementById("mint_count");
	contract.methods.totalSupply().call()
		.then(function(total_supply){
			mint_msg.innerHTML = "Miladys minted: " + total_supply + "/10000";
		})
		.catch(function(error){
			mint_msg.innerHTML = error.message;
		});
	
	
}
//mint miladys
function buy_init(){
		
	document.getElementById("buy1").innerHTML = "<button class='mint-button'>Mint one milady (0.08 ETH)</button>";
	document.getElementById("buy1").onclick = function(){buy(1);}
	document.getElementById("buy5").innerHTML = "<button class='mint-button'>Mint 5 milady (0.375 ETH) (0.075 ETH each)</button>";
	document.getElementById("buy5").onclick = function(){buy(5);}
	document.getElementById("buy15").innerHTML = "<button class='mint-button'>Mint 15 milady (1.05 ETH) (0.07 ETH each)</button>";
	document.getElementById("buy15").onclick = function(){buy(15);}
	document.getElementById("buy30").innerHTML = "<button class='mint-button'>Mint 30 milady (1.8 ETH) (0.06 ETH each)</button>";
	document.getElementById("buy30").onclick = function(){buy(30);}
}

function get_milady_price(n) {
    if (n === 30) {
      return BigNumber("60000000000000000"); // 0.06 ETH
    } else if (n === 15) {
      return BigNumber("70000000000000000"); // 0.07 ETH
    } else if (n === 5) {
      return BigNumber("75000000000000000"); // 0.075 ETH
    } else {
      return BigNumber("80000000000000000"); // 0.08 ETH
    }
  }


async function buy(n){

	if(!wallet){
		return;
	}

	const web3 = new Web3(window.ethereum);
	contract = new web3.eth.Contract(ABI, ADDRESS);
	const price = get_milady_price(n).multipliedBy(n);
	
	//var gas_price = await window.ethereum.request({ method: "eth_gasPrice", params: [], });
	//alert(gas_price.toString(10));
	const gas_price = await web3.eth.getGasPrice();
	
	var gas = 0;
	try{
		gas = await contract.methods.mintMiladys(n).estimateGas({ gasPrice: gas_price , from: wallet, value: price })
		
	}
	catch{
		
		var gas_est = 0.015;
		if(n == 30){
		
			gas_est = 0.22;
		}
		else if ( n == 15){
				gas_est = 0.11;
		}
		else if ( n == 5){	
				gas_est = 0.045;
		}

		gas = Math.floor(BigNumber(gas_est).multipliedBy("1e18").dividedBy(gas_price).toNumber());
	}
	
		
	contract.methods.mintMiladys(n).send({ gas: gas, from: wallet, gasPrice: gas_price.toString(), value: price,   });
}
