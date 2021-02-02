import {Slot} from './slot.js?ver=1';
import {Cylinder} from './content/D_typo_cylinder.js';

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
];

const description = [
    null,//Aa
    null,//Bb
    null,//Cc
    'Design? Develop?',//Dd
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
];

const subject = [
    null,//Aa
    null,//Bb
    null,//Cc
    Cylinder,//Dd
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
];

const text = [
    null,//Aa
    null,//Bb
    null,//Cc
    ['원래는 디자인과로 진학하려 했습니다.',
    '컴공에 오기로 결정한 건 고3이 되어서였어요.',
    '',
    '동아리에서 코딩하는 친구들이 재미있어보이더라구요.',
    '게다가 디자인에 특출난 재능이 있지도 않았기에,',
    '진로를 컴공으로 바꾸게 되었어요.',
    '',
    '그래도 일상에서 나름의 미적 감각을 발휘할 때도 있어요.',
    '예를 들자면... 지금 이 프로젝트 같은 거 말이죠.'],//Dd
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
];

export class Menu{
    constructor(x, slotsize){
        this.nowx = x;
        this.centerx = x;
        this.slotsize = slotsize;
        this.slot = [];
        const upper = 65;
        const lower = 97;
        for(let i = 0; i < 26; i++){
            this.slot[i] = new Slot(x+i*slotsize, 
                                    slotsize, 
                                    String.fromCharCode(upper+i, lower+i), 
                                    description[i], 
                                    (description[i]?colors[i]:NULL_COLOR),  
                                    subject[i],
                                    text[i]);
        }
    }

    animate(moveX){
        let movement = moveX*0.9;
        let prevx = this.nowx;
        this.nowx+=movement;  

        if(this.centerx>this.nowx+25*this.slotsize){
            this.nowx = this.centerx-25*this.slotsize;
            movement = this.nowx - prevx;
        }else if(this.centerx<this.nowx){
            this.nowx = this.centerx;
            movement = this.nowx - prevx;
        }
        for(let i = 0; i < this.slot.length; i++){
            this.slot[i].x += movement;
            this.slot[i].animate();
        }
    }

    resize(x){
        this.nowx = this.nowx/this.centerx*x;
        for(let i = 0; i < this.slot.length; i++){
            this.slot[i].x = this.nowx+i*this.slotsize;
        }
        this.centerx = x;
    }
}