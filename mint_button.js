"use strict";
const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

const MintButton = () => {
  const [minted, setMinted] = useState(false);

  if (minted) {
    return "Mint Test Complete";
  }

  return e("button", { onClick: () => setMinted(true) }, "Mint Control");
};

const domContainer = document.querySelector("#mint_button_c");
ReactDOM.render(e(MintButton), domContainer);

/* CODE HERE TO TRY

export default function Mint() {

  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false)

  const [walletAddress, setWalletAddress] = useState(null)

  // FOR MINTING
  const [HOW_MANY_MILADY, set_HOW_MANY_MILADY] = useState(1)

  const [miladyContract, setmiladyContract] = useState(null)

  // INFO FROM SMART Contract

  const [totalSupply, setTotalSupply] = useState(0)

  const [saleStarted, setSaleStarted] = useState(false)

  const [miladyPrice, setMiladyPriceNFT] = useState(0)

  useEffect( async() => { 

    signIn()

  }, [])

  async function signIn() {
    if (typeof window.web3 !== 'undefined') {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
     
    } else {
      alert("No ETH Interface plugged. Using read-only.");
    }

    window.ethereum.enable()
      .then(function (accounts) {
        window.web3.eth.net.getNetworkType()
        // checks if connected network is mainnet (change this to rinkeby if you wanna test on testnet)
        .then((network) => {console.log(network);if(network != "main"){alert("You are on " + network+ " network. Change network to mainnet or you won't be able to do anything here")} });  
        let wallet = accounts[0]
        setWalletAddress(wallet)
        setSignedIn(true)
        callContractData(wallet)

  })
  .catch(function (error) {
  // Handle error. Likely the user rejected the login
  console.error(error)
  })
  }

//

  async function signOut() {
    setSignedIn(false)
  }
  
  async function callContractData(wallet) {
    // let balance = await web3.eth.getBalance(wallet);
    // setWalletBalance(balance)
    const miladyContract = new window.web3.eth.Contract(ABI, ADDRESS)
    setmiladyContract(miladyContract)

    const salebool = await miladyContract.methods.saleIsActive().call() 
    // console.log("saleisActive" , salebool)
    setSaleStarted(salebool)

    const totalSupply = await miladyContract.methods.totalSupply().call() 
    setTotalSupply(totalSupply)

    const miladyPrice = await miladyContract.methods.miladyPrice().call() 
    setMiladyPriceNFT(miladyPrice)
   
  }
  
  async function mintMiladys(HOW_MANY_MILADY) {
    if (miladyContract) {
 
      const price = Number(miladyPrice)  * HOW_MANY_MILADY 

      const gasAmount = await miladyContract.methods.mintMiladyNFT(HOW_MANY_MILADY).estimateGas({from: walletAddress, value: price})
      console.log("estimated gas",gasAmount)

      console.log({from: walletAddress, value: price})

      miladyContract.methods
            .mintMiladyNFT(HOW_MANY_MILADY)
            .send({from: walletAddress, value: price, gas: String(gasAmount)})
            .on('transactionHash', function(hash){
              console.log("transactionHash", hash)
            })
          
    } else {
        console.log("Wallet not online.")
    }
    
  };

  



  return (
<div>
    <div id="start">
      <!-- Connect code here --> 
      <div className="connect-to-button">
      {!signedIn ? <button onClick={signIn} className="">Purchase with Metamask</button>
            :
            <button onClick={signOut} className="">Connected Wallet: {walletAddress}</button>
      }

      <input 
                                      type="number" 
                                      min="1"
                                      max="10"
                                      value={HOW_MANY_MILADY}
                                      onChange={ e => set_HOW_MANY_MILADY(e.target.value) }
                                      name="" 
                                      className="Verdana pl-4 text-4xl  inline bg-grey-lighter  py-2 font-normal rounded text-grey-darkest  font-bold"
      />
        {saleStarted ? 
                <button onClick={() => mintmilady(HOW_MANY_MILADY)} className="#">MINT {HOW_MANY_MILADY} miladys for {(miladyPrice * HOW_MANY_MILADY) / (10 ** 18)} ETH + GAS</button>        
                  : <button className="mt-4 Verdana text-4xl border-6 bg-blau  text-white hover:text-black p-2 ">System Offline.</button>        
            
              }
      </div>
    </div>
</div>

          
         
                
    )
  }

  */
