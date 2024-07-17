class CopiedNeonLines {
    static maxCopy = 8;
    static minCopy = 2;
    constructor() {
        this.numCopy = 2;
        this.increment = 1;
        this.paths = [];
        this.prevIsDown = false;
    }

    move(movement, width, height) {
        if (movement.isDown) {
            if (movement.mouseButton === 'left') {
                const xRatio = movement.mousePoint.x / width - 0.5;
                const yRatio = movement.mousePoint.y / height - 0.5;
                if (this.prevIsDown) {
                    this.paths[this.paths.length - 1].push({ xRatio: xRatio, yRatio: yRatio });
                } else {
                    this.paths.push([{ xRatio: xRatio, yRatio: yRatio }]);
                }
            } else if (movement.mouseButton === 'right' && !this.prevIsDown) {
                this.paths = [];
                this.numCopy += this.increment;
                if (this.numCopy === CopiedNeonLines.maxCopy ||
                    this.numCopy === CopiedNeonLines.minCopy) {
                    this.increment = -this.increment;
                }
            }
        }
        this.prevIsDown = movement.isDown;
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(width / 2, height / 2);
        for (let i = 0; i < this.numCopy; i++) {
            ctx.save();
            ctx.rotate(Math.PI * 2 / this.numCopy * i);
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'white';
            ctx.lineWidth = width / 50;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            this.paths.forEach(path => {
                for (let j = 1; j < path.length; j++) {
                    const point1 = path[j - 1];
                    const point2 = path[j];
                    ctx.beginPath();
                    ctx.moveTo(point1.xRatio * width, point1.yRatio * height);
                    ctx.lineTo(point2.xRatio * width, point2.yRatio * height);
                    ctx.closePath();
                    ctx.stroke();
                }
            })

            ctx.restore();
        }
        ctx.restore();
    }
}

const copiedNeonLines = new CopiedNeonLines();

function AnimationT(ctx, width, height, movement) {
    // 우클릭할 때마다 모방 횟수 추가, 최대 개수일 경우 다시 줄어들도록
    // 좌클릭으로 드래그할 때마다 획을 그리고, 이를 모방해서 원형으로 그리기
    // 이미 그려진 획이 있는데 우클릭할 경우 획을 모두 삭제
    // 모방마다 색깔을 다르게, 네온 효과가 나도록

    copiedNeonLines.move(movement, width, height);
    copiedNeonLines.draw(ctx, width, height);
}

export default AnimationT;