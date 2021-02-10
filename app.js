import {Menu} from './menu.js?ver=1';
import {Content} from './content.js?ver=1';
import {Loading} from './loading.js?ver=1';

const HOME_URL = window.location.href;

class App{
    constructor(){
        this.menu = null;
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        this.isDown = false;
        this.moveX = 0;
        this.offsetX = 0;
        this.isLoading = true;
        
        this.content = new Content();
        this.menu = new Menu(this.stageWidth/2, 300);
        this.loading = new Loading();
        this.resize();

        document.addEventListener('pointerdown', this.onDown.bind(this), false);
        document.addEventListener('pointermove', this.onMove.bind(this), false);
        document.addEventListener('pointerup', this.onUp.bind(this), false);

        document.addEventListener('lostpointercapture', this.onLost.bind(this), false);
        document.addEventListener('gotpointercapture', this.onGot.bind(this), false);

        window.addEventListener('popstate', this.onPopState.bind(this), false);

        window.requestAnimationFrame(this.animate.bind(this));
        window.content = null;
    }
    
    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        if(this.menu){
            this.menu.resize(this.stageWidth/2, this.stageHeight*3/5);
        }
        if(this.content){
            this.content.resize(this.stageWidth, this.stageHeight);
        }
    }

    animate(){
        window.requestAnimationFrame(this.animate.bind(this));

        this.moveX *= 0.92;
        this.menu.animate(this.moveX);
        if(this.isLoading){
            this.isLoading = this.loading.animate();
        }
        if(window.content){
            this.content.animate();
        } 
    }

    onDown(e){
        if(!window.content_on){
            this.isDown = true;
        }
        this.moveX = 0;
        this.offsetX = e.clientX;
    }

    onMove(e){
        if(this.isDown && !window.content_on){
            this.moveX = e.clientX - this.offsetX;
            this.offsetX = e.clientX;
        }
    }

    onUp(e){
        if(!window.content_on){
            this.isDown = false;
        }
    }

    onLost(e){
        if(e.pointerType==='pen'){
            this.isDown = false;
        }
    }

    onGot(e){
        if(e.pointerType==='pen'){
            this.isDown = true;
        }
    }

    onPopState(e){
        if(history.state && history.state.id>=0 && history.state.id<26){
            this.menu.slot[history.state.id].opencontent();
        }else{
            if(window.content){
                this.content.closecontent();
            }
        }
    }
}

window.onload = () => {
    new App();
}