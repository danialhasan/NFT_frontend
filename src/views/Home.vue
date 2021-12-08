/* eslint-disable vue/multi-word-component-names */
<script>
import { ethers } from 'ethers';
import FlashMessage from '../components/FlashMessage.vue';

import { abi } from '../utils/NFT.json';

const { ethereum } = window;
export default {
	data() {
		return {
			currentAccount: '',
			walletIsConnected: false,
			contractAddress: '0x5E30bB819b0D536CB8a65D2a0AACd0a2Aba98A72',
			accountChangeListener: false,
			showFlashMessage: false,
			flashMessageInfo: {
				role: undefined,
				backgroundColor: undefined,
				textColor: undefined,
				description: undefined,
				txnHash: undefined,
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
				console.log('Metamask connected:', ethereum);
			} catch (error) {
				console.error(error);
			}
		},
		async getEthereumAccount() { },
		async connectWallet() {
			this.checkMetamaskConnection();

			console.log('Connecting wallet...');

			// request users ethereum account
			ethereum
				.request({ method: 'eth_requestAccounts' })
				.then((accounts) => {
					console.log(accounts[0]);
					this.walletIsConnected = true;
					this.currentAccount = accounts[0];
					console.log('Connected');
				})
				.catch((error) => {
					console.error('Unable to request eth accounts ', error);
					this.walletIsConnected = false;
				});
		},
		async checkWalletConnected() {
			const accounts = await ethereum.request({ method: 'eth_accounts' }); // get accounts that have already been connected (doesn't show metamask login popup)
			console.log(
				accounts.length > 0 ? `Account found: ${accounts[0]}` : 'Accounts not found'
			);
			if (accounts.length > 0) {
				this.walletIsConnected = true;
				this.currentAccount = accounts[0];
				console.log('Connected');
			} else {
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
					backgroundColor: 'bg-yellow-400',
					textColor: 'text-gray-900',
					description: 'Mining transaction...',
					txnHash: response.hash,
				})

				await response.wait();
				this.triggerFlashMessage({
					role: 'success',
					backgroundColor: 'bg-green-400',
					textColor: 'text-gray-900',
					description: "Transaction succeeded!",
					txnHash: response.hash,
				})
			} catch (error) {
				this.triggerFlashMessage({
					description: "Error: Transaction failed.",
					role: 'alert',
					backgroundColor: 'bg-red-500',
					textColor: 'text-gray-50',
				})

				console.error(error);
			}
		},
		triggerFlashMessage(config) {
			// this function handles showing and hiding of the flash message 
			// and it's data. 
			this.showFlashMessage = true;
			this.flashMessageInfo = config;
			setTimeout(() => {
				this.showFlashMessage = false;
			}, 3500); // non-blocking
		},
		checkAccountChange() {
			// listener is initialized every time this is run.
			if (!this.accountChangeListener) {
				console.log('Initializing listener...');
				ethereum.on('accountsChanged', (account) => {
					console.log('accounts changed!', account);
					this.currentAccount = account[0];
				});
				this.accountChangeListener = true;
			} else {
				console.log('Extra listener not initialized');
			}
		},
	},
	components: { FlashMessage },
	computed: {
		addressIsConnected() {
			return typeof this.currentAccount === 'string' && this.currentAccount.length > 0;
		},
	},
	mounted() {
		this.checkWalletConnected();
		this.checkAccountChange();
	},
};
</script>

<template>
	<div class="pt-48 text-center">
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
			class="px-8 py-3 text-xl rounded-lg mt-6 bg-indigo-500 text-gray-50 mx-auto"
			@click="mintCatNFT"
		>Mint NFT</button>
		<div class="absolute w-full bottom-0">
			<flash-message
				v-on:closeFlashMessage="showFlashMessage = false"
				v-bind="flashMessageInfo"
				v-show="showFlashMessage"
			/>
		</div>
	</div>
</template>
