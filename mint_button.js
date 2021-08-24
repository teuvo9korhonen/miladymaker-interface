"use strict";

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

const ConnectAndMint = ({ reserve }) => {
  const [signedIn, setSignedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [miladyContract, setmiladyContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [saleStarted, setSaleStarted] = useState(false);
  const [whitelistedFor1, setWhitelistedFor1] = useState(false);
  const [whitelistedFor2, setWhitelistedFor2] = useState(false);

  useEffect(() => console.log("totalSupply:", totalSupply), [totalSupply]);
  useEffect(() => console.log("saleStarted:", saleStarted), [saleStarted]);

  async function signIn() {
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
    } else {
      alert("No ETH interface plugged. Using read-only.");
    }

    window.ethereum
      .enable()
      .then((accounts) => {
        window.web3.eth.net
          .getNetworkType()
          // check if connected network is mainnet
          .then((network) => {
            if (network != "main") {
              alert("You are on " + network + " network. Change network to Ethereum mainnet.");
            }
          });
        let walletAddress = accounts[0];
        setWalletAddress(walletAddress);
        setSignedIn(true);
        callContractData(walletAddress);
      })
      .catch((err) => {
        // Handle error. Likely the user rejected the login
        console.error(err);
      });
  }

  async function signOut() {
    setSignedIn(false);
  }

  async function callContractData(walletAddress) {
    // let balance = await web3.eth.getBalance(wallet);
    // setWalletBalance(balance)

    const miladyContract = new window.web3.eth.Contract(ABI, ADDRESS);
    setmiladyContract(miladyContract);

    const totalSupply = await miladyContract.methods.totalSupply().call();
    setTotalSupply(totalSupply);

    const saleIsActive = await miladyContract.methods.saleIsActive().call();
    setSaleStarted(saleIsActive);

    const whitelistOneMint = await miladyContract.methods.whitelistOneMint(walletAddress).call();
    setWhitelistedFor1(whitelistOneMint);

    const whitelistTwoMint = await miladyContract.methods.whitelistTwoMint(walletAddress).call();
    setWhitelistedFor2(whitelistTwoMint);
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

      await miladyContract.methods
        .mintMiladys(n)
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", (hash) => {
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

      await miladyContract.methods
        .reserveMintMiladys()
        .send({ from: walletAddress, value: price, gas: String(gasAmount) })
        .on("transactionHash", (hash) => {
          console.log("transactionHash", hash);
        });
    } catch (err) {
      alert(JSON.stringify(err));
    }
  }

  function format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const SignInButton = () => e("button", { className: "connect-button", onClick: signIn }, `Connect to MetaMask`);
  const SignOutButton = () =>
    e("button", { className: "connect-button", onClick: signOut }, `Disconnect from MetaMask`);
  const AmountMinted = (n) => e("div", { className: "amount-minted" }, `${format(n)} / ${format(10000)} minted`);

  const MintButton = (n) => {
    const priceEach = getMiladyPriceEach(n).dividedBy("1e18");
    const priceAll = priceEach.multipliedBy(n);
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

  const WhitelistedNotice = (n) => {
    if (n === 0) {
      return e(
        "div",
        { className: "whitelisted-notice" },
        `Sorry, but your address (${walletAddress}) is not whitelisted.`
      );
    }
    return e(
      "div",
      { className: "whitelisted-notice" },
      `Congrats! Your wallet is whitelisted to reserve ${n} free Milady${n > 1 ? "s" : ""} from the ` +
        `Community Reserve! Click below to claim if you haven't already (gas not included):`
    );
  };

  const MintReserveButton = () => {
    return e(
      "div",
      { className: "mint-reserve-button" },
      e("a", { onClick: () => reserveMintMiladys() }, `Mint Miladys`)
    );
  };

  // if (!saleStarted) {
  //   return e("div", { className: "sale-notice" }, "The sale has not started yet.");
  // }

  if (!signedIn) {
    return SignInButton();
  }

  if (reserve) {
    if (whitelistedFor1) {
      return e("div", null, SignOutButton(), WhitelistedNotice(1), MintReserveButton());
    }
    if (whitelistedFor2) {
      return e("div", null, SignOutButton(), WhitelistedNotice(2), MintReserveButton());
    }
    return e("div", null, SignOutButton(), WhitelistedNotice(0));
  }

  return e(
    "div",
    { className: "connect-or-buy" },
    SignOutButton(),
    totalSupply ? AmountMinted(totalSupply) : null,
    MintButton(1),
    MintButton(5),
    MintButton(15),
    MintButton(30)
  );
};

const mint = document.querySelector("#mint");
if (mint) {
  ReactDOM.render(
    e(() => ConnectAndMint({ reserve: false })),
    mint
  );
}

const mintReserve = document.querySelector("#mint-reserve");
if (mintReserve) {
  ReactDOM.render(
    e(() => ConnectAndMint({ reserve: true })),
    mintReserve
  );
}
