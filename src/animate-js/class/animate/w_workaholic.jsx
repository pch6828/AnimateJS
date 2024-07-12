class MouseChasingWord {
    constructor(word) {
        this.word = word;
        this.point = { x: 0, y: 0 };
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

function AnimationW(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;

    // 일이 하늘에서 천천히 떨어지고 마우스 위에 Workaholic 글자가 따라다니도록
    // 마우스가 움직임에 따라 글자 위에 쌓인 일들이 흔들리고, 일정 이상이 될 경우 다시 떨어지도록
    mouseChasingWord.move(movement, width, height);
    mouseChasingWord.draw(ctx, width, height);
}

export default AnimationW;