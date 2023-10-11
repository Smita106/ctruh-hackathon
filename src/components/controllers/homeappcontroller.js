import { createApp } from "vue/dist/vue.esm-bundler.js";
import { Slider } from "./slider";
import properties from "../../propertyData";
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
const params = {
    x: 20,
    y: 500,
    z: 400,
    r: 0,
};
let homeApp;
let scrollY = window.scrollY;
let mouse = new THREE.Vector2()
let target = new THREE.Vector2()
let maxScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
    document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
const showPropertyEvent = new CustomEvent('showpropertyevent',{
    detail:{
        propertyid:null
    }
});

const initHomeApp = function () {
    homeApp = createApp({ props: [] }, {
        properties:[],
    });
    homeApp.component('property',{
        props:['propertyData'],
        data(){
            return{};
        },
        created(){

        },
        mounted(){

        },
        methods:{
            getImageSrc(){
                return './assets/images/' + this.propertyData.imagename;
            },
            getColorText(){
                const count = this.propertyData.color.split(',').length;
                if(count == 1 ){
                    return '1 Colour';
                }else{
                    return count + ' Colours';
                }
            },
            showProperty(){
                showPropertyEvent.detail.propertyid = this.propertyData.id;
                document.dispatchEvent(showPropertyEvent)
            }
        },
        template:`
            <div class="propertyContanier" :style="{'height': tileh, 'width': tilew, 'margin-right':rightmargin}">
                <div class="propertyImageContainer" @click="showProperty()">
                    <img class="propertyImage" :src="getImageSrc()"/>
                    <div class="propertyBadge">SALE</div>
                </div>
                <div class="propertyInfoContainer">
                    <div class="p-name" @click="showProperty()">{{propertyData.name}}</div>
                    <div class="p-builder">By {{propertyData.builder}}</div>
                    <div style="display:flex;align-items:center">
                        <svg viewBox="0 0 12 16" height="15" width="15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.38338 15.6772C0.842813 9.09472 0 8.41916 0 6C0 2.68628 2.68628 0 6 0C9.31372 0 12 2.68628 12 6C12 8.41916 11.1572 9.09472 6.61662 15.6772C6.31866 16.1076 5.68131 16.1076 5.38338 15.6772ZM6 8.5C7.38072 8.5 8.5 7.38072 8.5 6C8.5 4.61928 7.38072 3.5 6 3.5C4.61928 3.5 3.5 4.61928 3.5 6C3.5 7.38072 4.61928 8.5 6 8.5Z" fill="#626262"></path></svg>
                        <span class="p-address">{{propertyData.address}}</span>
                    </div>
                    <div style="display:flex;height:2.5em;margin-top: 0.75em;justify-content:space-between;padding-top:0.25rem;align-items:center;line-height:1">
                        <p class="p-price">&#8377; {{propertyData.price}} {{propertyData.unit}} onwards</p>
                        <button class="viewButton" @click="showProperty">View Details</button>
                    </div>
                </div>
            </div>   
        `
    });
    homeApp.component('catalog',{
        props:[],
        data(){
            return{
                rootCmp: homeApp,
                colSize:3,
            };
        },
        created(){
            homeApp._props.properties = properties;
        },
        mounted(){
            const slider = new Slider();
        },
        methods:{
            getRowNum(){
                return Math.ceil(this.rootCmp._props.properties.length/this.colSize);
            },
            getIndex(row,col){
                return (row-1)*this.colSize + (col);
            },
            isCellAvailable(row,col){
                if(this.getIndex(row,col) > this.rootCmp._props.properties.length)
                    return false;
                return true;
            },
        },
        template:`
            <div style="display:flex;flex-direction:column">
                <div id="finderContainerBlock" class="slider js-slider">
                    <div class="slider__inner js-slider__inner"></div>
                    <div style="background:#000;opacity:0.5;height:100%;width:100%;display:flex;position:absolute"></div>
                    <div id="filterContainer">
                        <h1 id="filterHeading">
                            Find Your <span style="color:rgb(255,54,110);font-weight: 600;">Perfect Home</span>
                        </h1>
                        <div id="filterBlock">
                            <div style="width:80%;height:2em;margin-left:-1.5rem"><span style="color:white;height:2em;">Buy your Perfect Home</span></div>
                            <div id="filterDiv">
                                <div class="filterCell"><div class="filterItem">Search Location</div></div>
                                <div class="filterCell"><div class="filterItem">Builders<div class="downarrow"></div></div></div>
                                <div class="filterCell"><div class="filterItem">Add Property<div class="downarrow"></div></div></div>
                                <div class="filterCell"><div class="filterItem">Budget<div class="downarrow"></div></div></div>
                                <button id="filterSearch">SEARCH</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="catalogBody">
                    <div id="catalogHeader">Premium Projects</div>
                    <table id="collectionTable">
                        <tr v-for="row in Number(getRowNum())">
                            <td class="propertyGrid" v-for="col in Number(colSize)">
                                <property v-if="isCellAvailable(row,col)" :propertyData="rootCmp._props.properties[getIndex(row,col)-1]"></property>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        `
    });

    homeApp.component('propertyviewer',{
        props:['propertyID','propertyData'],
        data(){
            return{
                isLoadComplete: false,
                loadProgressValue: 0,
            };
        },
        created(){
            document.body.style.overflow = 'hidden';
            scrollY = window.scrollY;
            window.addEventListener('scroll', () =>{scrollY = window.scrollY;});
            document.addEventListener('mousemove',(e)=>{
                if(this.isLoadComplete){this.onMouseMove(e);}
            });
        },
        mounted(){
            this.dom = document.getElementById("viewerDiv");
            this.initScene();
        },
        methods:{
            onCameraChange() {
                console.log("Camera:");
                console.log("Fov:", this.camera.fov);
                console.log("Zoom: ", this.camera.zoom);
                console.log("lookat: ", this.camera);
                console.log("Position: ", this.camera.position);
                console.log("Controls:");
                console.log("target:", this.controls.target);
              },
            initScene(){

                 this.campositions = [[new THREE.Vector3(1307,164,1314), new THREE.Vector3(-221, 847, 199)]
                 ,[new THREE.Vector3(2938, 463, 1913), new THREE.Vector3(-550, 550, 600)]
                 ,[new THREE.Vector3(245,512,2084), new THREE.Vector3(380,488, -172)]
                 ,[new THREE.Vector3(829,30,852), new THREE.Vector3(2,162, 165)]];

                this.canvaWidth = this.dom.getBoundingClientRect().width;
                this.canvaHeight = this.dom.getBoundingClientRect().height;
                this.scene = new THREE.Scene();
                RectAreaLightUniformsLib.init();
                this.camera = new THREE.PerspectiveCamera(10, this.canvaWidth /  this.canvaHeight, 10, 10000);
                this.renderer = new THREE.WebGLRenderer({antialias:true});
                this.renderer.physicallyCorrectLights = true;
                this.renderer.setSize( this.canvaWidth, this.canvaHeight );
                this.renderer.domElement.style.height = `${this.canvaHeight} + 'px'`;
                this.renderer.domElement.style.width = `${this.canvaWidth} + 'px'`; 
                this.renderer.domElement.width = this.canvaWidth;
                this.renderer.domElement.height = this.canvaHeight;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.dom.appendChild( this.renderer.domElement );
                this.renderer.setClearColor( 0x000000, 0 );

                this.controls = new OrbitControls( this.camera, this.renderer.domElement );                

                const renderScene = new RenderPass( this.scene, this.camera );

				const bloomPass = new UnrealBloomPass( new THREE.Vector2( this.canvaWidth, this.canvaHeight ), 1.5, 0.4, 0.85 );
				bloomPass.threshold = 0.5;
				bloomPass.strength = 0.2;
				bloomPass.radius = 0.5;

				const outputPass = new OutputPass();
                const pixelRatio = this.renderer.getPixelRatio();
                this.fxaaPass = new ShaderPass( FXAAShader );
                this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( this.canvaWidth * pixelRatio );
				this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( this.canvaHeight * pixelRatio );

				this.composer = new EffectComposer( this.renderer );
				this.composer.addPass( renderScene );
				this.composer.addPass( bloomPass );
				this.composer.addPass( outputPass );
                this.composer.addPass( this.fxaaPass );
                
                this.controls.addEventListener('change', this.onCameraChange);
                this.ambLight = new THREE.AmbientLight( 0xffffff ); // soft white light
                // this.scene.add( this.ambLight );
                const helper = new THREE.CameraHelper( this.camera );
                // this.scene.add( helper );
                // this.camera.position.set(1307,164,1314);
                this.camera.position.set(this.campositions[0][0].x,this.campositions[0][0].y,this.campositions[0][0].z);
                this.currentPos = this.campositions[0];
                this.nextPos = this.campositions[1];
                // this.camera.lookAt(new THREE.Vector3(-436, 539, 388));
                this.camera.lookAt(this.campositions[0][1]);
                // this.camera.lookAt(pos1[1]);
                this.camera.zoom = 0.5;
                this.camera.updateProjectionMatrix();
                if(this.propertyData.objModelName!=null){
                    this.loadProductGltfModel();
                }
                this.addCloud();
				const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
				pmremGenerator.compileEquirectangularShader();
                THREE.DefaultLoadingManager.onLoad = function ( ) {
					pmremGenerator.dispose();
				};
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                let background = null;

                // const gui = new GUI();
				// gui.add( params, 'x', -1000, 1000, 0 ).name( ' x' ).onChange( this.updateRot );
				// gui.add( params, 'y', -1000, 1000, 500 ).name( ' y' ).onChange( this.updateRot );
				// gui.add( params, 'z', -1000, 1000, 0 ).name( ' z' ).onChange( this.updateRot );
				// gui.add( params, 'r', 0, 360, 2 ).name( ' rotY' ).onChange( this.updateRot );
                new EXRLoader().load( './assets/model/venice_sunset_resized.exr', this.envLoadComplete );
                // new EXRLoader().load( './assets/model/venice_sunset_resized.exr', this.bgLoadComplete );
                new THREE.TextureLoader().load( './assets/model/sky7.jpg', this.bgLoadComplete );
                // new THREE.TextureLoader().load( './assets/model/sky7.jpg', this.envLoadComplete );
                maxScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                    document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                this.startRendering();
            },
            addCloudToScene(texture){
                texture.wrapS = THREE.RepeatWrapping; 
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set( 1, 1 ); 
                const material = new THREE.MeshBasicMaterial({ map : texture });
                material.transparent = true;
                material.map = texture;
                const plane = new THREE.Mesh(new THREE.PlaneGeometry(556, 1024), material);
                const plane2 = new THREE.Mesh(new THREE.PlaneGeometry(556, 1024), material);
                plane.material.side = THREE.DoubleSide;
                plane2.material.side = THREE.DoubleSide;
                plane.scale.set(1.5,1.5,1.5);
                plane.position.x = -620;
                plane.position.y = 1000;
                plane.position.z = 410;
                plane2.position.set(-130,750,-1000);
                plane.rotation.z = Math.PI / 2;
                plane2.rotation.z = Math.PI / 2;
                plane.rotation.y = 75*Math.PI/180;
                plane2.rotation.y = 30*Math.PI/180;
                this.scene.add(plane);
                this.plane = plane;
            },
            addCloud(){

                const text = new THREE.TextureLoader().load( "./assets/images/cloud.png" ,this.addCloudToScene);
                // const texture = THREE.ImageUtils.loadTexture( "./assets/images/cloud.png" );
                // assuming you want the texture to repeat in both directions:


            },
            envLoadComplete(texture){
                texture.mapping = THREE.EquirectangularReflectionMapping  ;
                this.scene.environment = texture;
            },
            bgLoadComplete(texture){
                texture.mapping = THREE.CubeReflectionMapping;
                this.scene.background=texture;
            },
            loadProgress(xhr){
                this.loadProgressValue = xhr.loaded / xhr.total * 100;
            },
            updateRot(){
                this.model.rotation.set(0,params.r*Math.PI/180,0);
                // this.model.scale.set(params.x,params.x,params.x);
                // this.plane.rotation.set(0,params.r*Math.PI/180,Math.PI / 2);
                // this.plane.position.set(params.x, params.y, params.z);
            },
            loadComplete(gltf){
                this.model=gltf.scene;
                this.scene.add( gltf.scene );
                gltf.scene.position.y = -15;
                gltf.scene.scale.set(1,1,1);
                gltf.scene.rotation.set(0,290*Math.PI/180,0);
                document.body.style.removeProperty('overflow');
                this.isLoadComplete = true;
                if(this.propertyData.id ===2 ){
                    this.model.scale.set(20,20,20);
                    this.model.position.y = 100;
                    this.model.rotation.set(0,30*Math.PI/180,0);
                    this.campositions[0][0].x=860;
                    this.campositions[0][0].y=183;
                    this.campositions[0][0].z=857;
                    this.campositions[0][1]=new THREE.Vector3(-100,210,82);
                    this.camera.position.set(860,183,857);
                    this.camera.lookAt(new THREE.Vector3(-100,210,82));
                }
            },
            async loadProductGltfModel(){
                const loader = new GLTFLoader();
                const dracoLoader = new DRACOLoader();
                dracoLoader.setDecoderConfig({ type: 'js' });
                dracoLoader.setDecoderPath( 'https://www.gstatic.com/draco/v1/decoders/' );
                loader.setDRACOLoader( dracoLoader );
                loader.load(
                    './assets/model/' + this.propertyData.objModelName,
                    this.loadComplete,
                    this.loadProgress,
                    function ( error ) {
                        console.error(error);
                    }
                );
            },
            onMouseMove(event){
                // mouse.x = ( event.clientX - this.canvaWidth );
                // mouse.y = ( event.clientY - this.canvaHeight );
                // target.x = mouse.x;
                // target.y = mouse.y;
            },
            tick(){
                const sectionHeight=Math.ceil(maxScroll/(this.campositions.length));
                // console.log(sectionHeight);
                // const n = Math.floor(scrollY/this.canvaHeight);
                const n = Math.floor(scrollY/(sectionHeight*0.8));
                const factor = (scrollY-n*sectionHeight*0.8)/(sectionHeight*0.8);
                if(n<this.campositions.length-1){
                const curPos = this.campositions[n][0];
                const curLook = this.campositions[n][1];
                const pos = new THREE.Vector3(curPos.x,curPos.y,curPos.z).lerp(this.campositions[n+1][0],factor);
                const look = new THREE.Vector3(curLook.x,curLook.y,curLook.z).lerp(this.campositions[n+1][1],factor);
                this.camera.position.set(pos.x,pos.y,pos.z);
                this.camera.lookAt(look);
                }
                // target.x = ( 1 - mouse.x ) * 0.00002;
                // target.y = ( 1 - mouse.y ) * 0.00002;
                // this.camera.rotation.x += 0.05 * ( target.y - this.camera.rotation.x );
                // this.camera.rotation.y += 0.05 * ( target.x - this.camera.rotation.y );

            },
            animate(){
                this.renderer.render( this.scene, this.camera );
                this.tick();
                this.composer.render();
            },
            startRendering(){
                this.renderer.setAnimationLoop(this.animate);
            },
            stopRendering(){
                this.renderer.setAnimationLoop(null);
            }
        },
        template:`
            <div id="loaderBanner" v-if="!isLoadComplete">
                <div style="width:50%;height:100vh;display:flex;align-items: center;justify-content: center;">
                    <div id="loaderBar" :style="{'width': loadProgressValue + '%'}"></div>
                </div>
            </div>
            <div id="viewerDiv">
            </div>
            <div id="contentDiv">
                <div class="titleDiv">
                    <span style="font-size: 9em;">{{propertyData.title}}</span>
                    <span class="titleSub">by <span style="color:#6e1a09;  font-size: 3rem;font-family: cursive;">{{propertyData.builder}}</span></span>
                </div>
                <div class="infoSectionBlock">
                    <h1 class="infoHead">Luxury that's Limited Edition.</h1>
                    <p class="infoBody">{{propertyData.description}}</p>
                </div>
                <div style="margin-left:calc(40% - 4em)" class="infoSectionBlock">
                    <h1 class="infoHead">Location with Unlimited Potential</h1>
                    <p class="infoBody">{{propertyData.details}}</p>
                </div>
                <div class="infoSectionBlock">
                <h1 class="infoHead">World Class Amenities</h1>
                <p class="infoBody">{{propertyData.details}}</p>
                </div>
            </div>
        `
    });

    homeApp.component('homeapp',{
        props:[],
        data(){
            return{
                rootCmp: homeApp,
                colSize:3,
                showPropertyMode: false,
                activepropertyId:null,
                activeproperty: null,
            };
        },
        created(){
            homeApp._props.properties = properties;
            document.addEventListener('showpropertyevent',(e)=>{
                if(e.detail.propertyid!=null){
                    this.activepropertyId = e.detail.propertyid;
                    const pr = homeApp._props.properties.filter((p)=> p.id === this.activepropertyId);
                    if(pr.length ==1){
                        this.activeproperty = pr[0];
                        this.showPropertyMode = true;
                        document.body.scrollTop = 0; // For Safari
                        document.documentElement.scrollTop = 0; 
                        // document.dispatchEvent(new Event('resetviewer'));
                    }
                }
            });
        },
        mounted(){
        },
        methods:{
            getRowNum(){
                return Math.ceil(this.rootCmp._props.properties.length/this.colSize);
            },
            getIndex(row,col){
                return (row-1)*this.colSize + (col);
            },
            isCellAvailable(row,col){
                if(this.getIndex(row,col) > this.rootCmp._props.properties.length)
                    return false;
                return true;
            },
        },
        template:`
            <div class="headerPanel" :style="{'opacity': showPropertyMode ? '0.5':'1'}">
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
            <propertyviewer v-if="showPropertyMode && activepropertyId!=null && activeproperty!=null"
             :propertyID="activepropertyId" :propertyData="activeproperty"></propertyviewer>
            <catalog v-else></catalog>
            <div id="footerBlock">
                <div id="footerHead">MyHome private limited</div>
            </div>
        `
    });
    return homeApp;
};

export { initHomeApp };
