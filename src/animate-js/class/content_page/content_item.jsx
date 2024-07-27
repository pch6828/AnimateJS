import { AnimationA, CleanA } from "../animate/a_algorithm";
import { AnimationC, CleanC } from "../animate/c_coffee";
import { AnimationD, CleanD } from "../animate/d_design_develop";
import { AnimationE, CleanE } from "../animate/e_encyclopedia";
import { AnimationF, CleanF } from "../animate/f_fortune";
import { AnimationH, CleanH } from "../animate/h_homebody";
import { AnimationJ, CleanJ } from "../animate/j_judging";
import { AnimationK, CleanK } from "../animate/k_kidult";
import { AnimationM, CleanM } from "../animate/m_mentor";
import { AnimationP, CleanP } from "../animate/p_postgraduate";
import { AnimationR, CleanR } from "../animate/r_rambler";
import { AnimationT, CleanT } from "../animate/t_tracing";
import { AnimationV, CleanV } from "../animate/v_versatile";
import { AnimationW, CleanW } from "../animate/w_workaholic";

const items = new Map([
    ['A', {
        backgroundColor: '#FFAD00',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationA,
        clean: CleanA,
        title: 'Algorithm',
        text: ['대학에서는 알고리즘 공부를 좀 했어요.',
            '나름 동아리 학술부장도 해보고,',
            '대회 출제라는 것도 해보고,',
            '동아리 연합 세미나에서 수업도 해봤어요.',
            ' ',
            '인생 첫 코딩 공부였는데 나름 적성에 맞았던 것 같아요.',
            '덕분에 전공 수업도 나름 잘 따라갈 수 있었죠.',
            '지금은 알고리즘 공부를 따로 하지는 않지만,',
            '가끔씩 재미로 문제 풀이는 하고 있어요.'],
        toolTipText: ['마우스를 꾹 누르면 막대가 섞입니다.',
            '섞인 막대가 정렬되는 것을 지켜보세요!']
    }],
    ['B', null],
    ['C', {
        backgroundColor: '#00CFB4',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationC,
        clean: CleanC,
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
        toolTipText: ['마우스를 꾹 누르면 커피가 잔으로 떨어집니다.',
            '커피가 넘치지는 않을테니 걱정 마세요!',
            '시간이 지나면 커피는 다시 줄어듭니다.']
    }],
    ['D', {
        backgroundColor: '#32363F',
        toolTipColor: 'white',
        toolTipTextColor: 'black',
        animate: AnimationD,
        clean: CleanD,
        title: 'Design? Develop?',
        text: ['원래는 디자인과로 진학하려 했습니다.',
            '컴공에 오기로 결정한 건 고3이 되어서였어요.',
            ' ',
            '동아리에서 코딩하는 친구들이 재미있어보이더라구요.',
            '게다가 디자인에 특출난 재능이 있지도 않았기에,',
            '진로를 컴공으로 바꾸게 되었어요.',
            '지금 생각하면 바꾸길 잘했다고 생각합니다.',
            ' ',
            '그래도 일상에서 나름의 미적 감각을 발휘할 때도 있어요.',
            '예를 들자면... 지금 이 프로젝트 같은 거 말이죠.'],
        toolTipText: ['마우스를 꾹 누른 채로 움직여보세요!',
            '숨겨진 글자가 드러납니다.',
            '왼쪽, 오른쪽 버튼에 따라 서로 다른 글자를 찾을 수 있습니다.']
    }],
    ['E', {
        backgroundColor: '#6E95B2',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationE,
        clean: CleanE,
        title: 'Encyclopedia',
        text: ['잡학다식이라고 하나요?',
            '쓸데 없는 걸 좀 많이 아는 편입니다.',
            '예를 들자면, 여러 신화 속 상상의 동물이나',
            '청주에 천연사이다를 많이 파는 이유 같은 거 말이죠.',
            ' ',
            '그러다 보니 주변인에게는 제 이미지가',
            '일종의 "백과사전"처럼 보이기도 하나 봅니다.',
            '모르는 게 생기면 아무거나 저한테 물어보더라구요.',
            '(물론 꽤 높은 확률로 제가 알고 있었습니다.)',
            '그래서 이런 별명도 있었어요.',
            '"인간 ChatGPT"'],
        toolTipText: ['백과 사전을 여러번 클릭해보세요!',
            '말풍선이 나왔나요?',
            '이번에는 말풍선을 클릭해보세요!',
            '마치 제 잡지식처럼 계속 말풍선이 나오네요.']
    }],
    ['F', {
        backgroundColor: '#B34646',
        toolTipColor: 'white',
        toolTipTextColor: 'black',
        animate: AnimationF,
        clean: CleanF,
        title: 'Fortune',
        text: ['\'운\'이 좋게 잘 풀린 일이 많습니다.',
            '수능 성적이 생각보다 잘 나와서 좋은 대학을 갔고,',
            '(물론 수시는 모두 광탈했지만)',
            '고3 때 갑자기 전공을 바꿨음에도 적성에 잘 맞았습니다.',
            ' ',
            '대학원 입시도 생각보다 쉽게 통과했고,',
            '심지어 원하는 연구실에 바로 컨택이 되었어요.',
            '졸업하고도 바로 교수님 회사에 취직했는데,',
            '공교롭게도 바로 전문연 편입을 할 수 있었습니다.',
            ' ',
            '이 모든 게 단순히 운 때문은 아니지만,',
            '그래도 제 예상보다 결과가 더 좋게 나온 건 사실이죠.'],
        toolTipText: ['포춘 쿠키에서 쪽지를 꺼내보세요!',
            '당신의 운세는 무엇인가요?',
            '포춘 쿠키마다 운세가 다릅니다. 여러가지 메시지를 찾아보세요!']
    }],
    ['G', null],
    ['H', {
        backgroundColor: '#191970',
        toolTipColor: 'white',
        toolTipTextColor: 'black',
        animate: AnimationH,
        clean: CleanH,
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
            '단지 제가 먼저 약속을 잡는 일이 적을 뿐이죠.'],
        toolTipText: ['집안에 있는 글자들을 밖으로 내보내보세요.',
            '이 글자들도 집을 정말 좋아합니다.',
            '글자들이 서둘러 집으로 돌아가는 모습을 지켜보세요.']
    }],
    ['I', null],
    ['J', {
        backgroundColor: '#F7C46C',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationJ,
        clean: CleanJ,
        title: 'mbti-J',
        text: ['흔히들 J에 대해 하는 말이 있죠.',
            '"J는 계획이 틀어지면 스트레스를 받는다."',
            '네, 제가 그렇습니다.',
            ' ',
            '그렇다고 제가 계획에 미친 강박증 환자는 아니에요.',
            '어느 정도의 여유도 "계획"해둔다구요.',
            '',
            '그리고 제 계획이 틀어지는 일은 많지 않습니다.',
            '플랜 A가 틀어질 것을 대비한 플랜 B,',
            '그리고 그 플랜까지도 틀어질 것을 대비한 플랜 C, D...',
            '이렇게 여러가지 플랜을 만들어두거든요.',
            '',
            '피곤하게 산다구요? 뭐, 사람마다 생각은 다른 거니까요.'],

        toolTipText: ['계획이 점점 가지를 치고 있군요?',
            '당신의 마우스를 따라서 계획이 진행될 겁니다.',
            '계획의 끝에 도달했나요?',
            '클릭하면 다시 새로운 계획이 생겨난답니다.']
    }],
    ['K', {
        backgroundColor: '#C9CBDB',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationK,
        clean: CleanK,
        title: 'Kidult',
        text: ['키덜트입니다.',
            '레고나 클레이 같은 취미에 관심이 많아요.',
            '다 어릴 때 좋아하던 장난감들이죠.',
            ' ',
            '대학생 때는 이런 취미를 거의 하지 못했습니다.',
            '하숙집 방이 너무 좁았거든요.',
            '기껏해야 클레이 조금 한 정도였죠.',
            ' ',
            '그러다 대학원생이 되고, 보다 넓은 집에 살면서',
            '이런 취미들을 다시 시작할 수 있었어요.',
            '지금은 레고도 간간히 사모으고 있습니다.',
            '너무 돈을 많이 쓰는 건 아닌가 좀 걱정되기도 해요.'],
        toolTipText: ['레고 블록을 가지고 여러가지 모양이나 단어를 만들어보세요!',
            '한번에 하나의 블록만 옮길 수 있습니다.',
            '색깔이나 크기가 마음에 안 들면 공중에서 블록을 놓아보세요.',
            '새로운 블록이 생길 겁니다.']
    }],
    ['L', null],
    ['M', {
        backgroundColor: '#C3DC93',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationM,
        clean: CleanM,
        title: 'Mentor',
        text: ['뭔가를 알려주고, 도와주는 걸 즐깁니다.',
            '거창하게 말하자면, "멘토" 같은 거죠.',
            '',
            '대학 다닐 때는 후배들도 많이 도와줬고,',
            '동아리에서도 학술부장을 맡아 이것저것 수업도 했고,',
            '가끔씩 고향 가면 고등학교를 찾아가서,',
            '후배들에게 이런저런 조언도 해주려 합니다.',
            '',
            '어쩌다 이런 걸 즐기게 되었는지는 잘 모르겠네요.',
            '제가 오지랖이 좀 넓어서 그런가 보죠.'],
        toolTipText: ['멘티들이 반대쪽으로 갈 수 있도록 이끌어주세요!',
            '클릭을 하면 해당 위치에 기둥이 생깁니다.',
            '기둥 사이 간격이 너무 멀면 멘티들이 건널 수 없어요!']
    }],
    ['N', null],
    ['O', null],
    ['P', {
        backgroundColor: '#B6CADA',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationP,
        clean: CleanP,
        title: 'Postgraduate',
        text: ['대학원 졸업했습니다.',
            'KAIST에서 석사과정을 밟았어요.',
            '학부 때 DB에 흥미가 생겨서 진학하게 되었죠.',
            '석사 하면서 많이 배웠고, 좋은 경험도 많이 했습니다.',
            ' ',
            '왜 박사 안 갔냐구요?',
            '전 연구 쪽으로는 잘 안 맞더라구요.',
            '그럼에도 연구실 생활은 행복했습니다.',
            '오죽하면 졸업하고도 교수님 회사에 입사했을까요.'],
        toolTipText: ['졸업식을 떠올리며, 학사모를 잡고 던져보세요!']
    }],
    ['Q', null],
    ['R', {
        backgroundColor: '#B6CADA',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationR,
        clean: CleanR,
        title: 'Rambler',
        text: [],
        toolTipText: []
    }],
    ['S', null],
    ['T', {
        backgroundColor: '#261430',
        toolTipColor: 'white',
        toolTipTextColor: 'black',
        animate: AnimationT,
        clean: CleanT,
        title: 'Tracing',
        text: ['모방을 많이 하는 편입니다.',
            '처음 코딩을 배울 때도 잘하는 친구를 따라했고,',
            '처음 연구실에 왔을 때도, 선배들의 PPT를 따라했었죠.',
            '사실 이 프로젝트도 김종민 개발자님의 "fff"를',
            '모티브로 해서 만들어졌어요.',
            ' ',
            '아직은 스스로 아이디어를 내는 건 어렵네요.',
            '그래도 남들의 방식을 따라하면서,',
            '한두가지 작은 아이디어를 덧붙이려고 해요.',
            '언젠가는 저만의 아이디어가 나오지 않을까요?'],
        toolTipText: ['좌클릭 드래그를 하면 선이 그려집니다.',
            '똑같이 생긴 선이 여러개 그려지죠?',
            '우클릭을 하면 선이 생기는 개수가 늘어납니다.']
    }],
    ['U', null],
    ['V', {
        backgroundColor: '#D7D2CB',
        toolTipColor: 'black',
        toolTipTextColor: 'white',
        animate: AnimationV,
        clean: CleanV,
        title: 'Versatile',
        text: ['제 입으로 말하긴 민망하지만,',
            '할 줄 아는 게 꽤 많습니다.',
            '나름 미적 감각은 있어서 간단한 디자인은 할 수 있고,',
            '손재주가 좋아서 만들기도 좀 합니다.',
            ' ',
            '전공 쪽으로 넘어가면,',
            '코딩 테스트 출제로 외주도 받아봤구요.',
            '프론트엔드 개발도 조금 합니다.',
            '지금은 DB 엔진 개발을 하고 있죠.',
            ' ',
            '너무 얕게만 알고 있어서 이걸 다 어디다 쓰나 싶었는데,',
            '지금 와서 보니까 다 언젠가는 쓰게 되더라구요.'],
        toolTipText: ['멀티툴의 다양한 도구를 선택해보세요!',
            '선택된 도구를 다시 누르면 원래 상태로 돌아옵니다.']
    }],
    ['W', {
        backgroundColor: '#0A3255',
        toolTipColor: 'white',
        toolTipTextColor: 'black',
        animate: AnimationW,
        clean: CleanW,
        title: 'Workaholic',
        text: ['약간 워크홀릭 기질이 있어요.',
            '일이 생기면 가급적 당장 처리하려고 하고,',
            '진행 중인 일이 계속 머릿속에서 맴돌아요.',
            ' ',
            '물론 일을 가장 좋아하는 건 아닙니다.',
            '당연히 노는 게 일하는 것보다 즐겁죠.',
            '그렇지만 하던 일이 잘 풀리면 그것도 나름대로 즐겁습니다.',
            '시험 문제가 잘 풀린다던가, ',
            '짜던 코드가 내 생각대로 동작해준다면,',
            '정말 희열이 느껴지거든요.'],
        toolTipText: ['끊임없이 일이 떨어지고 있네요.',
            '글자 위에 점점 쌓이고 있죠?',
            '마우스를 이리저리 움직여서 얼른 일을 털어버리세요!']
    }],
    ['X', null],
    ['Y', null],
    ['Z', null]
]);

export default items;