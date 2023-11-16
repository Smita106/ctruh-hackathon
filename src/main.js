import './style.css';
import {initHomeApp} from './components/controllers/homeappcontroller';
import { initViewerApp } from './components/controllers/propertyviewer';


async function initHome(){
    const homeApp = initHomeApp();
    homeApp.mount('#homeAppContainer');
}
async function initViewer(){
    const url = new URL(window.location.href);
    const propID = url.searchParams.get("propertyid");
    const viewerApp = initViewerApp(propID);
    viewerApp.mount('#propertyViewerContainer');
}

function main(){
    const currentScript= document.getElementById('mainScript');
    if(currentScript == null){
        try {
            initHome();
        }
        catch(err) {
        console.log(err);
        }
        try {
            initViewer();
        }
        catch(err) {
        console.log(err);
        } 
    }else{
        if(currentScript.getAttribute('page') === 'mainapp'){
            initHome();
        }else if(currentScript.getAttribute('page') === 'propertyviewerapp'){
            initWeddingRingApp();
        }
    }
}

window.onload = function() {
    main();
};
