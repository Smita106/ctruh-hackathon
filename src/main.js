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
function displayLandscapeWarning(){
    const container = document.createElement("div");
    container.setAttribute("id", "landscapeStopperDiv");
    container.innerHTML = '<h1>Please turn back to potrail mode for better experience</h1>';
    document.body.appendChild(container);
}

function removeLandscapeWarning(){
    const container = document.getElementById("landscapeStopperDiv");
    if(container !=null){
        document.body.removeChild(container);
    }
}
function orientationManager(type){
    if(mobileDevice && (type == 'landscape-primary' || type == 'landscape-secondary')){
        displayLandscapeWarning();
    }else{
        removeLandscapeWarning();
    }
}
let mobileDevice = false;
if(screen.height > screen.width){
    mobileDevice = true;
}
orientationManager(screen.orientation.type);

screen.orientation.addEventListener("change", (event) => {
    orientationManager(event.target.type);
  });

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
