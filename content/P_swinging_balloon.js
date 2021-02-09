const canvas = document.getElementById('content_canvas');
const SPAWN_SPEED = 100;
const MAX_ANGLE = 5;
const COLORS = [
    '#F4364C',
    '#FCD757',
    '#00B140',
    '#485CC7',
    '#8246AF',
]

class Balloon{
    constructor(type, color, x, y, max_range){
        this.type = type;
        this.color = color;
        this.x = x;
        this.y = y;
        this.cur = 0;
        this.max_range = max_range*Math.random();
        this.rotation = 0;
    }

    resize(prev_width, prev_height, now_width, now_height){
        this.x = this.x*now_width/prev_width;
        this.y = this.y*now_height/prev_height;

        this.max_range = this.max_range*now_width/prev_width;
    }

    draw(ctx, dx, dy){
        ctx.fillStyle=this.color;
        this.y--;
        this.x+=dx;
        this.y+=dy;
        this.rotation+=Math.sin(dx/30)*MAX_ANGLE*Math.PI/180;
        ctx.save();
        ctx.translate(this.x+Math.sin(this.cur/30)*this.max_range, this.y);
        ctx.rotate(this.rotation);
        ctx.fillText(this.type, 0, 0);
        ctx.strokeText(this.type, 0, 0);
        ctx.restore();
        this.cur++;
        this.rotation*=0.95;
    }
    
    reachSky(){
        return this.y <= 0;
    }
}

export class Swinging_Balloon{
    constructor(){
        canvas.style.backgroundColor = '#008BCE';
        this.balloonType = ['P', 'R', 'O', 'G', 'R', 'A', 'M', 'M', 'I', 'N', 'G', 'C', 'O', 'N', 'T', 'E', 'S', 'T'];
        this.nowidx = 0;
        this.balloonsize = 100;
        this.balloons = [];
        this.balloonLoad = 0;
    }

    resize(stageWidth, stageHeight){
        for(let i = 0; i < this.balloons.length; i++){
            this.balloons[i].resize(this.width, this.height, stageWidth, stageHeight);
        }
        this.width = stageWidth;
        this.height = stageHeight;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;

        this.balloonsize = this.width/7;
    }

    animate(ctx, moveX, moveY, isDown){
        ctx.font = this.balloonsize+'px Fascinate Inline';
        ctx.strokeStyle='#ffffff';
        ctx.lineWidth = 3;
        
        if(this.balloonLoad==0){
            this.balloons[this.balloons.length] = new Balloon(this.balloonType[this.nowidx], 
                                                                COLORS[this.nowidx%5],
                                                                Math.random()*this.width, 
                                                                this.height+this.balloonsize, 
                                                                this.width/30);
            this.nowidx++;
            this.nowidx%=this.balloonType.length;
        }
        this.balloonLoad++;
        this.balloonLoad %= SPAWN_SPEED;
        while(this.balloons[0]&&this.balloons[0].reachSky()){
            this.balloons.splice(0,1);
        }
        for(let i = 0; i < this.balloons.length; i++){
            this.balloons[i].draw(ctx, moveX/5, moveY/10);
        }
    }
}