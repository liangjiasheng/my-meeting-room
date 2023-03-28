import { createApp } from 'vue';
import './style.css';
import '@unocss/reset/tailwind.css';
import 'uno.css';
import 'element-plus/es/components/message/style/css';
import App from './App.vue';
import router from '@/router';
import '@/samples/node-api';

createApp(App)
  .use(router)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
  });
