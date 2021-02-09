const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');
const description = document.getElementById('jsContentDescription');
const canvas = document.getElementById('content_canvas');
const close_btn = document.getElementById('jsCloseContent');

const LOADING_DESC = 40;
const LOADING_CANVAS = 30;

export class Content{
    constructor(){
        this.canvas = document.getElementById('content_canvas');
        this.canvas.style.backgroundColor = 'black';
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio =window.devicePixelRatio > 1 ? 2 : 1;
        
        this.canvas.addEventListener('contextmenu', this.noevent.bind(this), false);
        this.canvas.addEventListener('pointerdown', this.onDown.bind(this), false);
        this.canvas.addEventListener('pointermove', this.onMove.bind(this), false);
        this.canvas.addEventListener('pointerup', this.onUp.bind(this), false);
        this.canvas.addEventListener('pointerleave', this.onLeave.bind(this), false);
        this.canvas.addEventListener('lostpointercapture', this.onLost.bind(this), false);
        this.canvas.addEventListener('gotpointercapture', this.onGot.bind(this), false);

        this.close_btn = document.getElementById('jsCloseContent');
        this.close_btn.addEventListener('click', this.closecontent.bind(this), false);
        
        this.isLoading = 0;
        this.isClosed = false;

        this.isDown = false;
        this.moveX = 0;
        this.offsetX = 0;
        this.moveY = 0;
        this.offsetY = 0;
        this.subject = null;
    }

    resize(stageWidth, stageHeight){
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;

        if(matchMedia("(max-width:1000px)").matches){
            this.canvas.width = this.stageWidth*this.pixelRatio;
            this.canvas.height = this.stageHeight*this.pixelRatio;
        }else{
            this.canvas.width = this.stageWidth*this.pixelRatio*0.6;
            this.canvas.height = this.stageHeight*this.pixelRatio;
        }
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        if(window.content){
            if(matchMedia("(max-width:1000px)").matches){
                window.content.resize(this.stageWidth, this.stageHeight);
            }else{
                window.content.resize(this.stageWidth*0.6, this.stageHeight);
            }
        }
    }

    noevent(e){
        e.preventDefault();
    }

    closecontent(e){
        this.isClosed = true;
        this.isLoading = 0;
    }

    animate(){
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.moveX *= 0.95;
        this.moveY *= 0.95;
        if(window.content){
            if(this.isClosed){
                if(this.isLoading<=LOADING_DESC){
                    if(this.isLoading==0){
                        menu.style.display = 'block';
                        close_btn.style.display = 'none';
                    }
                    if(this.isLoading==LOADING_DESC){
                        content.style.display = 'none';
                        this.isClosed = false;
                        window.content = null;
                        this.isLoading = 0;
                        return;
                    }
                    let canvas_dx = (content.offsetWidth-description.offsetWidth)/LOADING_CANVAS*Math.min(this.isLoading, LOADING_CANVAS);
                    let desc_dx = content.offsetWidth/LOADING_DESC*this.isLoading;
                    if(matchMedia("(max-width:1000px)").matches){
                        canvas_dx = content.offsetWidth/LOADING_CANVAS*Math.min(this.isLoading, LOADING_CANVAS);
                    }
                    canvas.style.transform = 'translate3d('+(canvas_dx)+'px,0px,0px)';
                    description.style.transform = 'translate3d('+(desc_dx)+'px,0px,0px)';
                    this.isLoading++;
                }
            }else{
                if(this.isLoading<=LOADING_DESC){
                    if(this.isLoading==0){
                        if(matchMedia("(max-width:1000px)").matches){
                            window.content.resize(this.stageWidth, this.stageHeight);
                        }else{
                            window.content.resize(this.stageWidth*0.6, this.stageHeight);
                        }   
                        content.style.display = 'block';
                    }
                    if(this.isLoading==LOADING_DESC){
                        menu.style.display = 'none';
                        close_btn.style.display = 'block';
                    }
                    let canvas_dx = content.offsetWidth-description.offsetWidth-(content.offsetWidth-description.offsetWidth)/LOADING_CANVAS*Math.min(this.isLoading, LOADING_CANVAS);
                    let desc_dx = content.offsetWidth-content.offsetWidth/LOADING_DESC*this.isLoading;
                    if(matchMedia("(max-width:1000px)").matches){
                        canvas_dx = content.offsetWidth-content.offsetWidth/LOADING_CANVAS*Math.min(this.isLoading, LOADING_CANVAS);
                    }
                    canvas.style.transform = 'translate3d('+(canvas_dx)+'px,0px,0px)';
                    description.style.transform = 'translate3d('+(desc_dx)+'px,0px,0px)';
                    this.isLoading++;
                }
            }
            window.content.animate(this.ctx, this.moveX, this.moveY, this.isDown);
        }
    }

    onDown(e){
        this.isDown = true;
        this.moveX = 0;
        this.offsetX = e.clientX;
        this.moveY = 0;
        this.offsetY = e.clientY;
    }

    onMove(e){
        if(this.isDown){
            this.moveX = e.offsetX - this.offsetX;
            this.offsetX = e.offsetX;
            this.moveY = e.offsetY - this.offsetY;
            this.offsetY = e.offsetY;
        }
    }

    onUp(e){
        this.isDown = false;
    }

    onLeave(e){
        this.isDown = false;
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
}