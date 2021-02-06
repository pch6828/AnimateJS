const canvas = document.getElementById('content_canvas');

class Point{
    constructor(x, y, start){
        this.x = x;
        this.y = y;
        this.initial_y = y;
        this.cur = start;
        this.speed = 0.1;
        this.max_change = Math.random()*30;
    }

    update(){
        this.cur+=this.speed;
        this.y = this.initial_y+this.max_change*Math.sin(this.cur);
    }
}

class Wave{
    constructor(width, height, index, point_cnt, color, cup_bottom){
        this.index = index;
        this.point_cnt = point_cnt;
        this.color = color;
        this.points = [];
        
        this.width = width;
        this.height = height;
        this.cup_bottom = cup_bottom;

        this.initialy = height/2+cup_bottom;
        this.gap = this.width/(this.point_cnt-1);
        this.init();
    }
    
    init(){
        this.points = [];

        for(let i = 0; i < this.point_cnt; i++){
            this.points[i] = new Point(this.gap*i, this.initialy, this.index+i);
        }
    }

    resize(width, height){
        this.width = width;
        this.height = height;

        this.initialy = height/2+this.cup_bottom;

        this.gap = this.width/(this.point_cnt-1);
        this.init();
    }

    draw(ctx){
        ctx.beginPath();
        ctx.fillStyle = this.color;

        let prevx = this.points[0].x;
        let prevy = this.points[0].y;

        ctx.moveTo(prevx, prevy);

        for(let i = 0; i < this.point_cnt; i++){
            if(0<i&&i<this.point_cnt-1){
                this.points[i].update();
            }

            const cx = (prevx+this.points[i].x)/2;
            const cy = (prevy+this.points[i].y)/2;

            ctx.quadraticCurveTo(prevx, prevy, cx, cy);
            prevx=this.points[i].x;
            prevy=this.points[i].y;
        }

        ctx.lineTo(prevx, prevy);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(this.points[0].x, this.height);
        ctx.fill();
        ctx.closePath();
    }

    update(dy){
        for(let i = 0; i < this.point_cnt; i++){
            if(!(0<i&&i<this.point_cnt-1)){
                this.points[i].y-=dy;
                if(this.points[i].y>this.initialy){
                    this.points[i].y = this.initialy;
                }else if(this.points[i].y<this.initialy-this.cup_bottom*8/5){
                    this.points[i].y=this.initialy-this.cup_bottom*8/5;
                };
            }
            this.points[i].initial_y-=dy;
            if(this.points[i].initial_y>this.initialy){
                this.points[i].initial_y = this.initialy;
            }else if(this.points[i].initial_y<this.initialy-this.cup_bottom*8/5){
                this.points[i].initial_y=this.initialy-this.cup_bottom*8/5;
            };
        }
    }
}

class Waves{
    constructor(width, height, cup_bottom){
        this.wave_cnt = 3;
        this.point_cnt = 6;
        this.color = ['#714623','#744F28','#9E652E'];
        this.width = width;
        this.height = height;

        this.waves = [];
        for(let i = 0; i < this.wave_cnt; i++){
            this.waves[i] = new Wave(width, height, i, this.point_cnt, this.color[i], cup_bottom);
        }
    }

    resize(width, height){
        for(let i = 0; i < this.wave_cnt; i++){
            this.waves[i].resize(width, height);
        }
    }

    draw(ctx){
        for(let i = 0; i < this.wave_cnt; i++){
            this.waves[i].draw(ctx);
        }
    }

    update(dy){
        for(let i = 0; i < this.wave_cnt; i++){
            this.waves[i].update(dy);
        }
    }
}

class Pour{
    constructor(centerx, bottom){
        this.x = centerx;
        this.y = 0;
        this.length = 0;
        this.bottom = bottom;
    }

    touch_bottom(){
        if(this.y>=this.bottom){
            this.length-=10;
            return true;
        }
        return false;
    }

    draw(ctx){
        ctx.strokeStyle='#9E652E';
        ctx.lineWidth = 20;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y-this.length);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.closePath();
    }

    add(){
        this.length+=10;
    }

    down(){
        this.y = Math.min(this.y+10, this.bottom);
    }

    empty(){
        return this.length === 0;
    }
}

export class Pour_And_Wave{
    constructor(){
        canvas.style.backgroundColor = '#00CFB4';
        this.centerx = document.body.clientWidth/2*0.6;
        this.centery = document.body.clientHeight/2;
        this.width = document.body.clientWidth*0.6;
        this.height = document.body.clientHeight;
        this.coffeesize = 200;
        this.coffee = new Waves(document.body.clientWidth*0.6, document.body.clientHeight, this.coffeesize);
        this.drop = [];
        this.now_drop = null;
        this.noDown_cnt = 0;
    }

    resize(stageWidth, stageHeight){
        this.width = stageWidth;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;
        this.height = stageHeight;
        this.coffee.resize(stageWidth, stageHeight);
        this.drop = [];
        this.now_drop = null;
    }

    animate(ctx, moveX, moveY, isDown){
        ctx.save();
        if(isDown){
            if(!this.now_drop){
                this.now_drop = new Pour(this.centerx, this.centery+this.coffeesize);
            }
            this.now_drop.add();
            this.noDown_cnt = 0;
        }else{
            if(this.now_drop){
                this.drop[this.drop.length] = this.now_drop;
                this.now_drop = null;
            }
            this.noDown_cnt++;
        }

        if(this.noDown_cnt>=100){
            this.coffee.update(-0.5);
        }

        if(this.now_drop){
            if(this.now_drop.touch_bottom()){
                this.coffee.update(1);
            }
        }
        for(let i = 0; i < this.drop.length; i++){
            if(this.drop[i].touch_bottom()){
                this.coffee.update(1);
            }
        }
        while(this.drop[0]&&this.drop[0].empty()){
            this.drop.splice(0,1);
        }
        ctx.font = this.coffeesize+'px Big Shoulders Display';
        let textwidth = ctx.measureText('COFFEE').width;
        
        ctx.globalCompositeOperation='source-over';
        ctx.fillStyle='rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.arc(this.centerx+textwidth/2, this.centery-this.coffeesize/3, this.coffeesize/3, Math.PI/2, -Math.PI/2, true);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation='destination-out';
        ctx.beginPath();
        ctx.arc(this.centerx+textwidth/2, this.centery-this.coffeesize/3, this.coffeesize/5, 0, 2*Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation='source-over';        
        ctx.font = this.coffeesize+'px Big Shoulders Display';
        ctx.fillText('COFFEE', this.centerx-textwidth/2, this.centery);
        ctx.globalCompositeOperation='source-over';
        ctx.beginPath();
        ctx.arc(this.centerx, this.centery, textwidth/2, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(this.centerx-textwidth/2, this.centery+textwidth/2-10, textwidth, 10);

        ctx.globalCompositeOperation='source-atop';
        this.coffee.draw(ctx);
        ctx.fillStyle='rgba(0,0,0,1)';
        ctx.fillRect(this.centerx+textwidth/2,this.centery-this.coffeesize*2/3, this.coffeesize/3, this.coffeesize*2/3);
        ctx.globalCompositeOperation='source-over';
        
        if(this.now_drop){
            this.now_drop.draw(ctx);
            this.now_drop.down();
        }
        for(let i = 0; i < this.drop.length; i++){
            this.drop[i].draw(ctx);
            this.drop[i].down();
        }
        ctx.fillStyle='rgba(0,0,0,1)';
        ctx.fillRect(this.centerx-textwidth/2, this.centery+textwidth/2-10, textwidth, 10);
        ctx.globalCompositeOperation='destination-out'
        ctx.fillRect(0, this.centery+textwidth/2, this.width, this.height);
        ctx.restore();
    }
}