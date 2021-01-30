const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');

export class Content{
    constructor(color){
        this.canvas = document.getElementById('content_canvas');
        this.canvas.style.backgroundColor = color;
        this.ctx = this.canvas.getContext('2d');
        
        this.pixelRatio =window.devicePixelRatio > 1 ? 2 : 1;
        
        window.addEventListener('resize', this.resize.bind(this), false);
        this.canvas.addEventListener('contextmenu', this.noevent.bind(this), false);

        this.resize();

        this.close_btn = document.getElementById('jsCloseContent');
        this.close_btn.addEventListener('click', this.closecontent.bind(this), false);
    }

    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth*this.pixelRatio;
        this.canvas.height = this.stageHeight*this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    noevent(e){
        e.preventDefault();
    }

    closecontent(e){
        menu.style.display = 'block';
        content.style.display = 'none';
        window.content_on = false;
    }

    animate(){
        window.requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    }
}