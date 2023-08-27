import { createApp } from "vue/dist/vue.esm-bundler.js";
import { Slider } from "./slider";
import properties from "../../assets/js/propertyData";
let homeApp;

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
                return './src/assets/images/' + this.propertyData.imagename;
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
                </div>
                <div class="propertyInfoContainer">
                    <div class="p-price">&#8377;{{propertyData.price}}</div>
                    <div class="p-name" @click="showProperty()">{{propertyData.name}}</div>
                    <div class="p-color" :style="{'display':isTile}">{{getColorText()}}</div> 
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
                showpropertyMode: false,
                activepropertyId:null,
                activeproperty: null,
            };
        },
        created(){
            homeApp._props.properties = properties;
            document.addEventListener('showPropertyevent',(e)=>{
                if(e.detail.propertyid!=null){
                    this.activepropertyId = e.detail.propertyid;
                    const pr = homeApp._props.properties.filter((p)=> p.id === this.activepropertyId);
                    if(pr.length ==1){
                        this.activeproperty = pr[0];
                        this.showPropertyMode = true;
                        document.body.scrollTop = 0; // For Safari
                        document.documentElement.scrollTop = 0; 
                        document.dispatchEvent(new Event('resetviewer'));
                    }
                }
            });
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
            <div class="headerPanel">
                <figure class="logo">
                    <img src="./src/assets/images/logo.jpg">
                </figure>
                <nav id="navright" class="nav">
                    <ul class="slider-ul">
                        <li class="slider-li">
                        <a class="sliderA is-active" href="/index.html"><span class="navSpan">Home</span></a>
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
            <div id="footerBlock">
                <div id="footerHead">MyHome private limited</div>
            </div>
        `
    });
    return homeApp;
};

export { initHomeApp };
