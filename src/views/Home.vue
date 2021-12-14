/* eslint-disable vue/multi-word-component-names */
<script>
import { ethers } from 'ethers';
import FlashMessage from '../components/FlashMessage.vue';

import { abi } from '../utils/NFT.json';

const { ethereum } = window;
export default {
	data() {
		return {
			userCanMint: false,
			nftMinted: false,
			currentAccount: '',
			walletIsConnected: false,
			contractAddress: '0xB7E15D67cD3000B4554B1403d3FE6579ce744FD8',
			metamaskListeners: false,
			showFlashMessage: false,
			flashMessageInfo: {
				role: undefined,
				backgroundColor: undefined,
				textColor: undefined,
				description: undefined,
				txnHash: undefined,
			},
			tokenData: {
				owner: "",
				tokenID: 0,
				tokenURI: {
					image: ""
				}
			},
		};
	},
	methods: {
		checkMetamaskConnection() {
			try {
				if (!ethereum) {
					console.error('Metamask not found. Please install Metamask.');
					return;
				}
				console.log('Metamask installed:', ethereum);
			} catch (error) {
				console.error(error);
			}
		},
		async connectWallet() {
			this.checkMetamaskConnection();
			if (this.walletIsConnected) {
				console.log("Wallet is already connected");
				return
			}
			console.log('Connecting wallet...');

			// request users ethereum account
			ethereum
				.request({ method: 'eth_requestAccounts' })
				.then((accounts) => {
					console.log(accounts[0]);
					this.walletIsConnected = true;
					this.currentAccount = accounts[0];
					this.userCanMint = true;
					console.log('Connected');
				})
				.catch((error) => {
					console.error('Unable to request eth accounts ', error);
					this.walletIsConnected = false;
				});
		},
		async getTokenURI() {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const catContract = new ethers.Contract(this.contractAddress, abi, signer);
			// activate smart contract event listener
			catContract.on('CatNFTMinted', (owner, tokenID, tokenURI) => {
				console.log("Owner: ", owner);
				console.log("TokenID: ", tokenID);
				console.log("TokenURI: ", tokenURI)
				tokenURI = atob(tokenURI.split(';base64,')[1])
				tokenID = parseInt(tokenID, 16) // the '16' is a radix param, used to specify the number system to use (16 = hex)
				this.tokenData = {
					owner,
					tokenID,
					tokenURI: JSON.parse(tokenURI)
				}
				console.log("TokenID: ", tokenID);
				console.log("TokenURI: ", tokenURI)
			})
		},
		async checkWalletConnected() {
			const accounts = await ethereum.request({ method: 'eth_accounts' }); // get accounts that have already been connected (doesn't show metamask login popup)
			console.log(
				accounts.length > 0 ? `Account found: ${accounts[0]}` : 'Accounts not found'
			);
			if (accounts.length > 0) {
				this.walletIsConnected = true;
				this.currentAccount = accounts[0];
				this.userCanMint = true
				console.log('Connected');
			} else {
				this.walletIsConnected = false;
				this.currentAccount = ""
				this.userCanMint = false
				console.error('Wallet not connected');
			}
		},
		async mintCatNFT() {
			try {
				if (!ethereum) {
					throw Error('Ethereum object was not found; Please connect Metamask.');
				}
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const catContract = new ethers.Contract(this.contractAddress, abi, signer);
				const response = await catContract.mintCatNFT();
				// I need to show the mining info, progress, and final result.
				console.log(response);
				console.log(signer);

				this.triggerFlashMessage({
					role: 'warning',
					eackgroundColos: 'bg-yellow-400',
					textColor: 'text-gray-900',
					description: 'Mining transaction...',
					txnHash: response.hash,
				}, true)

				await response.wait();
				await this.getTokenURI();
				this.triggerFlashMessage({
					role: 'success',
					backgroundColor: 'bg-green-400',
					textColor: 'text-gray-900',
					description: "Transaction succeeded!",
					txnHash: response.hash,
				}, true)
				this.nftMinted = true
			} catch (error) {
				this.triggerFlashMessage({
					description: "Error: Transaction failed.",
					role: 'alert',
					backgroundColor: 'bg-red-500',
					textColor: 'text-gray-50',
				}, true)

				console.error(error);
			}
		},
		triggerFlashMessage(config, timeout) {
			// this function handles showing and hiding of the flash message 
			// and it's data. 
			this.showFlashMessage = true;
			this.flashMessageInfo = config;
			if (timeout) {
				setTimeout(() => {
					this.showFlashMessage = false;
				}, 5000); // non-blocking
			}
		},
		async activateMetamaskEventListeners() {
			// listener is initialized every time this is run.
			console.log('Initializing listeners...');
			ethereum.on('accountsChanged', (account) => {
				console.log('accounts changed!', account);
				this.currentAccount = account[0];
			});
			ethereum.on('disconnect', () => { console.log("Metamask Disconnected") })
			ethereum.on('connect', (connectInfo) => {
				console.log("Metamask chain RPC connection established: ", connectInfo)
			})
			ethereum.on('chainChanged', async (chainId) => {
				chainId = parseInt(chainId, 16)
				console.log("chain changed: ", chainId)
				switch (chainId) {
					case 1:
						console.warn("WARNING: Switched to Mainnet")
						this.walletIsConnected = false;
						this.currentAccount = "";
						this.triggerFlashMessage({
							role: 'warning',
							eackgroundColos: 'bg-yellow-400',
							textColor: 'text-gray-900',
							description: 'Warning: You are on the mainnet. Please switch to the Rinkeby network.',
						}, true)
						break;

					case 4:
						console.log("Switched to Rinkeby")
						window.location.reload()
						break;

					default:
						this.walletIsConnected = false;
						this.currentAccount = "";
						this.userCanMint = false;
						this.triggerFlashMessage({
							role: 'warning',
							eackgroundColos: 'bg-yellow-400',
							textColor: 'text-gray-900',
							description: 'Warning: Please switch to the Rinkeby network.',
						}, false)
						break;
				}
			})
			let network = parseInt(await ethereum.request({ method: "eth_chainId" }), 16)
			if (network !== 4) {
				this.triggerFlashMessage({
					role: 'warning',
					eackgroundColos: 'bg-yellow-400',
					textColor: 'text-gray-900',
					description: 'WARNING: You are not connected to the Rinkeby network. This dapp only works on the Rinkeby network.',
				})
				this.walletIsConnected = false;
				this.currentAccount = "";
				this.userCanMint = false;
			}
			else {
				if (walletIsConnected) this.userCanMint = true;
			}
		},

		deactivateMetamaskEventListeners() {
			ethereum.removeListener('accountsChanged');
			ethereum.removeListener('disconnect');
			ethereum.removeListener('connect');
			ethereum.removeListener('chainChanged');

		},
	},
	components: { FlashMessage },
	computed: {
		generateOpenseaLink() {
			return `https://testnets.opensea.io/assets/${this.contractAddress}/${this.tokenData.tokenID}`
		},
		addressIsConnected() {
			return typeof this.currentAccount === 'string' && this.currentAccount.length > 0;
		},
		canUserMint() {
			if (this.userCanMint) {
				return "bg-indigo-400 cursor-pointer"
			} else {
				return "bg-indigo-200 cursor-not-allowed"
			}
		}
	},
	mounted() {
		this.checkWalletConnected();
		this.activateMetamaskEventListeners();
	},
	unmounted() {
		this.deactivateMetamaskEventListeners();
	}
};
</script>

<template>
	<div class="pt-48 text-center w-full">
		<button
			@click="connectWallet()"
			class="absolute flex justify-center items-center right-0 top-0 px-6 py-4 m-4 rounded-xl bg-blue-500 text-gray-50"
		>
			<span
				class="mr-2 w-4 h-4 rounded-full block"
				:class="addressIsConnected ? 'bg-green-500' : 'bg-red-500'"
			></span>
			{{ addressIsConnected ? 'Connected' : 'Connect Wallet' }}
			<!-- If you add semicolons to the end of template syntax, vue throws a cryptic error. -->
		</button>
		<h1
			class="font-bold text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-500 text-center py-3"
		>NFT Minting Project</h1>

		<button
			class="px-8 py-3 text-xl rounded-lg mt-6 text-gray-50 mx-auto"
			:class="canUserMint"
			id="mintCatNFTButton"
			@click="mintCatNFT"
		>Mint NFT</button>
		<div
			v-show="nftMinted"
			class="pb-24 flex flex-col md:w-3/5 lg:flex-row lg:w-[720px] w-4/5 h-auto mx-auto mt-12"
		>
			<div class="w-full h-auto bg-blue-500 flex">
				<!-- This is the image container. -->
				<img class="mx-auto w-full" :src="this.tokenData.tokenURI.image" alt="NFT image displayed here" />
			</div>

			<div class="w-full h-auto pt-6 pl-6 bg-gray-200 text-left">
				<!-- This is the text container. -->
				<h2 class="font-bold text-2xl">Cat ID: {{ this.tokenData.tokenID }}</h2>
				<h3 class="font-normal text-xl">Description</h3>
				<p>{{ this.tokenData.tokenURI.description }}</p>
				<div class="w-full h-auto">
					<a :href="generateOpenseaLink" target="_blank">
						<button class="p-4 my-4 bg-blue-500 text-white rounded-lg">
							View on
							<span class="font-bold underline">Opensea</span>
						</button>
					</a>
				</div>
			</div>
		</div>
		<div class="fixed w-full bottom-0">
			<flash-message
				v-on:closeFlashMessage="showFlashMessage = false"
				v-bind="flashMessageInfo"
				v-show="showFlashMessage"
			/>
		</div>
	</div>
</template>
