const canvas = document.getElementById('content_canvas');

export class Typo_Cylinder{
    constructor(){
        canvas.style.backgroundColor = '#333333';
        
        this.Dsize = 270;
        this.strsize = 100;
        this.size1 = 20;
        this.size2 = this.strsize+20;
    }

    resize(stageWidth, stageHeight){
        this.width = stageWidth;
        this.height = stageHeight;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;
    }

    animate(ctx, moveX, moveY, isDown){
        let textwidth = 0;
        let Dwidth = 0;
        let movement = moveY/this.height;
        this.size1 += movement*500;
        this.size2 -= movement*500;
        if(this.size1>this.strsize+20){
            this.size1 = this.strsize+20;
            this.size2 = 20;
        }else if(this.size1<20){
            this.size1 = 20;
            this.size2 = this.strsize+20;
        }
        ctx.font=this.Dsize+'px consolas';
        Dwidth = ctx.measureText('D').width;
        textwidth+=Dwidth;
        ctx.font=this.strsize+'px consolas';
        textwidth+=ctx.measureText('eveloper').width;
        ctx.globalCompositeOperation='source-over'
        ctx.fillStyle = "rgba("+(this.size2-20)/(this.strsize)*150+","+(this.size1-20)/(this.strsize-20)*150+",0,1)";        
        ctx.font=this.Dsize+'px consolas';
        ctx.fillText('D', this.centerx-textwidth/2, this.centery+this.strsize);
        
        ctx.fillStyle = "rgba(0,150,0,0.7)";
        ctx.font=this.strsize+'px consolas';
        ctx.fillText('eveloper', this.centerx-textwidth/2+Dwidth, this.centery+this.strsize);
        ctx.fillStyle = "#000"
        ctx.globalCompositeOperation='destination-out';
        ctx.fillRect(this.centerx-textwidth/2+Dwidth, this.centery, textwidth, this.size2);
       
        ctx.globalCompositeOperation='source-over'
        ctx.fillStyle = "rgba(150,0,0,0.7)";
        ctx.fillText('esigner', this.centerx-textwidth/2+Dwidth, this.centery);
        ctx.fillStyle = "#000"
        ctx.globalCompositeOperation='destination-out';
        ctx.fillRect(this.centerx-textwidth/2+Dwidth, this.centery-this.strsize, textwidth, this.size1);

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = "rgba(255,255,255,0.3)"; 
        ctx.font=this.Dsize+'px consolas';
        ctx.fillText('D', this.centerx-textwidth/2, this.centery+this.strsize);
        ctx.font=this.strsize+'px consolas';
        ctx.fillText('esigner', this.centerx-textwidth/2+Dwidth, this.centery);
        ctx.fillText('eveloper', this.centerx-textwidth/2+Dwidth, this.centery+this.strsize);        
    }
}