const canvas = document.getElementById('content_canvas');
const ON_COLOR = '#F2CD00';
const OFF_COLOR = '#222222';
const INNER_LIGHT = 'rgba(255, 158, 27, 0.3)';
const OUTER_LIGHT = 'rgba(244, 218, 64, 0.3)';
const BLINK_TIME = 30;
const FIRST_BLINK = 0;
const SECOND_BLINK = 60;
const THIRD_BLINK = 110;
const FULLY_ON = 150;

export class Light_Bulb{
    constructor(){
        WebFont.load({
            google: {
              families: ['Turret Road']
            }
        });
        canvas.style.backgroundColor = '#101820';
        this.blink = 0;
        this.loading = 0;
        this.prev = 0;
        this.onoff = false;
        this.light_range = 1;
        this.light = 0;
        this.cur = 0;
    }

    resize(stageWidth, stageHeight){
        this.width = stageWidth;
        this.height = stageHeight;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;

        this.strsize = Math.min(this.width, this.height)/15;
        let temp_range = this.light_range;
        this.light_range = Math.min(this.width, this.height)/2.5;
        this.light = this.light/temp_range*this.light_range;
    }

    animate(ctx, moveX, moveY, isDown){
        ctx.globalCompositeOperation='source-over';
        if(isDown && !this.prev){
            this.onoff = !this.onoff;
            this.loading = Math.max(0, this.loading);
        }
        this.prev = isDown;

        ctx.font = '800 '+this.strsize+'px Turret Road';
        if(this.onoff){
            if(this.loading===FIRST_BLINK){
                this.blink = 0;
            }else if(this.loading===SECOND_BLINK){
                this.blink = 0;
            }else if(this.loading===THIRD_BLINK){
                this.blink = 0;
            }else if(this.loading===FULLY_ON){
                this.blink = 0;
            }
            if(this.blink<=BLINK_TIME){
                ctx.fillStyle = ON_COLOR;
            }else{
                ctx.fillStyle = OFF_COLOR;
            }
            this.blink++;
            this.loading = Math.min(this.loading+1, FULLY_ON);
        }else{
            this.blink = 0;
            this.loading = 0;
            this.light = 0;
            ctx.fillStyle = OFF_COLOR;
            this.cur = 0;
        }
        let textwidth = ctx.measureText('MENTOR').width;

        if(this.loading===FULLY_ON){
            let prev_fillStyle = ctx.fillStyle;
            ctx.fillStyle = OUTER_LIGHT;
            this.light = Math.min(this.light+5, this.light_range);
            ctx.beginPath();
            ctx.arc(this.centerx, this.centery, this.light+5*Math.sin(this.cur/10), 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle = INNER_LIGHT;
            ctx.beginPath();
            ctx.arc(this.centerx, this.centery, this.light*0.3+5*Math.cos(this.cur/10), 0, 2*Math.PI);
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle = prev_fillStyle;
            this.cur++;
        }
        ctx.fillText('MENTOR', this.centerx-textwidth/2, this.centery+this.strsize);
        ctx.strokeStyle = OFF_COLOR;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(this.centerx-textwidth/2, this.centery+this.strsize);
        ctx.lineTo(this.centerx, this.centery+textwidth);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.centerx+textwidth/2, this.centery+this.strsize);
        ctx.lineTo(this.centerx, this.centery+textwidth);
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(this.centerx, this.centery, textwidth, 0, 2*Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = '#898D8D';
        ctx.fillRect(this.centerx-textwidth*Math.sin(15*Math.PI/180), this.centery+textwidth*Math.cos(15*Math.PI/180), 2*textwidth*Math.sin(15*Math.PI/180), textwidth/3);
        ctx.fillStyle = '#707070';
        ctx.fillRect(this.centerx-textwidth*Math.sin(15*Math.PI/180)*1.1, this.centery+textwidth*Math.cos(15*Math.PI/180)+1/7*textwidth/3, 2*textwidth*Math.sin(15*Math.PI/180)*1.1, 1/7*textwidth/3);
        ctx.fillRect(this.centerx-textwidth*Math.sin(15*Math.PI/180)*1.1, this.centery+textwidth*Math.cos(15*Math.PI/180)+3/7*textwidth/3, 2*textwidth*Math.sin(15*Math.PI/180)*1.1, 1/7*textwidth/3);
        ctx.fillRect(this.centerx-textwidth*Math.sin(15*Math.PI/180)*1.1, this.centery+textwidth*Math.cos(15*Math.PI/180)+5/7*textwidth/3, 2*textwidth*Math.sin(15*Math.PI/180)*1.1, 1/7*textwidth/3);
    }
}