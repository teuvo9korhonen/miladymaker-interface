"use strict";

//React Imports
const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

///////////////////
//      NEW      //
///////////////////

const ConnectAndMint = () => {
  //////////////////
  //    States    //
  //////////////////
  // Wallet and Account States
  const [isMetamask, setIsMetamask] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [chainId, setChainId] = useState(0);
  const [chainName, setChainName] = useState("");

  const [walletAddress, setWalletAddress] = useState(null);
  const [miladyContract, setmiladyContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [saleStarted, setSaleStarted] = useState(false);
  const [whitelistedFor1, setWhitelistedFor1] = useState(false);
  const [whitelistedFor2, setWhitelistedFor2] = useState(false);

  //TRANSACTION STATES
  const [gasPrice, setGasPrice] = useState(0);

  ////////////////////
  // Contract Calls //
  ////////////////////

  useEffect(() => {
    (async () => {
      if (typeof window.web3 !== "undefined") {
        // Use existing gateway
        window.web3 = new Web3(window.ethereum);
        setIsMetamask(true);
      } else {
        setIsMetamask(false);
        const nowallet = document.querySelector("#NoWallet");

        if (nowallet) {
          ReactDOM.render(
            e(
              "h1",
              { className: "NoWalletTitle" },
              `MetaMask was not detected. You're in Read-only mode, to interact with the dapp, please install Metamask.`
            ),
            nowallet
          );
        }
      }
      const miladyContract = new window.web3.eth.Contract(ABI, ADDRESS);
      setmiladyContract(miladyContract);

      const totalSupply = await miladyContract.methods.totalSupply().call();
      setTotalSupply(totalSupply);

      const saleIsActive = await miladyContract.methods.saleIsActive().call();
      setSaleStarted(saleIsActive);
    })();
  }, []);

  ///////////////////

  async function signIn() {
    if (typeof window.web3 !== "undefined") {
      // Use existing gateway
      window.web3 = new Web3(window.ethereum);
    } else {
      const nowallet = document.querySelector("#NoWallet");

      if (nowallet) {
        ReactDOM.render(
          e(
            "h1",
            { className: "NoWalletTitle" },
            `MetaMask was not detected. Please install it to continue.`
          ),
          nowallet
        );
      }
    }

    window.ethereum
      .enable()
      .then((accounts) => {
        window.web3.eth.net
          .getId()
          // check if connected network is mainnet
          .then((network) => {
            setChainId(network);
          });
        window.web3.eth.net
          .getNetworkType()
          // check if connected network is mainnet
          .then((network) => {
            setChainName(network);
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
    const miladyContract = new window.web3.eth.Contract(ABI, ADDRESS);
    setmiladyContract(miladyContract);

    const totalSupply = await miladyContract.methods.totalSupply().call();
    setTotalSupply(totalSupply);

    const saleIsActive = await miladyContract.methods.saleIsActive().call();
    setSaleStarted(saleIsActive);

    const whitelistOneMint = await miladyContract.methods
      .whitelistOneMint(walletAddress)
      .call();
    setWhitelistedFor1(whitelistOneMint);

    const whitelistTwoMint = await miladyContract.methods
      .whitelistTwoMint(walletAddress)
      .call();
    setWhitelistedFor2(whitelistTwoMint);
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

  //SEND TRANSACTION FUNCTION
  async function buyMiladys(n) {
    if (!miladyContract) {
      return;
    }

    const price = get_milady_price(n).multipliedBy(n).toString();
    console.log(price);

    const gas_price = await web3.eth.getGasPrice();
    console.log("Gas Price: " + gas_price);

    var gasAmount = await miladyContract.methods.mintMiladys(n).estimateGas({
      from: walletAddress,
      value: price,
    });
    console.log("Gas Amount: " + gasAmount);

    if (gas_price && gasAmount) {
      try {
        miladyContract.methods
          .mintMiladys(n)
          .send({
            from: walletAddress,
            value: price,
            gas: gasAmount,
            gasPrice: gas_price,
          })
          .on("transactionHash", (hash) => {
            console.log("transactionHash", hash);
          });
      } catch (err) {
        alert(JSON.stringify(err));
      }
    }
  }

  function format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  ////////////////////////////////
  //            Tags            //
  ////////////////////////////////

  const Hr = () => e("hr");
  const Br = () => e("br");

  //HTML TAGS When the user isn't connected and MetaMask isn't installed.
  const TextNoWallet = () => {
    return e(
      "h2",
      { className: "TextNoWallet" },
      "You don't have Metamask Installed, you can download it here:"
    );
  };

  const TextInstallWallet = () => {
    return e(
      "a",
      { className: "TextInstallWallet", href: "https://metamask.io/" },
      "Install Metamask"
    );
  };

  ////////////////////////////////

  //Text when the user is in another network.
  const TextWrongChain = () => {
    return e(
      "div",
      null,
      e(
        "h2",
        { className: "TextNoWallet" },
        "You are on ",
        e(
          "span",
          { className: "TextNoWallet" },
          chainName.charAt(0).toUpperCase(),
          chainName.slice(1)
        ),
        e("span", { className: "TextNoWallet" }, " Network")
      ),
      e(
        "h2",
        { className: "TextNoWallet" },
        "Please, change to Ethereum Mainnet."
      )
    );
  };

  ////////////////////////////////

  const SignInButton = () => {
    return e(
      "button",
      { className: "connect-button", onClick: signIn },
      `Connect to MetaMask`
    );
  };
  const SignOutButton = () => {
    return e(
      "button",
      { className: "connect-button", onClick: signOut },
      `Disconnect from MetaMask`
    );
  };

  const MiladyText = () => {
    return e(
      "p",
      {},
      `All 10,000 Milady's are be fairly launched in a simultaneous drop.
      9,500 will be for sale with 500 set aside as a community reserve.`
    );
  };

  const MiniHeader = () => {
    return e(
      "div",
      null,
      AmountMinted(),
      Hr(),
      e("h3", { className: "mint-your-milady" }, "Mint your Milady:")
    );
  };

  const AmountMinted = () => {
    if (totalSupply == null) return null;
    return e(
      "div",
      { className: "amount-minted" },
      e("div", { className: "current-supply" }, "Current Supply:"),
      e("div", null, `${format(totalSupply)} / ${format(10000)}`)
    );
  };

  const MintButton = (n) => {
    const priceEach = get_milady_price(n).dividedBy("1e18");
    const priceAll = priceEach.multipliedBy(n);
    const text = `Mint ${n} Milady${
      n > 1 ? "s" : ""
    } - ${priceAll} ETH (${priceEach} each)`;

    if (!signedIn) {
      return e("div", { className: "mint-button" }, text);
    } else {
      return e(
        "div",
        { className: "mint-button" },
        e("button", { onClick: () => buyMiladys(n) }, text)
      );
    }
  };

  const WhitelistedNotice = (n) => {
    return e(
      "div",
      { className: "whitelisted-notice" },
      `Congrats! Your wallet is whitelisted to reserve ${n} free Milady${
        n > 1 ? "s" : ""
      } from the Community Reserve! `,
      e("a", { href: "reserve.html" }, "Click to view!")
    );
  };

  const WalletNotice = () => {
    return e(
      "div",
      { className: "wallet-show" },
      "Connected wallet: " + walletAddress
    );
  };

  const NoWalletNotice = () => {
    return e("div", { className: "wallet-show" }, "No wallet connected");
  };

  ///////////////////////////////////////////
  // States When the User enter on the web //
  ///////////////////////////////////////////

  //When the user isn't connected and MetaMask isn't installed.

  if (!signedIn && !isMetamask) {
    return e(
      "div",
      { className: "centered-text" },
      Br(),
      TextNoWallet(),
      Br(),
      TextInstallWallet(),
      Br()
    );
  }

  //When the user isn't connected and MetaMask isn't installed.
  else if (!signedIn && isMetamask) {
    return e(
      "div",
      { className: "centered-text" },
      MiladyText(),
      Br(),
      MiniHeader(),
      Br(),
      SignInButton(),
      Br(),
      Br(),
      NoWalletNotice(),
      Br()
    );
  }

  //When the user is in a wrong network.
  else if (signedIn && isMetamask && chainId != CHAINID) {
    return e(
      "div",
      { className: "centered-text" },
      Br(),
      Br(),
      TextWrongChain(),
      Br(),
      Br()
    );
  }

  return e(
    "div",
    null,
    MiniHeader(),
    Br(),
    SignOutButton(),
    Br(),
    Br(),
    WalletNotice(),
    Br(),
    MintButton(1),
    MintButton(5),
    MintButton(15),
    MintButton(30),
    e(
      "div",
      { className: "whitelisted-notices" },
      whitelistedFor1 ? WhitelistedNotice(1) : null,
      whitelistedFor2 ? WhitelistedNotice(2) : null
    )
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
