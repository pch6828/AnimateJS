import { AnimationA, CleanA, descriptionA, toolTipA } from "../animate/a_algorithm";
import { AnimationC, CleanC, descriptionC, toolTipC } from "../animate/c_coffee";
import { AnimationD, CleanD, descriptionD, toolTipD } from "../animate/d_designer";
import { AnimationH, CleanH, descriptionH, toolTipH } from "../animate/h_homebody";
import { AnimationM, CleanM, descriptionM, toolTipM } from "../animate/m_mimic";
import { AnimationP, CleanP, descriptionP, toolTipP } from "../animate/p_postgraduate";
import { AnimationV, CleanV, descriptionV, toolTipV } from "../animate/v_versatile";
import { AnimationK, CleanK, descriptionK, toolTipK } from "../animate/k_kidult";
import { AnimationJ, CleanJ, descriptionJ, toolTipJ } from "../animate/j_judging";
// import { AnimationE, CleanE } from "../animate/e_encyclopedia";
// import { AnimationF, CleanF } from "../animate/f_fortune";
// import { AnimationR, CleanR } from "../animate/r_rambler";
// import { AnimationS, CleanS } from "../animate/s_steady";
// import { AnimationT, CleanT } from "../animate/t_tracing";
// import { AnimationW, CleanW } from "../animate/w_workaholic";

const items = new Map([
    ['A', {
        animate: AnimationA,
        clean: CleanA,
        title: 'Algorithm',
        text: descriptionA,
        toolTipText: toolTipA
    }],
    ['B', null],
    ['C', {
        animate: AnimationC,
        clean: CleanC,
        title: 'Coffee',
        text: descriptionC,
        toolTipText: toolTipC
    }],
    ['D', {
        animate: AnimationD,
        clean: CleanD,
        title: 'Designer',
        text: descriptionD,
        toolTipText: toolTipD
    }],
    ['E', null],
    ['F', null],
    ['G', null],
    ['H', {
        animate: AnimationH,
        clean: CleanH,
        title: 'Homebody',
        text: descriptionH,
        toolTipText: toolTipH
    }],
    ['I', null],
    ['J', {
        animate: AnimationJ,
        clean: CleanJ,
        title: 'mbti-J',
        text: descriptionJ,
        toolTipText: toolTipJ
    }],
    ['K', {
        animate: AnimationK,
        clean: CleanK,
        title: 'Kidult',
        text: descriptionK,
        toolTipText: toolTipK
    }],
    ['L', null],
    ['M', {
        animate: AnimationM,
        clean: CleanM,
        title: 'Mimic',
        text: descriptionM,
        toolTipText: toolTipM,
    }],
    ['N', null],
    ['O', null],
    ['P', {
        animate: AnimationP,
        clean: CleanP,
        title: 'Postgraduate',
        text: descriptionP,
        toolTipText: toolTipP
    }],
    ['Q', null],
    ['R', null],
    ['S', null],
    ['T', null],
    ['U', null],
    ['V', {
        animate: AnimationV,
        clean: CleanV,
        title: 'Versatile',
        text: descriptionV,
        toolTipText: toolTipV
    }],
    ['W', null],
    ['X', null],
    ['Y', null],
    ['Z', null]
]);

// const items = new Map([
//     ['B', null],
//     ['E', {
//         backgroundColor: '#6E95B2',
//         toolTipColor: 'black',
//         toolTipTextColor: 'white',
//         animate: AnimationE,
//         clean: CleanE,
//         title: 'Encyclopedia',
//         text: ['잡학다식이라고 하나요?',
//             '쓸데 없는 걸 좀 많이 아는 편입니다.',
//             '예를 들자면, 여러 신화 속 상상의 동물이나',
//             '청주에 천연사이다를 많이 파는 이유 같은 거 말이죠.',
//             ' ',
//             '그러다 보니 주변인에게는 제 이미지가',
//             '일종의 "백과사전"처럼 보이기도 하나 봅니다.',
//             '모르는 게 생기면 아무거나 저한테 물어보더라구요.',
//             '(물론 꽤 높은 확률로 제가 알고 있었습니다.)',
//             '그래서 이런 별명도 있었어요.',
//             '"인간 ChatGPT"'],
//         toolTipText: ['백과 사전을 여러번 클릭해보세요!',
//             '말풍선이 나왔나요?',
//             '이번에는 말풍선을 클릭해보세요!',
//             '마치 제 잡지식처럼 계속 말풍선이 나오네요.']
//     }],
//     ['F', {
//         backgroundColor: '#B34646',
//         toolTipColor: 'white',
//         toolTipTextColor: 'black',
//         animate: AnimationF,
//         clean: CleanF,
//         title: 'Fortune',
//         text: ['\'운\'이 좋게 잘 풀린 일이 많습니다.',
//             '수능 성적이 생각보다 잘 나와서 좋은 대학을 갔고,',
//             '(물론 수시는 모두 광탈했지만)',
//             '고3 때 갑자기 전공을 바꿨음에도 적성에 잘 맞았습니다.',
//             ' ',
//             '대학원 입시도 생각보다 쉽게 통과했고,',
//             '심지어 원하는 연구실에 바로 컨택이 되었어요.',
//             '졸업하고도 바로 교수님 회사에 취직했는데,',
//             '공교롭게도 바로 전문연 편입을 할 수 있었습니다.',
//             ' ',
//             '이 모든 게 단순히 운 때문은 아니지만,',
//             '그래도 제 예상보다 결과가 더 좋게 나온 건 사실이죠.'],
//         toolTipText: ['포춘 쿠키에서 쪽지를 꺼내보세요!',
//             '당신의 운세는 무엇인가요?',
//             '포춘 쿠키마다 운세가 다릅니다. 여러가지 메시지를 찾아보세요!']
//     }],
//     ['G', null],
//     ['I', null],
//     ['L', null],
//     ['M', {
//         backgroundColor: '#C3DC93',
//         toolTipColor: 'black',
//         toolTipTextColor: 'white',
//         animate: AnimationM,
//         clean: CleanM,
//         title: 'Mentor',
//         text: ['뭔가를 알려주고, 도와주는 걸 즐깁니다.',
//             '거창하게 말하자면, "멘토" 같은 거죠.',
//             '',
//             '대학 다닐 때는 후배들도 많이 도와줬고,',
//             '동아리에서도 학술부장을 맡아 이것저것 수업도 했고,',
//             '가끔씩 고향 가면 고등학교를 찾아가서,',
//             '후배들에게 이런저런 조언도 해주려 합니다.',
//             '',
//             '어쩌다 이런 걸 즐기게 되었는지는 잘 모르겠네요.',
//             '제가 오지랖이 좀 넓어서 그런가 보죠.'],
//         toolTipText: ['멘티들이 반대쪽으로 갈 수 있도록 이끌어주세요!',
//             '클릭을 하면 해당 위치에 기둥이 생깁니다.',
//             '기둥 사이 간격이 너무 멀면 멘티들이 건널 수 없어요!']
//     }],
//     ['N', null],
//     ['O', null],
//     ['Q', null],
//     ['R', {
//         backgroundColor: '#004953',
//         toolTipColor: 'white',
//         toolTipTextColor: 'black',
//         animate: AnimationR,
//         clean: CleanR,
//         title: 'Rambler',
//         text: ['걷는 걸 꽤 좋아합니다.',
//             '특히 밤에 산책 다니는 걸 좋아해요.',
//             '대학 시절에는 밤 산책만 한 2시간씩 다녔으니까요.',
//             ' ',
//             '이어폰 꽂고, 노래 들으면서 걸으면,',
//             '시간 가는 줄 모르고 걷게 되더라구요.',
//             ' ',
//             '대전에 오고 나서는 산책 횟수가 줄었습니다.',
//             '밤에 걸을만한 곳이 딱히 없더라구요.',
//             '그래도 가끔씩은 산책 나가서 한참 걷고 옵니다.'],
//         toolTipText: ['산책 다니는 사람(?)들이 많네요!',
//             '마우스로 잡아서 끌면 맘대로 끌고 다닐 수 있어요.',
//             '걱정 마세요, 놓으면 다시 가던 길 갈 겁니다.']
//     }],
//     ['S', {
//         backgroundColor: '#261430',
//         toolTipColor: 'white',
//         toolTipTextColor: 'black',
//         animate: AnimationS,
//         clean: CleanS,
//         title: 'Steady',
//         text: [],
//         toolTipText: []
//     }],
//     ['T', {
//         backgroundColor: '#261430',
//         toolTipColor: 'white',
//         toolTipTextColor: 'black',
//         animate: AnimationT,
//         clean: CleanT,
//         title: 'Tracing',
//         text: ['모방을 많이 하는 편입니다.',
//             '처음 코딩을 배울 때도 잘하는 친구를 따라했고,',
//             '처음 연구실에 왔을 때도, 선배들의 PPT를 따라했었죠.',
//             '사실 이 프로젝트도 김종민 개발자님의 "fff"를',
//             '모티브로 해서 만들어졌어요.',
//             ' ',
//             '아직은 스스로 아이디어를 내는 건 어렵네요.',
//             '그래도 남들의 방식을 따라하면서,',
//             '한두가지 작은 아이디어를 덧붙이려고 해요.',
//             '언젠가는 저만의 아이디어가 나오지 않을까요?'],
//         toolTipText: ['좌클릭 드래그를 하면 선이 그려집니다.',
//             '똑같이 생긴 선이 여러개 그려지죠?',
//             '우클릭을 하면 선이 생기는 개수가 늘어납니다.']
//     }],
//     ['U', null],
//     ['W', {
//         backgroundColor: '#0A3255',
//         toolTipColor: 'white',
//         toolTipTextColor: 'black',
//         animate: AnimationW,
//         clean: CleanW,
//         title: 'Workaholic',
//         text: ['약간 워크홀릭 기질이 있어요.',
//             '일이 생기면 가급적 당장 처리하려고 하고,',
//             '진행 중인 일이 계속 머릿속에서 맴돌아요.',
//             ' ',
//             '물론 일을 가장 좋아하는 건 아닙니다.',
//             '당연히 노는 게 일하는 것보다 즐겁죠.',
//             '그렇지만 하던 일이 잘 풀리면 그것도 나름대로 즐겁습니다.',
//             '시험 문제가 잘 풀린다던가, ',
//             '짜던 코드가 내 생각대로 동작해준다면,',
//             '정말 희열이 느껴지거든요.'],
//         toolTipText: ['끊임없이 일이 떨어지고 있네요.',
//             '글자 위에 점점 쌓이고 있죠?',
//             '마우스를 이리저리 움직여서 얼른 일을 털어버리세요!']
//     }],
//     ['X', null],
//     ['Y', null],
//     ['Z', null]
// ]);

export default items;
