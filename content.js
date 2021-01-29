export class Content{
    constructor(color){
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'content_canvas';
        this.canvas.style.backgroundColor = color;
        this.canvas.style.zIndex = 2;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.pixelRatio =window.devicePixelRatio > 1 ? 2 : 1;
        
        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();
    }

    resize(){
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth*this.pixelRatio;
        this.canvas.height = this.stageHeight*this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    animate(){
        window.requestAnimationFrame(this.animate.bind(this));

        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    }
}