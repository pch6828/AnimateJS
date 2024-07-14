class FallingObject {
    constructor() {
        this.posRatio = { xRatio: Math.random(), yRatio: 0 };
        this.dyRatio = 0;
        this.ddyRatio = Math.random() * 0.0003;
    }

    move(movement, width, height) {
        this.posRatio.yRatio += this.dyRatio;
        this.dyRatio += this.ddyRatio;
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(width * this.posRatio.xRatio, height * this.posRatio.yRatio);
        ctx.fillStyle = 'white';
        ctx.fillRect(-width / 60, -width / 60, width / 30, width / 30);
        ctx.restore();
    }
}

class MouseChasingWord {
    constructor(word, x, y) {
        this.word = word;
        this.point = { x: x, y: y };
    }

    move(movement, width, height) {
        this.point.x = movement.mousePoint.x;
        this.point.y = movement.mousePoint.y;
    }

    draw(ctx, width, height) {
        const fontSize = height / 15;

        ctx.font = fontSize + 'px Monoton';
        ctx.fillStyle = 'white';
        const textWidth = ctx.measureText(this.word).width;

        ctx.fillText(this.word, this.point.x - textWidth / 2, this.point.y + fontSize / 2);
    }
}

const mouseChasingWord = new MouseChasingWord('Workaholic');
const temp = new FallingObject();

function AnimationW(ctx, width, height, movement) {

    // 일이 하늘에서 천천히 떨어지고 마우스 위에 Workaholic 글자가 따라다니도록
    // 마우스가 움직임에 따라 글자 위에 쌓인 일들이 흔들리고, 일정 이상이 될 경우 다시 떨어지도록
    mouseChasingWord.move(movement, width, height);
    mouseChasingWord.draw(ctx, width, height);

    temp.move(movement, width, height);
    temp.draw(ctx, width, height);
}

export default AnimationW;