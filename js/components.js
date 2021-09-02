"use strict";

//React Imports
const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

////////////////////////////////
//            Tags            //
////////////////////////////////

const Hr = () => e("hr");
const Br = () => e("br");

//HTML TAGS When the user isn't connected and MetaMask isn't installed.
const TextNoWallet = () => {
  return e(
    "p",
    { className: "TextNoWallet" },
    e("a", { href: "https://metamask.io/" }, "No Metamask detected"),
    ". If on mobile, make sure to be browsing on Metamask's browser."
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
      "Wrong network detected. Please change to Ethereum Mainnet."
    )
  );
};

//No Founds to sent transaction.
const NoFounds = (n) => {
  if (n == 1) {
    return e(
      "div",
      null,
      e(
        "h2",
        { className: "TextNoWallet" },
        "You don't have enough funds to mint " + n.toString() + " Milady."
      )
    );
  } else {
    return e(
      "div",
      null,
      e(
        "h2",
        { className: "TextNoWallet" },
        "You don't have enough funds to mint " + n.toString() + " Miladys."
      )
    );
  }
};

//Texts

const MiladyText = () => {
  return e(
    "p",
    {},
    `All 10,000 Milady's are fairly launched in a simultaneous drop.
      9,500 will be for sale with 500 set aside as a community reserve.`
  );
};

const MiniHeader = (totalSupply) => {
  return e(
    "div",
    null,
    AmountMinted(totalSupply),
    Hr(),
    e("h3", { className: "mint-your-milady" }, "Mint your Milady:")
  );
};

function format(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const AmountMinted = (totalSupply) => {
  if (totalSupply == null && totalSupply != NaN) return null;
  return e(
    "div",
    { className: "amount-minted" },
    e("div", { className: "current-supply" }, "Current Supply:"),
    e("div", null, `${format(totalSupply)} / ${format(10000)}`)
  );
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

const WalletNotice = (walletAddress) => {
  return e(
    "p",
    { className: "wallet-show" },
    "Connected wallet: " + walletAddress
  );
};

const NoWalletNotice = () => {
  return e("p", { className: "wallet-show" }, "No wallet connected");
};

export {
  Hr,
  Br,
  TextNoWallet,
  TextInstallWallet,
  TextWrongChain,
  NoFounds,
  MiladyText,
  MiniHeader,
  AmountMinted,
  WhitelistedNotice,
  WalletNotice,
  NoWalletNotice,
};
