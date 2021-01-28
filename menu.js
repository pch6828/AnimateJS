import {Slot} from './slot.js?ver=1';

export class Menu{
    constructor(x, y, slotsize){
        this.nowx = x;
        this.centerx = x;
        this.slotsize = slotsize;
        this.slot = [];
        const upper = 65;
        const lower = 97;
        for(let i = 0; i < 26; i++){
            this.slot[i] = new Slot(x+i*slotsize, y, slotsize, String.fromCharCode(upper+i, lower+i), null);
        }
    }

    animate(ctx, moveX){
        const movement = moveX*0.7;
        this.nowx+=movement;  
        let overflow = false;
        let font_size = 100;
        
        if(this.centerx>this.nowx+25*this.slotsize){
            this.nowx = this.centerx-25*this.slotsize;
            overflow = true;
        }else if(this.centerx<this.nowx){
            this.nowx = this.centerx;
            overflow = true;
        }

        for(let i = 0; i < this.slot.length; i++){
            if(!overflow){
                this.slot[i].x += movement;
            }
            this.slot[i].animate(ctx);
        }
    }

    resize(x, y){
        this.nowx+=x-this.centerx;
        for(let i = 0; i < this.slot.length; i++){
            this.slot[i].x += x-this.centerx;
            this.slot[i].y = y;
        }
        this.centerx = x;
    }

    click(x, y){
        for(let i = 0; i < this.slot.length; i++){
            if(this.slot[i].collide(x, y)){
                //
            }
        }
    }
}