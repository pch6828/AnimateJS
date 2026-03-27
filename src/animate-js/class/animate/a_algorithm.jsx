const SWAP_SPEED = 50;

class BubbleSort {
    constructor() {
        this.arr = [];
        this.swapidx = 0;
        this.nowidx = 0;
        this.isSwapping = false;
        this.swapload = 0;
        this.changeamount = 0;
        this.fixed = 0;
        for (let i = 0; i < 9; i++) {
            this.arr[i] = i + 1;
        }
    }

    shuffle() {
        let currentIndex = this.arr.length, temporaryValue, randomIndex;
        for (let i = 0; i < 9; i++) {
            this.arr[i] = i + 1;
        }
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = this.arr[currentIndex];
            this.arr[currentIndex] = this.arr[randomIndex];
            this.arr[randomIndex] = temporaryValue;
        }
    }
}

var sortbars = null;

export function AnimationA(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const strSize = Math.min(height, width) / 9;
    const unitHeight = height / 20;

    if (sortbars === null) {
        sortbars = new BubbleSort();
        sortbars.shuffle();
    }

    if (movement.isDown) {
        sortbars.shuffle();
        sortbars.fixed = 0;
        sortbars.isSwapping = false;
        sortbars.nowidx = 0;
        sortbars.swapload = 0;
        sortbars.swapidx = 0;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.font = strSize + 'px Major Mono Display';
    const textwidth = ctx.measureText('ALGORIThM').width;
    ctx.fillText('ALGORIThM', centerx - textwidth / 2, centery + strSize * 2);

    if (sortbars.isSwapping) {
        if (sortbars.swapload < SWAP_SPEED) {
            sortbars.swapload++;
            sortbars.arr[sortbars.swapidx] -= sortbars.changeamount;
            sortbars.arr[sortbars.swapidx + 1] += sortbars.changeamount;
        } else {
            sortbars.isSwapping = false;
            sortbars.nowidx++;
        }
    }
    else if (sortbars.fixed < 9) {
        if (sortbars.arr[sortbars.nowidx] > sortbars.arr[sortbars.nowidx + 1]) {
            sortbars.swapidx = sortbars.nowidx;
            sortbars.isSwapping = true;
            sortbars.swapload = 0;
            sortbars.changeamount = (sortbars.arr[sortbars.nowidx] - sortbars.arr[sortbars.nowidx + 1]) / SWAP_SPEED;
        } else {
            sortbars.nowidx++;
        }
    }

    if (sortbars.nowidx === 9 - sortbars.fixed) {
        sortbars.fixed++;
        sortbars.nowidx = 0;
    }
    for (let i = 0; i < 9 - sortbars.fixed; i++) {
        ctx.fillRect(centerx - textwidth / 2 + textwidth / 9 * i, centery + strSize, textwidth / 9, -unitHeight * sortbars.arr[i]);
    }
    ctx.fillStyle = "rgba(0,0,0,1)";
    for (let i = 9 - sortbars.fixed; i < 9; i++) {
        ctx.fillRect(centerx - textwidth / 2 + textwidth / 9 * i, centery + strSize, textwidth / 9, -unitHeight * sortbars.arr[i]);
    }
}

export function CleanA() {
    sortbars = null;
}

export const descriptionA = [
    `"청소년이 잘못하면 소년원을 가고, 대학생이 잘못하면 대학원을 간다"라는 우스갯소리가 있죠.
    전 뭘 잘못했을까요? 학부 2학년 때 DB 수업을 듣고 흥미를 느낀 것 정도겠네요.`,
    `맞아요. 대학원 졸업했습니다. KAIST에서 석사과정을 밟았어요.
    위에서도 언급했듯이 학부 수업을 듣고 DB에 흥미를 가졌고, 졸업 프로젝트도 관련된 주제로 하면서 자연스럽게 진학하게 되었죠.
    당시에는 DB에 대해서 공부하고 프로젝트를 하는 게 재미있어서, 당연히 박사까지 할 생각이었어요.
    친구들, 주변 지인들 모두 "너는 연구가 잘 맞을 것 같다, 잘 어울린다"라고 말해줬고, 저도 그렇게 생각했습니다.`,
    `그런데 막상 석사과정을 시작해보니, 연구는 제 적성에 맞지 않았습니다.
    연구와 일상 간의 균형을 맞추지 못한 게 가장 큰 문제였습니다. 
    불면증이 생기는 등 일상생활이 무너지니까 스트레스가 컸어요.`,
    `후회하냐고요? 아뇨, 석사 과정동안 정말 많은 걸 배웠고, 좋은 경험도 많이 했습니다.
    그리고 연구실 생활은 참 행복했어요.
    지도교수님도 좋은 분이셨고, 연구실 동료들과도 정말 많은 추억을 남겼습니다. 
    아직도 연구실 동료들과 종종 만나서 놀고는 합니다.`,
    `애초에 후회하고 있다면 졸업 후에 지도교수님 회사에 입사하지 않았겠죠. :)`
];

export const toolTipA = [
    '학사모는 잡고 던질 수도 있고, 그냥 떨어트릴 수도 있습니다.',
    '화면 밖으로 나가면 다시 위에서 내려오니 여러 번 시도할 수 있어요.'
];
