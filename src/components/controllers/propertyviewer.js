import { createApp } from "vue/dist/vue.esm-bundler.js";
import {properties, amenitiesIconMap} from "../../propertyData";
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GroundProjectedSkybox } from 'three/addons/objects/GroundProjectedSkybox.js';

let viewerApp;
let bigCanvas = true;
let rootMarginValue = Math.floor(screen.height*0.20);
let isIOS = false;
let prevScrollpos = window.screenY;
let sprite;
let maxFov;
const propertyParticulars = [
    {
        no: 1,
        name: 'corridor',
        area: 18,
        pos: new THREE.Vector3(7.7,3.5,8.8),
        lookAt: new THREE.Vector3(5,10,0),
    },
    {
        no: 2,
        name: 'living room',
        area: 26,
        pos: new THREE.Vector3(3.4,3.5,-3.0),
        lookAt: new THREE.Vector3(-1.2,4,0),
    },
    {
        no: 3,
        name: 'kitchen',
        area: 15,
        pos: new THREE.Vector3(1.7,3.5,2.4),
        lookAt: new THREE.Vector3(0,3,0),
    },
    {
        no: 4,
        name: 'wc',
        area: 11,
        pos: new THREE.Vector3(-3.2,3.5,13),
        lookAt: new THREE.Vector3(0,3,0),
    },
    {
        no: 5,
        name: 'bedroom',
        area: 24,
        pos: new THREE.Vector3(-9.8,3.5,9.7),
        lookAt: new THREE.Vector3(0,3,0),
    },
    {
        no: 6,
        name: 'Dinning',
        area: 12,
        pos: new THREE.Vector3(-6.7,3.5,1.9),
        lookAt: new THREE.Vector3(0,3,0),
    },
    {
        no: 7,
        name: 'WC',
        area: 14,
        pos: new THREE.Vector3(13.2,3.5,7.1),
        lookAt: new THREE.Vector3(0,3,0),
    },
    {
        no: 8,
        name: 'bedroom',
        area: 28,
        pos: new THREE.Vector3(14,3.5,-4),
        lookAt: new THREE.Vector3(0,3,0),
    }
];
const initViewerApp = function (initPropID) {
    viewerApp = createApp({ props: [] }, {
        properties:[],
    });

    viewerApp.component('headercmp',{
        props:[],
        data(){
            return{};
        },
        created(){
        },
        mounted(){
        },
        template: `
        <div id="headerPanelID" class="headerPanel" :style="{'opacity': showPropertyMode ? '0.5':'1'}">
            <figure class="logo">
                <img src="./assets/images/logo.jpg">
            </figure>
            <nav id="navright" class="nav">
                <ul class="slider-ul">
                    <li class="slider-li">
                    <a class="sliderA is-active" href="/MyHome_realestate/index.html"><span class="navSpan">Home</span></a>
                    </li>
                    <li class="slider-li">
                            <a class="sliderA" href="#"><span class="navSpan">About</span></a>
                    </li>
                    <li class="slider-li">
                            <a class="sliderA" href="#"><span class="navSpan">Blogs</span></a>
                    </li>
                    <li class="slider-li">
                            <a class="sliderA" href="#"><span class="navSpan">Contact Us</span></a>
                    </li>
                    <li class="slider-li">
                    <a class="sliderA" href="#">
                        <span>Account</span>
                    </a>
                    </li>
                </ul>
            </nav>
        </div>
        `
    }); 
    viewerApp.component('planviewer',{
        props:['propID', 'propertyData'],
        data(){
            return{
                immersiveMode : false,
                isFullScreen: false,
            };
        },
        created(){
        },
        mounted(){
            this.canvas = document.getElementById('planViewerCanvas');
            for(const particular of propertyParticulars){
                particular.annotation = document.getElementById('annotation'+particular.no);
            }
            this.initViewerEngine();
        },
        methods:{
            getParticulars(){
                return propertyParticulars;
            },
            isIOSDevice(){
                return isIOS;
            },
            initViewerEngine(){
                this.canvasWidth = this.canvas.getBoundingClientRect().width;
                this.canvasHeight = this.canvas.getBoundingClientRect().height;
                this.renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias:true});
                this.renderer.setSize(this.canvasWidth, this.canvasHeight);
                this.renderer.setPixelRatio( window.devicePixelRatio );
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color('#606070');
                this.camera = new THREE.PerspectiveCamera(bigCanvas ? 10: 20 , this.canvasWidth/this.canvasHeight,1,3000);
                this.camera.position.set(0,180,0);
                this.controls = new OrbitControls(this.camera,  this.renderer.domElement);
                this.controls.zoomSpeed = bigCanvas ? 3 : 1 ;
                this.controls.rotateSpeed = bigCanvas ? 0.2 : 0.8;
                this.controls.maxDistance = 300;
                this.controls.minDistance = 2;
                this.controls.maxPolarAngle = Math.PI/2;
                this.scene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, 2 ) );
                const light = new THREE.DirectionalLight( 0xffffff, 1 );
                light.position.set( -10, 100, 0 );
                this.scene.add( light );
                const loader = new GLTFLoader()
                const dracoLoader = new DRACOLoader()
                dracoLoader.setDecoderPath('./libs/draco/');
                loader.setDRACOLoader(dracoLoader)
                loader.load( './assets/model/simple3Dplan.glb', this.gltFLoaded);
                new THREE.TextureLoader().load( './assets/model/sky7.jpg', this.bgLoadComplete );
                //Enable rendering only when canvas is visible in viewport
                let observer = new IntersectionObserver(this.manageRendererByVisibility,{
                    root: null,
                    rootMargin: rootMarginValue+'px 0px',
                    threshold: 0.1,
                });
                observer.observe(document.getElementById('planViewerCanvas'));
            },
            gltFLoaded(gltf){
                this.model = gltf.scene;
                this.ceiling = gltf.scene.children[1];
                this.ceiling.visible = false;
                gltf.scene.scale.set(1,1,1);
                gltf.scene.position.set(0,0,0);
                const p1 = new THREE.PointLight( 0xffffff, 15, 100 );
                p1.position.set( -2, 6.5, 3 );
                this.scene.add( p1 );
                const p2 = new THREE.PointLight( 0xffffff, 25, 100 );
                p2.position.set( -2, 6.5, -4 );
                this.scene.add( p2 );
                const p3 = new THREE.PointLight( 0xffffff, 25, 100 );
                p3.position.set( -2, 6.5, -8 );
                this.scene.add( p3 );
                const p4 = new THREE.PointLight( 0xffffff, 25, 100 );
                p4.position.set( -10, 6.5, 0 );
                this.scene.add( p4 );
                const p5 = new THREE.PointLight( 0xffffff, 25, 100 );
                p5.position.set( -12, 6.5, 6 );
                this.scene.add( p5 );
                const p6 = new THREE.PointLight( 0xffffff, 25, 100 );
                p6.position.set( 13, 6.5, 5 );
                this.scene.add( p6 );
                const p7 = new THREE.PointLight( 0xffffff, 25, 100 );
                p7.position.set( 12, 6.5, -5 );
                this.scene.add( p7 );
                // const sphereSize = 1;
                // const pointLightHelper = new THREE.PointLightHelper( p1, sphereSize );
                // this.scene.add( pointLightHelper );
                this.scene.add(gltf.scene);
            },
            bgLoadComplete(texture){
                this.skybox = new GroundProjectedSkybox( texture );
				this.skybox.scale.setScalar( 1000 );
                this.skybox.height = 80;
				this.scene.add( this.skybox );
                this.skybox.visible = false;
            },
            startRendering(){
                this.renderer.setAnimationLoop(this.animate);
            },
            animate(){
				this.renderer.render( this.scene, this.camera );
                this.updateAnnotationScreenPosition();
            },
            suspendRendering(){
                this.renderer.setAnimationLoop(null);
            },
            manageRendererByVisibility(entries, observer){
                entries.forEach(entry => {
                    if (
                        entry &&
                        entry.isIntersecting &&
                        entry.intersectionRatio >= 0.1
                      ){
                    this.startRendering();
                      }else{
                        this.suspendRendering();
                      }
                  });
            },
            resetPlanView(){
                this.ceiling.visible = false;
                this.immersiveMode = false;
                this.camera.fov = bigCanvas ? 10: 20;
                this.camera.position.set(0,180,0);
                this.camera.updateProjectionMatrix();
                this.controls.zoomSpeed = bigCanvas ? 3 : 1 ;
                this.controls.maxPolarAngle = Math.PI/2;
                this.controls.reset();
                if(this.skybox!=null)
                    this.skybox.visible = false;
            },
            isBigCanvas(){
                return bigCanvas;
            },
            updateLookAt(){
                this.factor += 0.005;
                this.camera.fov = Math.min(10+ this.factor*(maxFov-10)*3,maxFov);
                this.camera.updateProjectionMatrix(); 
                this.controls.update();
            },
            updateFov(){
                if (this.skybox!=null)
                    this.skybox.visible = true;
                delete this.camera._gsTweenID;
                this.ceiling.visible = true;
                this.camera.fov = maxFov;
                this.camera.lookAt(this.particular.lookAt);
                this.camera.updateProjectionMatrix();
                this.controls.zoomSpeed = 1 ;
                this.controls.maxPolarAngle = Math.PI;
                this.controls.update();

            },
            moveToView(particular){
                this.resetPlanView();
                this.immersiveMode = true;
                this.particular = particular;
                this.factor = 0;
                this.controls.zoomSpeed = 1;
                this.controls.target.x = this.particular.pos.x-0.5;
                this.controls.target.y = this.particular.pos.y+0.2;
                this.controls.target.z = this.particular.pos.z-0.5;
                this.camera.updateProjectionMatrix();
                TweenMax.to(this.camera.position,1.5, {
                    x: particular.pos.x,
                    y: particular.pos.y+0.2,
                    z: particular.pos.z,
                    onUpdate: this.updateLookAt,
                    onComplete: this.updateFov,
                    ease: Sine.easeOut,
                  },
                );
                TweenMax.to(this.camera,1.5, {
                    zoom: 0.5,
                    onUpdate: ()=>{this.camera.updateProjectionMatrix();},
                    ease: Sine.easeOut,
                  },
                );
            },
            async openARView(){
                this.suspendRendering();
                document.body.style.overflow = 'hidden';
                const arCanvas = document.createElement('canvas');
                arCanvas.setAttribute("id", "adroidARViewer");
                document.body.appendChild(arCanvas);
                const gl = arCanvas.getContext("webgl", {xrCompatible: true});
                const arScene = new THREE.Scene();

                // The cube will have a different color on each side.
                const materials = [
                new THREE.MeshBasicMaterial({color: 0xff0000}),
                new THREE.MeshBasicMaterial({color: 0x0000ff}),
                new THREE.MeshBasicMaterial({color: 0x00ff00}),
                new THREE.MeshBasicMaterial({color: 0xff00ff}),
                new THREE.MeshBasicMaterial({color: 0x00ffff}),
                new THREE.MeshBasicMaterial({color: 0xffff00})
                ];
                // arScene.add( new THREE.HemisphereLight( 0xaaaaaa, 0x444444, 2 ) );
                const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10), materials);
                cube.position.set(0, 0, 0);
                arScene.add(cube);
                const arRenderer = new THREE.WebGLRenderer({
                    alpha: true,
                    preserveDrawingBuffer: true,
                    canvas: arCanvas,
                    context: gl
                  });
                arRenderer.autoClear = false;
                // arRenderer.setSize(window.innerWidth, window.innerHeight);
                const arCamera = new THREE.PerspectiveCamera();
                arCamera.matrixAutoUpdate = false;

                const session = await navigator.xr.requestSession("immersive-ar");
                session.updateRenderState({
                    baseLayer: new XRWebGLLayer(session, gl)
                });

                const referenceSpace = await session.requestReferenceSpace('local');

                //Render loop to draw on the AR view.
                const onXRFrame = (time, frame) => {
                    // Queue up the next draw request.
                    session.requestAnimationFrame(onXRFrame);
                    // Bind the graphics framebuffer to the baseLayer's framebuffer
                    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
                
                    // Retrieve the pose of the device.
                    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
                    const pose = frame.getViewerPose(referenceSpace);
                    if (pose) {
                    // In mobile AR, we only have one view.
                    const view = pose.views[0];
                
                    const viewport = session.renderState.baseLayer.getViewport(view);
                    arRenderer.setSize(viewport.width, viewport.height)
                
                    // Use the view's transform matrix and projection matrix to configure the THREE.camera.
                    arCamera.matrix.fromArray(view.transform.matrix)
                    arCamera.projectionMatrix.fromArray(view.projectionMatrix);
                    arCamera.updateMatrixWorld(true);
                
                    // Render the scene with THREE.WebGLRenderer.
                    arRenderer.render(arScene, arCamera)
                    }
                }
                session.requestAnimationFrame(onXRFrame);
            },
            updateAnnotationScreenPosition() {
                for(const particular of propertyParticulars){
                    const vector = new THREE.Vector3(0,0,0);
                    vector.copy(particular.pos);
                    vector.y= 1;
                    const canvas = this.renderer.domElement;
                    vector.project(this.camera);
                    vector.x = Math.round((0.5 + vector.x / 2) * (canvas.width / window.devicePixelRatio));
                    vector.y = Math.round((0.5 - vector.y / 2) * (canvas.height / window.devicePixelRatio));
                    if(vector.y < 0 || vector.x < 0 || vector.y > this.canvasHeight || vector.x > this.canvasWidth || this.immersiveMode){
                        particular.annotation.style.display = 'none';
                    }else{
                        particular.annotation.style.display = 'block';
                        particular.annotation.style.top = `calc(${vector.y}px - 0.7rem)`;
                        particular.annotation.style.left = `calc(${vector.x}px - 0.7rem)`;
                    }
                }
            },
            toggleFullScreen(){
                this.isFullScreen = !this.isFullScreen;
                const container = document.getElementById('planViewerContainer');
                const particularContainer = document.getElementById('planParticularsContainer');
                const viewerControlContainer = document.getElementById('planViewerControlsDiv');
                const toggleControlContainer = document.getElementById('fullScreenControls');
                const canvas = document.getElementById('planViewerCanvas');
                if(this.isFullScreen){
                    document.body.style.overflow = 'hidden';
                    container.classList.remove('planViewerContainerSmall');
                    container.classList.add('planViewerContainerLarge');
                    canvas.style.width = '85%';
                    canvas.style.height = '100%';
                    this.canvasHeight = canvas.getBoundingClientRect().height;
                    this.canvasWidth = canvas.getBoundingClientRect().width;
                    this.camera.aspect = this.canvasWidth / this.canvasHeight;
				    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(canvas.getBoundingClientRect().width,canvas.getBoundingClientRect().height);
                    viewerControlContainer.style.top = 'calc(100vh - 5rem)';
                    viewerControlContainer.style.right = 'calc(15% + 2rem)';
                    toggleControlContainer.style.right = 'calc(15% + 1.5rem)';
                    for(const annotation of document.getElementsByClassName('annotationDiv')){
                        annotation.style.position = 'fixed';
                        annotation.style.width = '2rem';
                        annotation.style.height = '2rem';
                        annotation.style.lineHeight = '2rem';
                        annotation.style.fontSize = '20px';
                    }
                    particularContainer.classList.remove('planParticularsContainerSmall');
                    particularContainer.classList.add('planParticularsContainerFull');
                    for(const particular of document.getElementsByClassName('planParticularsDiv')){
                        particular.style.marginBottom = '1rem';
                    }
                }else{
                    document.body.style.removeProperty('overflow');
                    container.classList.remove('planViewerContainerLarge');
                    container.classList.add('planViewerContainerSmall');
                    canvas.style.removeProperty('width');
                    canvas.style.removeProperty('height');
                    this.canvasHeight = canvas.getBoundingClientRect().height;
                    this.canvasWidth = canvas.getBoundingClientRect().width;
                    this.camera.aspect = this.canvasWidth / this.canvasHeight;
				    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(canvas.getBoundingClientRect().width,canvas.getBoundingClientRect().height);
                    viewerControlContainer.style.removeProperty('top');
                    viewerControlContainer.style.removeProperty('right');
                    toggleControlContainer.style.removeProperty('right');
                    for(const annotation of document.getElementsByClassName('annotationDiv')){
                        annotation.style.position = 'absolute';
                        annotation.style.width = '1.4rem';
                        annotation.style.height = '1.4rem';
                        annotation.style.lineHeight = '1.4rem';
                        annotation.style.fontSize = '15px';
                    }
                    particularContainer.classList.remove('planParticularsContainerFull');
                    particularContainer.classList.add('planParticularsContainerSmall');
                    for(const particular of document.getElementsByClassName('planParticularsDiv')){
                        particular.style.removeProperty('margin-bottom');
                    }
                }
            }
        },
        template: `
            <div id="planViewerContainer" class="planViewerContainerSmall">
                <div id="planViewerControlsDiv">
                    <button class="planViewerControls" style="padding:0.5rem" @click="resetPlanView()">
                        <img style="height:100%; width:100%" src="./assets/images/reset.svg">
                    </button>
                    <a v-if="isIOSDevice() && !isBigCanvas()" class="planViewerControls" id="arLink" rel="ar" href="./assets/model/simple3Dplan.usdz">
                        <img style="height:100%; width:100%" src="./assets/images/ios-arkit.svg">
                    </a>
                    <button v-if="!isIOSDevice() && !isBigCanvas()" class="planViewerControls" @click="openARView()">
                        <img style="height:100%; width:100%" src="./assets/images/ios-arkit.svg">
                    </button>
                </div>
                <div id="fullScreenControls">
                    <button class="planViewerControls" style="padding:0.65rem" @click="toggleFullScreen()">
                        <img v-if="isFullScreen" style="height:100%; width:100%" src="./assets/images/minimize.svg">
                        <img v-else style="height:100%; width:100%" src="./assets/images/fullscreen.svg">
                    </button>
                </div>
                <canvas id="planViewerCanvas"></canvas>
                <div class="annotationDiv" :id="'annotation'+particular.no" v-for="particular in getParticulars()" @click="moveToView(particular)" :title="particular.name">{{particular.no}}</div>
                <canvas id="planViewerAnnotationCanvas"></canvas>
                <div id="planParticularsContainer" class="planParticularsContainerSmall">
                    <div class="planParticularsDiv" v-for="particular in getParticulars()" @click="moveToView(particular)">
                        <div class="planParticularSlNo">{{particular.no}}</div>
                        <div class="planParticular">{{particular.name}}</div>
                        <div class="planParticularArea"><span style="font-weight:600">{{particular.area}}</span>m²</div>
                    </div>
                </div>
            </div>
        `,     
    });
    viewerApp.component('propertyviewerpage',{
        props:[],
        data(){
            return{
                propID: initPropID,
                propertyData: null,
                activeSection: 'overviewSection',
                activeImage: '',
                thumbnails: [],
            };
        },
        created(){
            if(screen.width<=500){
                bigCanvas = false;
            }
            maxFov = bigCanvas ? 30 : 50;
            isIOS = /iPad|iPhone|iPod/.test( navigator.userAgent );

            for(const pro of properties){
                this.thumbnails.push(pro.imagename);
            }
            this.activeImage = this.thumbnails[0];

            const result = properties.filter((p)=> p.id == initPropID);
            if(result.length ==0){
                alert("wrong property ID");
            }else{
                this.propertyData = result[0];
                this.activeImage = result[0].imagename;
            }
        },
        mounted(){
            this.sectionsDom = [];
            this.sectionsDom.push(document.getElementById('overviewSection'));
            this.sectionsDom.push(document.getElementById('planSection'));
            this.sectionsDom.push(document.getElementById('amenitiesSection'));
            this.sectionsDom.push(document.getElementById('localitySection'));
            this.sectionsDom.push(document.getElementById('builderSection'));
            window.onscroll = this.onScroll;
        },
        methods:{
            onScroll(){
                const currentScrollPos = window.scrollY;
                if (prevScrollpos > currentScrollPos) {
                    document.getElementById("headerPanelID").style.top = "0";
                } else {
                    document.getElementById("headerPanelID").style.top = "-5rem";
                }
                prevScrollpos = currentScrollPos;
                for(const section of this.sectionsDom){
                    if(section !=null || section != undefined){
                        if(section.getBoundingClientRect().top >= 0 && section.getBoundingClientRect().top < window.innerHeight / 2){
                            this.setActiveSection(section.id);
                        }
                    }
                }
            },
            setActiveSection(section){
                this.activeSection = section;
            },
            getImageSrc(){
                return './assets/images/' + this.activeImage;
            },
            showImage(image){
                this.activeImage = image;
            },
            goTo3DSection(){
                window.location.href = "#planSection";
            },
            isBigCanvas(){
                return bigCanvas;
            },
            getSvgFileNameForAmenity(amenity){
                if(amenity in amenitiesIconMap){
                    return amenitiesIconMap[amenity];
                }
                return amenitiesIconMap['default'];
            }
        },
        template: `
            <headercmp></headercmp>
            <div id="viewerBody">
                <div id="sidenav">
                    <a class="sidenavItem" :class="activeSection == 'overviewSection' ? 'activeSideNavItem' : ''" href="#overviewSection" @click="setActiveSection('overviewSection')">
                        <span class="sidenavIconContainer">
                            <svg class="sidenavIcon" viewBox="0 0 6 12" fill="none">
                                <g clip-path="url(#clip0)"><path d="M1.09961 9.94287H1.59961V6.55713H1.09961C0.823459 6.55713 0.599609 6.34727 0.599609 6.08838V4.96875C0.599609 4.70986 0.823459 4.5 1.09961 4.5H3.89961C4.17576 4.5 4.39961 4.70986 4.39961 4.96875V9.94287H4.89961C5.17576 9.94287 5.39961 10.1527 5.39961 10.4116V11.5312C5.39961 11.7901 5.17576 12 4.89961 12H1.09961C0.823459 12 0.599609 11.7901 0.599609 11.5312V10.4116C0.599609 10.1527 0.823459 9.94287 1.09961 9.94287ZM2.99961 0C2.00548 0 1.19961 0.755508 1.19961 1.6875C1.19961 2.61949 2.00548 3.375 2.99961 3.375C3.99373 3.375 4.79961 2.61949 4.79961 1.6875C4.79961 0.755508 3.99371 0 2.99961 0Z" fill="white"></path></g>
                                <defs><clipPath id="clip0"><rect width="4.8" height="12" fill="white" transform="translate(0.599609)"></rect></clipPath></defs>
                            </svg>
                        </span>
                        <span class="sidenameItemTitle" :class="activeSection == 'overviewSection' ? 'activeSidenameItemTitle' : ''" >Overview</span>
                    </a>
                    <a class="sidenavItem" :class="activeSection == 'planSection' ? 'activeSideNavItem' : ''" href="#planSection" @click="setActiveSection('planSection')">
                        <span class="sidenavIconContainer">
                        <svg class="sidenavIcon" fill="white" viewBox="0 0 284.999 284.999">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g id="SVGRepo_iconCarrier"> <g> <g> 
                            <path d="M278.222,33.93H74.64c-1.794,0-3.514,0.714-4.794,1.985l-67.86,67.861C0.724,105.047,0,106.77,0,108.57v135.712 c0,3.748,3.037,6.788,6.778,6.788h271.443c3.741,0,6.778-3.04,6.778-6.788V40.718C285,36.97,281.963,33.93,278.222,33.93z M271.424,237.503H13.576V115.357H74.64c3.76,0,6.797-3.04,6.797-6.788V47.497h189.987V237.503z"></path>
                            <path d="M61.063,135.709c-3.742,0-6.778,3.04-6.778,6.788v50.898c0,3.748,3.036,6.779,6.778,6.779h169.651 c3.742,0,6.779-3.031,6.779-6.779V91.604c0-3.748-3.037-6.779-6.779-6.779h-67.86c-3.742,0-6.778,3.031-6.778,6.779v44.104H61.063 V135.709z M190.006,149.285v37.323h-74.657v-37.323H190.006z M67.86,149.285h33.931v37.323H67.86V149.285z M203.563,186.607 v-37.323h20.373v37.323H203.563z M223.937,98.393v37.316h-54.285V98.393H223.937z"></path>
                            </g> </g> </g></svg>
                        </span>
                        <span class="sidenameItemTitle" :class="activeSection == 'planSection' ? 'activeSidenameItemTitle' : ''" >Plan Details</span>
                    </a>
                    <a class="sidenavItem" :class="activeSection == 'amenitiesSection' ? 'activeSideNavItem' : ''" href="#amenitiesSection" @click="setActiveSection('amenitiesSection')">
                        <span class="sidenavIconContainer">
                            <svg class="sidenavIcon" viewBox="0 0 12 12" fill="none" >
                                <path d="M10.8723 8.57286V5.26481C10.8723 4.63034 10.3561 4.11408 9.72153 4.11408H2.43497V2.92207C2.43497 2.74608 2.34712 2.58309 2.19989 2.48588L0.880808 1.6153C0.728831 1.51499 0.52443 1.55689 0.42419 1.7088C0.323812 1.86078 0.365711 2.06518 0.517619 2.16542L1.77581 2.99589V8.57286C1.34272 8.71142 1.02852 9.11548 1.02852 9.59109C1.02852 10.1808 1.51156 10.6606 2.10543 10.6606C2.69916 10.6606 3.18234 10.1808 3.18234 9.59109C3.18234 9.11548 2.86813 8.71142 2.43497 8.57286V8.29058H10.213V8.57286C9.77994 8.71142 9.46573 9.11548 9.46573 9.59109C9.46573 10.1808 9.94877 10.6606 10.5426 10.6606C11.1364 10.6606 11.6195 10.1808 11.6195 9.59109C11.6195 9.11548 11.3053 8.71149 10.8723 8.57286Z" fill="white"></path><path d="M6.65373 2.00068V1.54213C6.65373 1.36009 6.50609 1.21259 6.32419 1.21259C6.14208 1.21259 5.99457 1.36009 5.99457 1.54213V2.00068C5.25643 2.13621 4.67294 2.71839 4.53693 3.45508H8.11131C7.97529 2.71839 7.39181 2.13621 6.65373 2.00068Z" fill="white"></path>
                            </svg>
                        </span>
                        <span class="sidenameItemTitle" :class="activeSection == 'amenitiesSection' ? 'activeSidenameItemTitle' : ''">Amenities</span>
                    </a>
                    <a class="sidenavItem" :class="activeSection == 'localitySection' ? 'activeSideNavItem' : ''" href="#localitySection" @click="setActiveSection('localitySection')">
                        <span class="sidenavIconContainer">
                        <svg class="sidenavIcon" viewBox="-1.5 0 15 15" fill="white">
                            <g stroke-linecap="round" stroke-linejoin="round"></g>
                            <g><path fill="white" fill-rule="evenodd" d="M574,120 C575.324428,120 580,114.054994 580,110.833333 C580,107.611672 577.313708,105 574,105 C570.686292,105 568,107.611672 568,110.833333 C568,114.054994 572.675572,120 574,120 Z M574,113.333333 C575.420161,113.333333 576.571429,112.214045 576.571429,110.833333 C576.571429,109.452621 575.420161,108.333333 574,108.333333 C572.579839,108.333333 571.428571,109.452621 571.428571,110.833333 C571.428571,112.214045 572.579839,113.333333 574,113.333333 Z" transform="translate(-568 -105)">
                            </path> </g>
                        </svg>
                        </span>
                        <span class="sidenameItemTitle" :class="activeSection == 'localitySection' ? 'activeSidenameItemTitle' : ''">Locality</span>
                    </a>
                    <a class="sidenavItem" :class="activeSection == 'builderSection' ? 'activeSideNavItem' : ''" href="#builderSection" @click="setActiveSection('builderSection')">
                        <span class="sidenavIconContainer">
                        <svg class="sidenavIcon" viewBox="0 0 24 24" fill="none">
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                            <g><path fill-rule="evenodd" clip-rule="evenodd" d="M16.5 7.063C16.5 10.258 14.57 13 12 13c-2.572 0-4.5-2.742-4.5-5.938C7.5 3.868 9.16 2 12 2s4.5 1.867 4.5 5.063zM4.102 20.142C4.487 20.6 6.145 22 12 22c5.855 0 7.512-1.4 7.898-1.857a.416.416 0 0 0 .09-.317C19.9 18.944 19.106 15 12 15s-7.9 3.944-7.989 4.826a.416.416 0 0 0 .091.317z" fill="white">
                            </path></g>
                        </svg>
                        </span>
                        <span class="sidenameItemTitle" :class="activeSection == 'builderSection' ? 'activeSidenameItemTitle' : ''">About Developer</span>
                    </a>
                </div>
                <div id="sectionArea">
                    <div id="sectionContainer">
                        <div id="overviewSection">
                            <h1 id="propertyTitle">{{propertyData.name}}</h1>
                            <h2 id="propertySubTitle">By {{propertyData.builder}}</h2>
                            <h3 id="propertyBodyTitle">
                                <svg id="propertyBodyLocation" viewBox="-1.5 0 15 15" fill="rgb(77, 77, 77)">
                                <g stroke-linecap="round" stroke-linejoin="round"></g>
                                <g><path fill="rgb(77, 77, 77)" fill-rule="evenodd" d="M574,120 C575.324428,120 580,114.054994 580,110.833333 C580,107.611672 577.313708,105 574,105 C570.686292,105 568,107.611672 568,110.833333 C568,114.054994 572.675572,120 574,120 Z M574,113.333333 C575.420161,113.333333 576.571429,112.214045 576.571429,110.833333 C576.571429,109.452621 575.420161,108.333333 574,108.333333 C572.579839,108.333333 571.428571,109.452621 571.428571,110.833333 C571.428571,112.214045 572.579839,113.333333 574,113.333333 Z" transform="translate(-568 -105)">
                                </path> </g>
                                </svg>
                                {{propertyData.address}}
                            </h3>
                            <div id="propertyOverviewContainer">
                                <div id="propertyOverviewImageContainer">
                                    <div id="propertyImageViewer">
                                        <img style="height:100%; width:100%;" :src="getImageSrc()">
                                    </div>
                                    <div id="thumbnailContainer">
                                        <div class="overviewThumbnails" :style="{'border': thumb == activeImage ? '3px solid #9d0139' : '3px solid #f5f5fa'}" v-for="thumb in thumbnails" @click="showImage(thumb)">
                                            <img style="height:100%; width:100%;object-fit: cover;" :src="'./assets/images/'+thumb">
                                        </div>
                                    </div>
                                </div>
                                <div id="propertyVarietyContainer">
                                    <div class="flatOptionsDiv">
                                        <span class="flatOptions">2 BHK</span>
                                        <span class="flatOptionsPrice">1.84Cr - 2.09Cr</span>
                                    </div>
                                    <div class="flatOptionsDiv">
                                        <span class="flatOptions">3 BHK</span>
                                        <span class="flatOptionsPrice">2.50Cr - 3.10Cr</span>
                                    </div>
                                    <div class="flatOptionsDiv">
                                        <span class="flatOptions">4 BHK</span>
                                        <span class="flatOptionsPrice">5.24Cr - 5.54Cr</span>
                                    </div>
                                    <button id="moveTo3D" @click="goTo3DSection()">
                                        <svg id="icon3D" viewBox="0 0 24 24" fill="none" ><g stroke-linecap="round" stroke-linejoin="round"></g>
                                            <g> <path d="M4 7.5L11.6078 3.22062C11.7509 3.14014 11.8224 3.09991 11.8982 3.08414C11.9654 3.07019 12.0346 3.07019 12.1018 3.08414C12.1776 3.09991 12.2491 3.14014 12.3922 3.22062L20 7.5M4 7.5V16.0321C4 16.2025 4 16.2876 4.02499 16.3637C4.04711 16.431 4.08326 16.4928 4.13106 16.545C4.1851 16.6041 4.25933 16.6459 4.40779 16.7294L12 21M4 7.5L12 11.5M12 21L19.5922 16.7294C19.7407 16.6459 19.8149 16.6041 19.8689 16.545C19.9167 16.4928 19.9529 16.431 19.975 16.3637C20 16.2876 20 16.2025 20 16.0321V7.5M12 21V11.5M20 7.5L12 11.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
                                        </svg>
                                        <span>3D Plan</span>
                                    </button>
                                </div>
                            </div>
                            <div id="overviewDescriptionContainer">
                                <div id="oviewDescriptionHeading">Description
                                </div>
                                <p class="oviewDescription">{{propertyData.description}}</p>
                                <p class="oviewDescription">{{propertyData.description}}</p>
                                <p class="oviewDescription">{{propertyData.description}}</p>
                            </div>
                        </div>
                        <div id="planSection">
                            <div class="sectionHeader">
                                <span>View Plan 3D layout</span>
                            </div>
                            <planviewer :propID=propID :propertyData=propertyData></planviewer>
                            <div class="sectionDetailContainer" v-if="isBigCanvas()">
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Area</div>
                                        <div class="planDetailBody">820 - 902 (SqFt)</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Possession Year</div>
                                        <div class="planDetailBody">2025</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">BHK</div>
                                        <div class="planDetailBody">2</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Facing</div>
                                        <div class="planDetailBody">North-West</div>
                                    </div>
                                </div>
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Total Units</div>
                                        <div class="planDetailBody">800</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Possession Status</div>
                                        <div class="planDetailBody">Under Construction</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Furnishing Status</div>
                                        <div class="planDetailBody">Unfurnished</div>
                                    </div>
                                </div>
                                <div id="planDescriptionHeading">Description
                                </div>
                                <div class="oviewDescription">
                                    Nestled amidst the tranquil, lush greenery of Thane, Lodha Sterling redefines luxury living with its meticulously designed residences. This under construction project in Thane is scheduled for possession in September 2025.
                                    <ul>
                                        <li>This property in Thane has 800 units spread across multiple floors, and this residential complex is designed to provide residents with a serene and sophisticated living experience.</li>
                                        <li>Lodha Sterling Thane offers a range of meticulously crafted homes in 2BHK, 3BHK, and 4BHK configurations to cater to diverse lifestyles.</li>
                                        <li>One of the standout features of this luxury flat in Thane is the expansive carpet areas of the residences, offering ample space for comfort and personalisation.</li>
                                        <li>&nbsp;The 2BHK apartments range from 820.00 sq. ft to 902.00 sq. ft, the 3BHK apartments range from 1041.00 sq. ft to 1266.00 sq. ft, and the 4BHK apartments boast a generous 2040.00 sq. ft of space.</li>
                                        <li>This residential project in Thane is strategically located on Kolshet Road, Thane (West), ensuring excellent connectivity to Mumbai and other key destinations.&nbsp;</li>
                                        <li>Lodha Sterling Pricing starts at INR 1.84 crore for 2BHK, INR 2.5 crore for 3BHK, and INR 5.54 crore for 4BHK, making it accessible to many homebuyers.</li>
                                        <li>With a launch date in March 2019, this apartment in Thane promises a lifestyle that blends modern comforts, lush landscapes, and a thriving community.</li>
                                        <li>&nbsp;It's a testament to luxurious living in the heart of nature, where every detail is designed to elevate your living experience. Take your chance to be a part of this iconic residential destination that embodies the perfect blend of comfort, style, and convenience.</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="sectionDetailContainer" v-else>
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Area</div>
                                        <div class="planDetailBody">820 - 902 (SqFt)</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Possession Year</div>
                                        <div class="planDetailBody">2025</div>
                                    </div>
                                </div>
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">BHK</div>
                                        <div class="planDetailBody">2</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Facing</div>
                                        <div class="planDetailBody">North-West</div>
                                    </div>
                                </div>
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Total Units</div>
                                        <div class="planDetailBody">800</div>
                                    </div>
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Possession Status</div>
                                        <div class="planDetailBody">Under Construction</div>
                                    </div>
                                </div>
                                <div class="planDetailRow">
                                    <div class="planDetailColumn">
                                        <div class="planDetailHeading">Furnishing Status</div>
                                        <div class="planDetailBody">Unfurnished</div>
                                    </div>
                                </div>
                                <div class="oviewDescription" style="margin-top:1rem">
                                    Nestled amidst the tranquil, lush greenery of Thane, Lodha Sterling redefines luxury living with its meticulously designed residences. This under construction project in Thane is scheduled for possession in September 2025.
                                    <ul>
                                        <li>This property in Thane has 800 units spread across multiple floors, and this residential complex is designed to provide residents with a serene and sophisticated living experience.</li>
                                        <li>Lodha Sterling Thane offers a range of meticulously crafted homes in 2BHK, 3BHK, and 4BHK configurations to cater to diverse lifestyles.</li>
                                        <li>One of the standout features of this luxury flat in Thane is the expansive carpet areas of the residences, offering ample space for comfort and personalisation.</li>
                                        <li>&nbsp;The 2BHK apartments range from 820.00 sq. ft to 902.00 sq. ft, the 3BHK apartments range from 1041.00 sq. ft to 1266.00 sq. ft, and the 4BHK apartments boast a generous 2040.00 sq. ft of space.</li>
                                        <li>This residential project in Thane is strategically located on Kolshet Road, Thane (West), ensuring excellent connectivity to Mumbai and other key destinations.&nbsp;</li>
                                        <li>Lodha Sterling Pricing starts at INR 1.84 crore for 2BHK, INR 2.5 crore for 3BHK, and INR 5.54 crore for 4BHK, making it accessible to many homebuyers.</li>
                                        <li>With a launch date in March 2019, this apartment in Thane promises a lifestyle that blends modern comforts, lush landscapes, and a thriving community.</li>
                                        <li>&nbsp;It's a testament to luxurious living in the heart of nature, where every detail is designed to elevate your living experience. Take your chance to be a part of this iconic residential destination that embodies the perfect blend of comfort, style, and convenience.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="amenitiesSection">
                            <div id="amenitiesSectionHeader">
                                <span>Amenities</span>
                            </div>
                            <div id="amenitieisDetailContainer">
                                <div class="amenitiesDiv" v-for="amenity in propertyData.amenities">
                                    <div class="amenitiesIcon">
                                        <img style="height:100%;width:100%" :src="'./assets/images/'+getSvgFileNameForAmenity(amenity)"/>
                                    </div>
                                    <div class="amenitiesText">
                                        {{amenity}}
                                    </div> 
                                </div>
                            </div> 
                        </div>
                        <div id="localitySection">
                            <div class="sectionHeader">
                                <span>Locality & Neighbourhood</span>
                            </div>
                            <div class="sectionDetailContainer">
                                <div class="oviewDescription">
                                    Kolshet Road, Thane, is a burgeoning locality with immense real estate potential. Situated in the Mumbai metropolitan region, it offers a perfect blend of urban convenience and natural beauty.
                                     This area is witnessing rapid development with numerous residential and commercial projects. Its strategic location, excellent connectivity to major hubs, and proximity to essential amenities make it a prime choice for real estate investors.
                                      As the infrastructure continues to improve, Kolshet Road is poised for steady appreciation, making it an attractive destination for those seeking long-term property investments.
                                </div>
                                <ul class="oviewDescription">
                                    <li>My Dmall - 0.7 Km</li>
                                    <li>R-Mall Thane West - 1.1 Km</li>
                                    <li>Viviana Mall -3.1 Km</li>
                                    <li>Kendriya Vidyalaya - 4.6 Km</li>
                                    <li>Cosmos Mall - 1.2 Km</li>
                                    <li>Amber International School - 3.3 Km</li>
                                    <li>Blossom English High School - 0.4 Km</li>
                                    <li>Daffodils School - 0.8 Km</li>
                                    <li>Kendriya Vidyalaya - 1.6 Km</li>
                                </ul>
                            </div> 
                        </div>
                        <div id="builderSection">
                            <div class="sectionHeader">
                                <span>About Builder</span>
                            </div>
                            <div class="sectionDetailContainer">
                                <div style="font-family:sans-serif; font-size:1.5rem; margin-bottom:0.5rem;color: #303030;">{{propertyData.builder}}</div>
                                <div class="oviewDescription">
                                    {{propertyData.builder}} Group is a well-known real estate developer guided by the vision of ‘Building a Better Life’. 
                                    The company has created residential, commercial and retail spaces with the highest level of design and craftsmanship. 
                                    They have delivered the world’s finest developments with uncompromising quality and unparalleled services.
                                </div>
                            </div>
                        </div>
                    </div>


                    <div id="contactUsContainer">
                        <div id="contactUsDiv">
                            <div id="contactUsC">
                                <div style="padding-bottom: 0.75rem;padding: 1.5rem;width: calc(100% - 3rem);">
                                    <h5 style="font-size: 0.85rem; line-height: 1.75rem;font-weight: 400;margin-top: 0.5rem;margin-bottom: 0.5rem;">BUY AT THE RIGHT PRICE!</h5>
                                    <h5 style="color:#ce3d37; font-size: 1.5rem; line-height: 1.5rem;font-weight: 600;margin-top: 1.1rem;margin-bottom: 0rem;">Are you ready to buy your perfect property</h5>
                                </div>
                                <div id="inputContainer">
                                    <div class="labelDiv">
                                        <label for="fullname" class="labelC">Name <span class="text-black">*</span>
                                        </label>
                                        <input type="text" class="labelInput" placeholder="Enter Your Name Here" name="fullname" value="">
                                        <span class="inputtip">This Field Is Required</span>
                                    </div>
                                    <div class="labelDiv">
                                        <label for="phonenumber" class="labelC">Mobile <span class="text-black">*</span>
                                        </label>
                                        <input type="number" class="labelInput" placeholder="Enter Your Contact Number" name="phonenumber" value="">
                                        <span class="inputtip">This Field Is Required</span>
                                    </div>
                                    <div class="labelDiv">
                                        <label for="email" class="labelC">Email <span class="text-black">*</span>
                                        </label>
                                        <input type="email" class="labelInput" placeholder="Enter Your Email ID" name="email" value="">
                                        <span class="inputtip">This Field Is Required</span>
                                    </div>
                                    <p style="font-weight: 400;font-size: 0.75rem;line-height: 1.1rem;margin-top: 0.5rem;margin-bottom: 1.0rem;">By clicking below you agree to
                                        <a target="_blank" style="text-decoration: none;color: rgb(0 0 0)" href="/terms">Terms and Conditions</a>&amp;
                                        <a target="_blank" style="text-decoration: none;color: rgb(0 0 0)" href="/privacyPolicy">Privacy Policy</a></p>
                                    <button id="contactButton">
                                        <span> Get Quote & Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="footerBlock">
                <div id="footerHead">MyHome private limited</div>
            </div>
        `
    });

    return viewerApp;
}

export {initViewerApp};