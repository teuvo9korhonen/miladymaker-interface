"use strict";

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

const Connect = () => {
  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  // FOR MINTING
  const [howMany, setHowMany] = useState(0);
  const [miladyContract, setmiladyContract] = useState(null);

  // INFO FROM SMART CONTRACT
  const [totalSupply, setTotalSupply] = useState(0);
  const [saleStarted, setSaleStarted] = useState(false);
  const [miladyPrice, setMiladyPriceNFT] = useState(0);

  async function signIn() {
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("No ETH interface plugged. Using read-only.");
    }

    window.ethereum
      .enable()
      .then(function (accounts) {
        window.web3.eth.net
          .getNetworkType()
          // checks if connected network is mainnet (change this to rinkeby if you wanna test on testnet)
          .then((network) => {
            console.log(network);
            if (network != "main") {
              alert(
                "You are on " + network + " network. Change network to mainnet or you won't be able to do anything here"
              );
            }
          });
        let wallet = accounts[0];
        setWalletAddress(wallet);
        setSignedIn(true);
        callContractData(wallet);
      })
      .catch(function (error) {
        // Handle error. Likely the user rejected the login
        console.error(error);
      });
  }

  async function signOut() {
    setSignedIn(false);
  }

  async function callContractData(wallet) {
    // let balance = await web3.eth.getBalance(wallet);
    // setWalletBalance(balance)
    const miladyContract = new window.web3.eth.Contract(ABI, ADDRESS);
    setmiladyContract(miladyContract);

    const salebool = await miladyContract.methods.saleIsActive().call();
    // console.log("saleisActive" , salebool)
    setSaleStarted(salebool);

    const totalSupply = await miladyContract.methods.totalSupply().call();
    setTotalSupply(totalSupply);

    const miladyPrice = await miladyContract.methods.miladyPrice().call();
    setMiladyPriceNFT(miladyPrice);
  }

  async function mintMiladys(n) {
    if (miladyContract) {
      const price = Number(miladyPrice) * n;

      const gasAmount = await miladyContract.methods
        .mintMiladyNFT(n)
        .estimateGas({ from: walletAddress, value: price });
      console.log("estimated gas", gasAmount);

      console.log({ from: walletAddress, value: price });

      miladyContract.methods
        .mintMiladyNFT(n)
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", function (hash) {
          console.log("transactionHash", hash);
        });
    } else {
      console.log("Wallet not online.");
    }
  }

  const eSignIn = () => e("button", { className: "connect-button", onClick: signIn }, `Connect to MetaMask`);
  const eSignOut = () => e("button", { className: "connect-button", onClick: signOut }, `Disconnect from MetaMask`);

  const eMint = (n) =>
    e(
      "div",
      { className: "mint-button" },
      e(
        "a",
        { onClick: () => mintMiladys(n) },
        `Mint ${n} Milady${n > 1 ? "s" : ""} for ${(miladyPrice * n) / 10 ** 18} ETH + gas`
      )
    );

  console.log(signedIn);

  if (saleStarted) {
    return e("div", { className: "sale-notice" }, "The sale has not started yet.");
  }

  if (!signedIn) {
    return eSignIn();
  }

  return e("div", { className: "connect-or-buy" }, eSignOut(), eMint(1), eMint(5), eMint(15), eMint(30));
};

ReactDOM.render(
  e(() => Connect()),
  document.querySelector("#mint")
);
