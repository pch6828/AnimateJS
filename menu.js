import {Slot} from './slot.js?ver=1';

const NULL_COLOR = '#3c444c';

const colors = [
    '#E10600',//Aa 
    '#DC3513',//Bb 
    '#EB3300',//Cc 
    '#FF6900',//Dd 
    '#FF7500',//Ee 
    '#FF8200',//Ff 
    '#F4AF23',//Gg 
    '#F6B700',//Hh 
    '#FFD100',//Ii 
    '#5BC500',//Jj 
    '#30B700',//Kk 
    '#3E9A2C',//Ll 
    '#249E6B',//Mm
    '#00B388',//Nn
    '#00CFB4',//Oo
    '#2AD2C9',//Pp
    '#00A9CE',//Qq
    '#0092CB',//Rr
    '#0086D6',//Ss
    '#0762C8',//Tt
    '#0047BB',//Uu 
    '#33058D',//Vv
    '#4A25AA',//Ww
    '#4C12A1',//Xx
    '#87189D',//Yy
    '#9B26B6',//Zz
]

const description = [
    null,//Aa
    null,//Bb
    null,//Cc
    'design? develop?',//Dd
    null,//Ee
    null,//Ff
    null,//Gg
    null,//Hh
    null,//Ii
    null,//Jj
    null,//Kk
    null,//Ll
    null,//Mm
    null,//Nn
    null,//Oo
    null,//Pp
    null,//Qq
    null,//Rr
    null,//Ss
    null,//Tt
    null,//Uu 
    null,//Vv
    null,//Ww
    null,//Xx
    null,//Yy
    null,//Zz
]

export class Menu{
    constructor(x, y, slotsize){
        this.nowx = x;
        this.centerx = x;
        this.slotsize = slotsize;
        this.slot = [];
        const upper = 65;
        const lower = 97;
        for(let i = 0; i < 26; i++){
            this.slot[i] = new Slot(x+i*slotsize, y, slotsize, String.fromCharCode(upper+i, lower+i), description[i], (description[i]?colors[i]:NULL_COLOR));
        }
    }

    animate(moveX){
        const movement = moveX*0.7;
        this.nowx+=movement;  
        let overflow = false;
        
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
            this.slot[i].animate();
        }
    }

    resize(x, y){
        this.nowx = this.nowx/this.centerx*x;
        for(let i = 0; i < this.slot.length; i++){
            this.slot[i].x = this.nowx+i*this.slotsize;
            this.slot[i].y = y;
        }
        this.centerx = x;
    }
}