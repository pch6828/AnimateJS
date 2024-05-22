import AnimationA from "../animate/a_algorithm";
import AnimationC from "../animate/c_coffee";

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
            '점심 식사 후에 커피를 마시는 게 참 좋더라구요.'],

    }],
    ['D', null],
    ['E', null],
    ['F', null],
    ['G', null],
    ['H', null],
    ['I', null],
    ['J', null],
    ['K', null],
    ['L', null],
    ['M', null],
    ['N', null],
    ['O', null],
    ['P', null],
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