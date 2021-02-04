import {Slot} from './slot.js?ver=1';
import {Typo_Cylinder} from './content/D_typo_cylinder.js?ver=1';
import {Pour_And_Wave} from './content/C_pour_and_wave.js?ver=1';

const NULL_COLOR = '#3c444c';

const colors = [
    '#E10600', '#DC3513', '#EB3300', '#FF6900', '#FF7500', 
    '#FF8200', '#F4AF23', '#F6B700', '#FFD100', '#5BC500', 
    '#30B700', '#3E9A2C', '#249E6B', '#00B388', '#00CFB4',
    '#2AD2C9', '#00A9CE', '#0092CB', '#0086D6', '#0762C8',
    '#0047BB', '#33058D', '#4A25AA', '#4C12A1', '#87189D', '#9B26B6'
];

const description = [
    'Algorithm',//Aa
    null,//Bb
    'Coffee lover',//Cc
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
    Pour_And_Wave,//Cc
    Typo_Cylinder,//Dd
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
    ['커피를 참 좋아합니다.',
    '믹스커피부터 드립커피까지 다양하게 좋아해요.',
    '다만 프랜차이즈 커피는 아.아나 달달한 것만 마십니다.',
    '',
    '많이 마실 때는 하루에 3잔도 넘게 마실 때도 있었어요.',
    '불면증을 한번 겪고 나서는 잠깐 끊었지만요.',
    '',
    '요새는 하루에 한 잔 정도만 마시고 있어요.',
    '역시 코딩할 때는 커피죠.'],//Cc
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
                                    (subject[i]?colors[i]:NULL_COLOR),  
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