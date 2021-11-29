<script>
import { ethers } from "ethers";
import abi from "../utils/NFT.json";
const { ethereum } = window;
export default {
  data() {
    return {
      currentAccount: "",
      connectedAccounts: [],
      walletIsConnected: false,
      contractAddress: "0x5E30bB819b0D536CB8a65D2a0AACd0a2Aba98A72",
      accountChangeListener: false,
    };
  },
  methods: {
    checkMetamaskConnection() {
      try {
        if (!ethereum) {
          console.error("Metamask not found. Please install Metamask.");
          return;
        } else {
          console.log("Metamask connected:", ethereum);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getEthereumAccount() {},
    async connectWallet() {
      this.checkMetamaskConnection();

      console.log("Connecting wallet...");

      // get users ethereum account
      ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          console.log(accounts[0]);
          this.connectedAccounts = accounts;
          this.walletIsConnected = true;
          this.currentAccount = accounts[0];
          console.log("Connected");
          this.checkAccountChange;
        })
        .catch((error) => {
          console.error("Unable to request eth accounts ", error);
          this.walletIsConnected = false;
        });
    },
    async mintCatNFT() {},
    checkAccountChange() {
      // listener is initialized every time this is run.
      if (!this.accountChangeListener) {
        ethereum.on("accountsChanged", (account) => {
          console.log("accounts changed!", account);
          this.currentAccount = account[0];
        });
        this.accountChangeListener = true;
      } else {
        console.log("Listener not initialized");
      }
    },
  },
  components: {},
  computed() {},
};
</script>

<template>
  <div class="pt-20 text-center">
    <button
      @click="connectWallet()"
      class="
        absolute
        flex
        justify-center
        items-center
        right-0
        top-0
        px-6
        py-4
        m-4
        rounded-xl
        bg-blue-500
        text-gray-50
      "
    >
      <span
        class="mr-2 w-4 h-4 rounded-full block"
        :class="this.walletIsConnected ? 'bg-green-500' : 'bg-red-500'"
      ></span>
      Connect Wallet
    </button>
    <h1
      class="
        font-bold
        text-5xl
        bg-clip-text
        text-transparent
        bg-gradient-to-r
        from-green-400
        to-blue-500
        text-center
        py-3
      "
    >
      NFT Minting Project
    </h1>

    <button
      class="
        px-8
        py-3
        text-xl
        rounded-lg
        mt-6
        bg-indigo-500
        text-gray-50
        mx-auto
      "
    >
      Mint NFT
    </button>
  </div>
</template>
