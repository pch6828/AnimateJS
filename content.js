const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');

export class Content{
    constructor(){
        this.canvas = document.getElementById('content_canvas');
        this.canvas.style.backgroundColor = 'black';
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio =window.devicePixelRatio > 1 ? 2 : 1;
        
        window.addEventListener('resize', this.resize.bind(this), false);
        this.canvas.addEventListener('contextmenu', this.noevent.bind(this), false);
        this.canvas.addEventListener('pointerdown', this.onDown.bind(this), false);
        this.canvas.addEventListener('pointermove', this.onMove.bind(this), false);
        this.canvas.addEventListener('pointerup', this.onUp.bind(this), false);
        this.canvas.addEventListener('lostpointercapture', this.onLost.bind(this), false);
        this.canvas.addEventListener('gotpointercapture', this.onGot.bind(this), false);

        this.resize();

        this.close_btn = document.getElementById('jsCloseContent');
        this.close_btn.addEventListener('click', this.closecontent.bind(this), false);
        
        this.isDown = false;
        this.moveX = 0;
        this.offsetX = 0;
        this.moveY = 0;
        this.offsetY = 0;
        this.subject = null;
    }

    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth*this.pixelRatio*0.6;
        this.canvas.height = this.stageHeight*this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        if(window.content){
            window.content.resize();
        }
    }

    noevent(e){
        e.preventDefault();
    }

    closecontent(e){
        menu.style.display = 'block';
        content.style.display = 'none';
        window.content = null;
    }

    animate(){
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        this.moveX *= 0.95;
        this.moveY *= 0.95;
        if(window.content){
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
            this.moveX = e.clientX - this.offsetX;
            this.offsetX = e.clientX;
            this.moveY = e.clientY - this.offsetY;
            this.offsetY = e.clientY;
        }
    }

    onUp(e){
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