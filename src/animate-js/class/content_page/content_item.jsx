import AnimationA from "../animate/a_algorithm";
import AnimationC from "../animate/c_coffee";
import AnimationH from "../animate/h_homebody";
import AnimationP from "../animate/p_postgraduate";

const items = new Map([
    ['A', {
        backgroundColor: '#FFAD00',
        animate: AnimationA,
        title: 'Algorithm',
        text: ['대학에서는 알고리즘 공부를 좀 했어요.',
            '나름 동아리 학술부장도 해보고,',
            '대회 출제라는 것도 해보고,',
            '동아리 연합 세미나에서 수업도 해봤어요.',
            ' ',
            '인생 첫 코딩 공부였는데 나름 적성에 맞았던 것 같아요.',
            '덕분에 전공 수업도 나름 잘 따라갈 수 있었죠.',
            '지금은 알고리즘 공부를 따로 하지는 않지만,',
            '가끔씩 재미로 문제 풀이는 하고 있어요.']
    }],
    ['B', null],
    ['C', {
        backgroundColor: '#00CFB4',
        animate: AnimationC,
        title: 'Coffee',
        text: ['커피를 참 좋아합니다.',
            '믹스커피부터 드립커피까지 다양하게 좋아해요.',
            '다만 프랜차이즈 커피는 아.아나 달달한 것만 마십니다.',
            ' ',
            '대학생 때는 하루에 3잔도 넘게 마실 때도 있었어요.',
            '불면증이 생기면서 3년 정도 끊었지만요.',
            ' ',
            '요새는 가끔 한잔씩 마시고 있습니다.',
            '점심 식사 후에 커피를 마시는 게 참 좋더라구요.']
    }],
    ['D', null],
    ['E', null],
    ['F', null],
    ['G', null],
    ['H', {
        backgroundColor: '#191970',
        animate: AnimationH,
        title: 'Homebody',
        text: ['집돌이입니다.',
            '일주일동안 집에만 있던 적도 있어요.',
            '집에서는 보통 멍때리거나 유튜브를 봅니다.',
            ' ',
            '취직을 한 지금도 주말에 놀러나가기보다는',
            '집에 있을 때가 많습니다.',
            ' ',
            '물론 집 밖으로 나가는 걸 싫어하는 건 아닙니다.',
            '약속이 잡히면 즐겁게 나갑니다.',
            '단지 제가 먼저 약속을 잡는 일이 적을 뿐이죠.']
    }],
    ['I', null],
    ['J', null],
    ['K', null],
    ['L', null],
    ['M', null],
    ['N', null],
    ['O', null],
    ['P', {
        backgroundColor: '#B6CADA',
        animate: AnimationP,
        title: 'Postgraduate',
        text: ['대학원 졸업했습니다.',
            'KAIST에서 석사과정을 밟았어요.',
            '학부 때 DB에 흥미가 생겨서 진학하게 되었죠.',
            '석사 하면서 많이 배웠고, 좋은 경험도 많이 했습니다.',
            ' ',
            '왜 박사 안 갔냐구요?',
            '전 연구 쪽으로는 잘 안 맞더라구요.',
            '그럼에도 연구실 생활은 행복했습니다.',
            '오죽하면 졸업하고도 교수님 회사에 입사했을까요.']
    }],
    ['Q', null],
    ['R', null],
    ['S', null],
    ['T', null],
    ['U', null],
    ['V', null],
    ['W', null],
    ['X', null],
    ['Y', null],
    ['Z', null]
]);

export default items;