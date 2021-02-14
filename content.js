const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');
const description = document.getElementById('jsContentDescription');
const canvas = document.getElementById('content_canvas');
const btn_section = document.getElementById('jsButtonSection');
const updown_btn = document.getElementById('jsUpDownDescription');

const LOADING_DESC = 40;
const LOADING_CANVAS = 30;
const LOADING_BTN = -7;
const UPDOWN_DESC = -95;

const HOME_URL = window.location.href;

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
        this.close_btn.addEventListener('click', this.onClick.bind(this), false);

        this.updown_btn = updown_btn;
        this.updown_btn.addEventListener('click', this.updowndesc.bind(this), false);
        
        window.isLoading = 0;
        window.buttonLoading = LOADING_BTN;
        window.isClosed = false;
        this.isDescLoading = UPDOWN_DESC;
        this.ableUpdown = false;
        this.updownMode = false;

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
            this.ableUpdown = true;
            this.isDescLoading = UPDOWN_DESC;
            this.updownMode = false;
        }else{
            this.canvas.width = this.stageWidth*this.pixelRatio*0.6;
            this.canvas.height = this.stageHeight*this.pixelRatio;
            this.ableUpdown = false;
            description.style.bottom = '0';
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

    closecontent(){
        document.title = 'AnimateJS';
        window.isClosed = true;
        window.isLoading = 0;
        this.isDescLoading = UPDOWN_DESC;
        this.updownMode = false;
    }

    updowndesc(e){
        this.updownMode = !this.updownMode;
    }

    animate(){
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.moveX *= 0.95;
        this.moveY *= 0.95;
        if(window.content){
            if(window.isClosed){
                if(window.isLoading<=LOADING_DESC){
                    if(window.isLoading==0){
                        menu.style.display = 'block';
                        //btn_section.style.display = 'none';
                    }
                    if(window.isLoading==LOADING_DESC){
                        content.style.display = 'none';
                        window.isClosed = false;
                        window.content = null;
                        window.isLoading = 0;
                        return;
                    }
                    let canvas_dx = (content.offsetWidth-description.offsetWidth)/LOADING_CANVAS*Math.min(window.isLoading, LOADING_CANVAS);
                    let desc_dx = content.offsetWidth/LOADING_DESC*window.isLoading;
                    window.buttonLoading = Math.max(LOADING_BTN, window.buttonLoading-0.5);
                    if(matchMedia("(max-width:1000px)").matches){
                        canvas_dx = content.offsetWidth/LOADING_CANVAS*Math.min(window.isLoading, LOADING_CANVAS);
                        desc_dx = canvas_dx;
                    }
                    canvas.style.transform = 'translate3d('+(canvas_dx)+'px,0px,0px)';
                    description.style.transform = 'translate3d('+(desc_dx)+'px,0px,0px)';
                    btn_section.style.left = window.buttonLoading+'vh';
                    window.isLoading++;
                }
            }else{
                if(window.isLoading<=LOADING_DESC){
                    if(window.isLoading==0){
                        if(matchMedia("(max-width:1000px)").matches){
                            window.content.resize(this.stageWidth, this.stageHeight);
                        }else{
                            window.content.resize(this.stageWidth*0.6, this.stageHeight);
                        }   
                        content.style.display = 'block';
                    }
                    if(window.isLoading==LOADING_DESC){
                        menu.style.display = 'none';
                        //btn_section.style.display = 'flex';
                    }
                    let canvas_dx = content.offsetWidth-description.offsetWidth-(content.offsetWidth-description.offsetWidth)/LOADING_CANVAS*Math.min(window.isLoading, LOADING_CANVAS);
                    let desc_dx = content.offsetWidth-content.offsetWidth/LOADING_DESC*window.isLoading;
                    
                    if(matchMedia("(max-width:1000px)").matches){
                        canvas_dx = content.offsetWidth-content.offsetWidth/LOADING_CANVAS*Math.min(window.isLoading, LOADING_CANVAS);
                        desc_dx = canvas_dx;
                    }
                    canvas.style.transform = 'translate3d('+(canvas_dx)+'px,0px,0px)';
                    description.style.transform = 'translate3d('+(desc_dx)+'px,0px,0px)';
                    window.isLoading++;
                }else{
                    window.buttonLoading = Math.min(0, window.buttonLoading+0.5);
                    btn_section.style.left = window.buttonLoading+'vh';
                }
            }
            if(this.ableUpdown){
                if(this.updownMode){
                    this.isDescLoading = Math.min(0, this.isDescLoading+5);
                    description.style.bottom = this.isDescLoading+'%';
                }else{
                    this.isDescLoading = Math.max(UPDOWN_DESC, this.isDescLoading-5);
                    description.style.bottom = this.isDescLoading+'%';
                }
            }
            window.content.animate(this.ctx, this.moveX, this.moveY, this.isDown);
        }
    }

    onClick(e){
        this.closecontent();
        window.history.pushState({id:-1}, 'AnimateJS', HOME_URL);
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