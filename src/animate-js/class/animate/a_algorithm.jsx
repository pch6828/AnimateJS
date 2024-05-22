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

function AnimationA(ctx, width, height, movement) {
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

export default AnimationA;