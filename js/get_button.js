"use strict";
import {
  Hr,
  Br,
  TextNoWallet,
  TextInstallWallet,
  TextWrongChain,
  NoFounds,
  MiladyText,
  MiniHeader,
  WhitelistedNotice,
  WalletNotice,
  NoWalletNotice,
} from "./components.js";

//React Imports
const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

const mintReserve = document.querySelector("#mint-reserve");

const ConnectAndGet = () => {
  //////////////////
  //    States    //
  //////////////////
  // Wallet and Account States
  const [isMetamask, setIsMetamask] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [chainId, setChainId] = useState(0);
  const [chainName, setChainName] = useState("");

  const [showNoWallet, toggleShow] = useState(false);

  const [walletAddress, setWalletAddress] = useState(null);
  const [miladyContract, setmiladyContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [saleStarted, setSaleStarted] = useState(false);
  const [listLoading, setListLoader] = useState(false);
  const [whitelistedFor1, setWhitelistedFor1] = useState(false);
  const [whitelistedFor2, setWhitelistedFor2] = useState(false);

  ///////////////////////
  // TOTAL SUPPLY CALL //
  ///////////////////////

  useEffect(() => {
    let call = new XMLHttpRequest();
    call.open(
      "GET",
      "https://api.etherscan.io/api?module=proxy&action=eth_getStorageAt&address=0x5af0d9827e0c53e4799bb226655a1de152a425a5&position=0x2&tag=latest&apikey=N6RBJJAAQK1YWA66IE1KZ8T5SRGRCR4W9T"
    );
    call.send();
    call.onload = () => {
      if (call.status == 200) {
        const value = JSON.parse(call.response).result;
        if (isNaN(parseInt(value)) == false) {
          setTotalSupply(parseInt(value));
          console.log("Total Supply: " + parseInt(value));
        }
      } else {
        let callText = new XMLHttpRequest();
        callText.open("GET", "total_supply.txt");
        callText.send();
        callText.onload = () => {
          const value = JSON.parse(callText.response);
          setTotalSupply(value);
          console.log("Total Supply: " + value);
        };
      }
    };
  }, []);

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
      const nowallet = document.querySelector("#mint-reserve");

      if (nowallet) {
        ReactDOM.render(
          e(
            "div",
            { className: "centered-text" },
            Br(),
            MiniHeader(totalSupply),
            Br(),
            SignInButton(),
            Br(),
            Br(),
            TextNoWallet(),
            Br()
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
    setListLoader(true);
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

    setListLoader(false);
  }

  function get_milady_price(n) {
    if (n === 2) {
      return BigNumber("00000000000000000"); // 0.06 ETH
    }
  }

  ////////////////////////////////
  //            Tags            //
  ////////////////////////////////

  //Sign Buttons

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

  const MintButton = (n) => {
    const priceEach = get_milady_price(n).dividedBy("1e18");
    const priceAll = priceEach.multipliedBy(n);
    const text = `Mint ${n} Milady${
      n > 1 ? "s" : ""
    } - ${priceAll} ETH (You just pay the gas fee)`;

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

  const MintText = (n) => {
    const priceEach = get_milady_price(n).dividedBy("1e18");
    const priceAll = priceEach.multipliedBy(n);
    const text = `Mint ${n} Milady${
      n > 1 ? "s" : ""
    } - ${priceAll} ETH (${priceEach} each)`;

    return e("div", { className: "mint-button" }, text);
  };

  ////////////////////////////////

  //SEND TRANSACTION FUNCTION
  async function buyMiladys(n) {
    if (!miladyContract) {
      return;
    }

    const price = get_milady_price(n).multipliedBy(n).toString();
    console.log(price);

    const gas_price = await web3.eth.getGasPrice();
    console.log("Gas Price: " + gas_price);

    if (gas_price) {
      try {
        miladyContract.methods
          .reserveMintMiladys()
          .send({
            from: walletAddress,
            value: price,
            gas: 400000,
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

  if (mintReserve) {
    ///////////////////////////////////////////
    // States When the User enter on the web //
    ///////////////////////////////////////////

    //When the user isn't connected and MetaMask isn't installed.

    if (!signedIn && !isMetamask) {
      return e(
        "div",
        { className: "centered-text" },
        Br(),
        MiniHeader(totalSupply),
        Br(),
        SignInButton(),
        Br(),
        Br(),
        NoWalletNotice(),
        Br()
      );
    }

    //When the user isn't connected and MetaMask isn't installed.
    else if (!signedIn && isMetamask) {
      return e(
        "div",
        { className: "centered-text" },
        Br(),
        MiniHeader(totalSupply),
        Br(),
        SignInButton(),
        Br(),
        Br(),
        NoWalletNotice(),
        Br()
      );
    } //When the user is in a wrong network.
    else if (signedIn && isMetamask && listLoading) {
      if (chainId != CHAINID) {
        return e(
          "div",
          { className: "centered-text" },
          Br(),
          MiniHeader(totalSupply),
          Br(),
          SignInButton(),
          Br(),
          WalletNotice(walletAddress),
          Br(),
          TextWrongChain(),
          Br()
        );
      } else if (!whitelistedFor2) {
        return e(
          "div",
          { className: "centered-text" },
          Br(),
          MiniHeader(totalSupply),
          Br(),
          SignInButton(),
          Br(),
          WalletNotice(walletAddress),
          Br(),
          e("div", null, e("h2", { className: "TextNoWallet" }, "Loading...")),
          Br()
        );
      }
    } else if (signedIn && isMetamask && !whitelistedFor2) {
      return e(
        "div",
        { className: "centered-text" },
        Br(),
        MiniHeader(totalSupply),
        Br(),
        SignInButton(),
        Br(),
        WalletNotice(walletAddress),
        Br(),
        e(
          "div",
          null,
          e(
            "h2",
            { className: "TextNoWallet" },
            "You're not in the White List."
          )
        ),
        Br()
      );
    }

    return e(
      "div",
      null,
      Br(),
      MiniHeader(totalSupply),
      Br(),
      SignOutButton(),
      Br(),
      Br(),
      WalletNotice(walletAddress),
      Br(),
      MintButton(2)
    );
  }
};

if (mintReserve) {
  ReactDOM.render(
    e(() => ConnectAndGet({ reserve: true })),
    mintReserve
  );
}
