"use strict";

//React Imports
const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

///////////////////
//      NEW      //
///////////////////

const ConnectAndMint = ({ reserve }) => {
  //////////////////
  //    States    //
  //////////////////
  // Wallet and Account States
  const [isMetamask, setIsMetamask] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const [walletAddress, setWalletAddress] = useState(null);
  const [miladyContract, setmiladyContract] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [saleStarted, setSaleStarted] = useState(false);
  const [whitelistedFor1, setWhitelistedFor1] = useState(false);
  const [whitelistedFor2, setWhitelistedFor2] = useState(false);

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
              `MetaMask was not detected. Please install it to continue.`
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
          .getNetworkType()
          // check if connected network is mainnet
          .then((network) => {
            if (network != "main") {
              alert(
                "You are on " +
                  network +
                  " network. Change network to Ethereum mainnet."
              );
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
      return;
    }

    try {
      const price = getMiladyPriceEach(n).multipliedBy(n).toString();

      // const gasAmount = await miladyContract.methods.mintMiladys(n).estimateGas({ from: walletAddress, value: price });

      // Using reserveMintMiladys() instead of mintMiladys(n) to estimate gas...
      // This is a gross hack and it frightens me, but I think it works. // alima
      const gasAmount = await miladyContract.methods
        .reserveMintMiladys()
        .estimateGas({ from: walletAddress, value: "0" });

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

  //////////
  // Tags //
  //////////

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
    const priceEach = getMiladyPriceEach(n).dividedBy("1e18");
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
        e("button", { onClick: () => mintMiladys(n) }, text)
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

  const WhitelistedNoticeReserve = (n) => {
    if (n === 0) {
      return e(
        "div",
        { className: "whitelisted-notice-reserve" },
        `Sorry, but your address (${walletAddress}) is not whitelisted.`
      );
    }
    return e(
      "div",
      { className: "whitelisted-notice-reserve" },
      `Congrats! Your wallet is whitelisted to reserve ${n} free Milady${
        n > 1 ? "s" : ""
      } from the ` +
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

  /*
   if (!saleStarted) {
    return e("div", { className: "sale-notice" }, "The sale has not started yet.");
   }
  */

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

  if (!signedIn && isMetamask) {
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

  if (reserve) {
    if (whitelistedFor1) {
      return e(
        "div",
        { className: "centered-text" },
        MiniHeader(),
        Br(),
        SignOutButton(),
        Br(),
        Br(),
        WalletNotice(),
        Br(),
        WhitelistedNoticeReserve(1),
        MintReserveButton()
      );
    }
    if (whitelistedFor2) {
      return e(
        "div",
        { className: "centered-text" },
        MiniHeader(),
        Br(),
        SignOutButton(),
        Br(),
        Br(),
        WalletNotice(),
        Br(),
        WhitelistedNoticeReserve(2),
        MintReserveButton()
      );
    }
    return e(
      "div",
      { className: "centered-text" },
      MiniHeader(),
      Br(),
      SignOutButton(),
      Br(),
      WhitelistedNoticeReserve(0)
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

///////////////////
//      OLD      //
///////////////////
let contract;

//connect to MetaMask
document.getElementById("connect").onclick = function () {
  this.disabled = true;
  const msg = document.getElementById("message");
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    msg.innerHTML =
      "MetaMask was not detected. Please <a href='https://metamask.io/'>Install MetaMask</a> to continue.";
    return;
  }

  if (window.ethereum.isConnected()) {
    start();
    return;
  }

  ethereum.on("connect", start);
  msg.innerHTML = "Connecting to MetaMask....";
};
//begin basic eth operations
var wallet = null;
function start() {
  const msg = document.getElementById("message");
  msg.innerHTML = "Connected to MetaMask.";

  window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(function (accounts) {
      msg.innerHTML = "Connected to MetaMask. Wallet ID: " + accounts[0];
      wallet = accounts[0];
      buy_init();
    })
    .catch(function (error) {
      if (error.code == 4001) {
        msg.innerHTML = "MetaMask declined request.";
      } else {
        msg.innerHTML = error.message;
      }
    });

  const web3 = new Web3(window.ethereum);
  if (!web3) {
    msg.innerHTML = "web3.js errror.";
    return;
  }

  contract = new web3.eth.Contract(ABI, ADDRESS);
  if (!contract) {
    msg.innerHTML = "could not read contract at " + ADDRESS;
    return;
  }

  const mint_msg = document.getElementById("mint_count");
  contract.methods
    .totalSupply()
    .call()
    .then(function (total_supply) {
      mint_msg.innerHTML = "Miladys minted: " + total_supply + "/10000";
    })
    .catch(function (error) {
      mint_msg.innerHTML = error.message;
    });
}
//mint miladys
function buy_init() {
  document.getElementById("buy1").innerHTML =
    "<button class='mint-button'>Mint one milady (0.08 ETH)</button>";
  document.getElementById("buy1").onclick = function () {
    buy(1);
  };
  document.getElementById("buy5").innerHTML =
    "<button class='mint-button'>Mint 5 milady (0.375 ETH) (0.075 ETH each)</button>";
  document.getElementById("buy5").onclick = function () {
    buy(5);
  };
  document.getElementById("buy15").innerHTML =
    "<button class='mint-button'>Mint 15 milady (1.05 ETH) (0.07 ETH each)</button>";
  document.getElementById("buy15").onclick = function () {
    buy(15);
  };
  document.getElementById("buy30").innerHTML =
    "<button class='mint-button'>Mint 30 milady (1.8 ETH) (0.06 ETH each)</button>";
  document.getElementById("buy30").onclick = function () {
    buy(30);
  };
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

async function buy(n) {
  if (!wallet) {
    return;
  }

  const web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(ABI, ADDRESS);
  const price = get_milady_price(n).multipliedBy(n);

  //var gas_price = await window.ethereum.request({ method: "eth_gasPrice", params: [], });
  //alert(gas_price.toString(10));
  const gas_price = await web3.eth.getGasPrice();

  var gas = 0;
  try {
    gas = await contract.methods
      .mintMiladys(n)
      .estimateGas({ gasPrice: gas_price, from: wallet, value: price });
  } catch {
    var gas_est = 0.015;
    if (n == 30) {
      gas_est = 0.22;
    } else if (n == 15) {
      gas_est = 0.11;
    } else if (n == 5) {
      gas_est = 0.045;
    }

    gas = Math.floor(
      BigNumber(gas_est).multipliedBy("1e18").dividedBy(gas_price).toNumber()
    );
  }

  contract.methods.mintMiladys(n).send({
    gas: gas,
    from: wallet,
    gasPrice: gas_price.toString(),
    value: price,
  });
}
