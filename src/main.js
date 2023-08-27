import './style.css';
import {initHomeApp} from './components/controllers/homeappcontroller';

async function main(){
    const homeApp = initHomeApp();
    homeApp.mount('#homeAppContainer');
}

main();
