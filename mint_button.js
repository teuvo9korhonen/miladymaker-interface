"use strict";

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

const Mint = () => {
  const [signedIn, setSignedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [miladyContract, setmiladyContract] = useState(null);
  const [saleStarted, setSaleStarted] = useState(false);

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

    const saleIsActive = await miladyContract.methods.saleIsActive().call();
    setSaleStarted(saleIsActive);
  }

  function getMiladyPriceEach(n) {
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

  async function mintMiladys(n) {
    if (!miladyContract) {
      console.log("Wallet not online.");
      return;
    }

    try {
      const price = getMiladyPriceEach(n).multipliedBy(n).toString();

      const gasAmount = await miladyContract.methods.mintMiladys(n).estimateGas({ from: walletAddress, value: price });

      console.log("estimated gas", gasAmount);
      console.log({ from: walletAddress, value: price });

      miladyContract.methods
        .mintMiladys(n)
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", function (hash) {
          console.log("transactionHash", hash);
        });
    } catch (err) {
      alert(JSON.stringify(err));
    }
  }

  async function reserveMintMiladys() {
    if (!miladyContract) {
      console.log("Wallet not online.");
      return;
    }

    try {
      const price = "0";

      const gasAmount = await miladyContract.methods
        .reserveMintMiladys()
        .estimateGas({ from: walletAddress, value: price });
      console.log("estimated gas", gasAmount);

      console.log({ from: walletAddress, value: price });

      miladyContract.methods
        .reserveMintMiladys()
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", function (hash) {
          console.log("transactionHash", hash);
        });
    } catch (err) {
      alert(JSON.stringify(err));
    }
  }

  const eSignIn = () => e("button", { className: "connect-button", onClick: signIn }, `Connect to MetaMask`);
  const eSignOut = () => e("button", { className: "connect-button", onClick: signOut }, `Disconnect from MetaMask`);

  const eMint = (n) => {
    const priceEach = getMiladyPriceEach(n).dividedBy("10e18");
    const priceAll = priceEach * n;
    return e(
      "div",
      { className: "mint-button" },
      e(
        "a",
        { onClick: () => mintMiladys(n) },
        `Mint ${n} Milady${n > 1 ? "s" : ""} - ${priceAll} ETH (${priceEach} each)`
      )
    );
  };

  console.log(signedIn);

  if (!saleStarted) {
    return e("div", { className: "sale-notice" }, "The sale has not started yet.");
  }

  if (!signedIn) {
    return eSignIn();
  }

  return e("div", { className: "connect-or-buy" }, eSignOut(), eMint(1), eMint(5), eMint(15), eMint(30));
};

ReactDOM.render(
  e(() => Mint()),
  document.querySelector("#mint")
);
