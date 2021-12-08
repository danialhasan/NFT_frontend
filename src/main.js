import { createApp } from 'vue';
import './tailwind.css';
import App from './App.vue';
import { routes } from './routes.js';
import { createRouter, createWebHistory } from 'vue-router';

import { library, icon } from '@fortawesome/fontawesome-svg-core';
import { faExternalLinkSquareAlt, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faExternalLinkSquareAlt, faTimesCircle);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);

const router = createRouter({
	history: createWebHistory(),
	routes,
});

app.use(router);
app.mount('#app');
