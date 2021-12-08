<script>
export default {
	name: 'Flash Message',
	data() {
		return {};
	},
	props: {
		role: {
			type: String,
			default: 'alert',
		},
		backgroundColor: {
			type: String,
			default: 'bg-yellow-100',
		},
		textColor: {
			type: String,
			default: 'text-black',
		},
		description: {
			type: String,
			default: 'This is a description.',
		},
		txnHash: {
			type: String,
		},
	},
	emits: ['closeFlashMessage'],
	computed: {
		generateEtherscanLink() {
			return 'https://etherscan.io/tx/' + this.txnHash;
		},
		style() {
			return this.backgroundColor + ' ' + this.textColor;
		},
	},
};
</script>
<template>
	<div class="text-center py-4" :class="style" :role="role">
		<p class="text-xl px-3 py-2">{{ description }}</p>

		<a
			v-if="txnHash"
			:href="generateEtherscanLink"
			class="text-xl px-3 py-2 underline italic"
		>View on Etherscan</a>
		<font-awesome-icon
			@click="this.$emit('closeFlashMessage')"
			class="absolute top-0 right-0 text-3xl"
			icon="times-circle"
		/>
	</div>
</template>
