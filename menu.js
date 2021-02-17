import {Slot} from './slot.js?ver=1';

import {Bubble_Sort}        from './content/A_bubble_sort.js?ver=1'; 
import {Pour_And_Wave}      from './content/C_pour_and_wave.js?ver=1';
import {Typo_Cylinder}      from './content/D_typo_cylinder.js?ver=1';
import {Light_Bulb}         from './content/M_light_bulb.js?ver=1';
import {Swinging_Balloon}   from './content/P_swinging_balloon.js?ver=1';
import {Sticky_Letters}     from './content/S_sticky_letters.js?ver=1';

const NULL_COLOR = '#3c444c';

const colors = [
    '#E10600', '#DC3513', '#EB3300', '#FF6900', '#FF7500', 
    '#FF8200', '#F4AF23', '#F6B700', '#FFD100', '#5BC500', 
    '#30B700', '#3E9A2C', '#249E6B', '#00B388', '#00CFB4',
    '#2AD2C9', '#00A9CE', '#0092CB', '#0086D6', '#0762C8',
    '#0047BB', '#33058D', '#4A25AA', '#4C12A1', '#87189D', '#9B26B6'
];

const description = [
    'Algorithm',
    null,//Bb
    'Coffee lover',     'Design? Develop?',
    null,//Ee
    null,//Ff
    'chic Geek',//Gg
    null,//Hh
    null,//Ii
    null,//Jj
    'Kidult',//Kk
    null,//Ll
    'Mentor',
    null,//Nn
    null,//Oo
    'Problem setter',
    null,//Qq
    null,//Rr
    'Stubborn',
    null,//Tt
    null,//Uu 
    null,//Vv
    'Wide, but shallow',//Ww
    null,//Xx
    null,//Yy
    null,//Zz
];

const subject = [
    Bubble_Sort,
    null,//Bb
    Pour_And_Wave,      Typo_Cylinder,
    null,//Ee
    null,//Ff
    null,//Gg
    null,//Hh
    null,//Ii
    null,//Jj
    null,//Kk
    null,//Ll
    Light_Bulb,
    null,//Nn
    null,//Oo
    Swinging_Balloon,
    null,//Qq
    null,//Rr
    Sticky_Letters,
    null,//Tt
    null,//Uu 
    null,//Vv
    null,//Ww
    null,//Xx
    null,//Yy
    null,//Zz
];

const text = [
    ['대학에서는 알고리즘 공부를 좀 했어요.','나름 동아리 학술부장도 해보고,','대회 출제라는 것도 해보고,','동아리 연합 세미나에서 수업도 해봤어요.','','인생 첫 코딩 공부였는데 나름 적성에 맞았던 것 같아요.','덕분에 전공 수업도 나름 잘 따라갈 수 있었죠.','지금은 알고리즘 공부를 따로 하지는 않지만,','가끔씩 재미로 문제 풀이는 하고 있어요.'],
    null,//Bb
    ['커피를 참 좋아합니다.','믹스커피부터 드립커피까지 다양하게 좋아해요.','다만 프랜차이즈 커피는 아.아나 달달한 것만 마십니다.','','많이 마실 때는 하루에 3잔도 넘게 마실 때도 있었어요.','불면증을 한번 겪고 나서는 잠깐 끊었지만요.','','요새는 하루에 한 잔 정도만 마시고 있어요.','역시 코딩할 때는 커피죠.'],
    ['원래는 디자인과로 진학하려 했습니다.','컴공에 오기로 결정한 건 고3이 되어서였어요.','','동아리에서 코딩하는 친구들이 재미있어보이더라구요.','게다가 디자인에 특출난 재능이 있지도 않았기에,','진로를 컴공으로 바꾸게 되었어요.','','그래도 일상에서 나름의 미적 감각을 발휘할 때도 있어요.','예를 들자면... 지금 이 프로젝트 같은 거 말이죠.'],
    null,//Ee
    null,//Ff
    null,//Gg
    null,//Hh
    null,//Ii
    null,//Jj
    null,//Kk
    null,//Ll
    ['어쩌다 보니 멘토링도 꽤 했네요.','개인적으로 후배들 대상으로 전공 멘토링하기도 했고,','동아리에서 진행하는 멘토링도 했고,','봉사 활동으로 예비 고교생 대상으로 코딩 멘토링도 했어요.','','사실 제가 누군가를 가르칠만큼 대단한 사람은 아니에요.','그래서 멘토링도 "가르쳐주고 이끌어주다"는 느낌보다는,','멘티가 본인만의 솔루션을 만들 수 있도록 도와주려고 했어요.','제 솔루션만이 정답은 아니니까요.'],
    null,//Nn
    null,//Oo
    ['A에서도 언급했지만, 몇몇 대회에 출제를 했어요.','흔히 말하는 프로그래밍 대회? 알고리즘 대회? 였죠.','동아리나 세미나 단위에서 하는 대회, 과에서 하는 대회 등등','나름 다양한 규모의 대회에 출제를 해봤어요.','','개인적으론 문제 푸는 것보다 내는 게 더 재미있긴 해요.','특히 참가자들이 내가 낸 문제를 어려워하면 나름의 보람을 느끼죠.','대회에서 문제를 맞추면 풍선을 달아주기도 했는데,','그때 대회장을 열심히 돌아다녔던 기억이 있네요.'],
    null,//Qq
    null,//Rr
    ['나름 고집이 센 편이에요.','한번 시작한 건 끝을 봐야 하고,','할 일 미뤄두는 것도 못 견뎌요.','그래서 과제 기한 많이 남았는데 밤 샌 적도 있어요.','','하고 싶은 건 안 하곤 못 배겨요.','"내일 해야지" 맘먹어 놓고 다음날까지 못 기다려요.','','그래도 가끔은 융통성을 가져보려고 노력하고 있어요.'],
    null,//Tt
    null,//Uu 
    null,//Vv
    null,//Ww
    null,//Xx
    null,//Yy
    null,//Zz
];

const info = [
    '캔버스를 클릭해보세요!\n기둥들이 셔플됩니다!',
    null,//Bb
    '캔버스를 꾹 눌러보세요!\n커피가 떨어집니다!',      
    '캔버스에서 위아래로 드래그를 해보세요!\n글자의 색이 점점 바뀝니다!',
    null,//Ee
    null,//Ff
    null,//Gg
    null,//Hh
    null,//Ii
    null,//Jj
    null,//Kk
    null,//Ll
    '캔버스를 클릭해보세요!\n전구를 끄고 켤 수 있어요!',
    null,//Nn
    null,//Oo
    '캔버스에서 상하좌우로 드래그를 해보세요!\n풍선이 바람에 날립니다!',
    null,//Qq
    null,//Rr
    '캔버스에서 상하좌우로 드래그를 해보세요!\n글자를 잡아 당길 수 있습니다!',//Ss
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
                                    text[i],
                                    info[i]);
        }
    }

    animate(moveX){
        let movement = moveX*0.9;
        if(matchMedia("(max-width:1000px)").matches){
            movement = moveX*5;
        }
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