class CopiedNeonLines {
    static maxCopy = 8;
    static minCopy = 2;
    static colors = [
        { mainColor: '#CC0001', shadowColor: '#AC0001' },
        { mainColor: '#FB940B', shadowColor: '#DB740B' },
        { mainColor: '#FFFF01', shadowColor: '#DFDF01' },
        { mainColor: '#01CC00', shadowColor: '#01AC00' },
        { mainColor: '#03C0C6', shadowColor: '#03A0A6' },
        { mainColor: '#0000FE', shadowColor: '#0000DE' },
        { mainColor: '#762CA7', shadowColor: '#560C87' },
        { mainColor: '#FE98BF', shadowColor: '#DE789F' }
    ]
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
            const color = CopiedNeonLines.colors[i];
            ctx.save();
            ctx.rotate(Math.PI * 2 / this.numCopy * i);
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            this.paths.forEach(path => {
                ctx.strokeStyle = color.shadowColor;
                ctx.lineWidth = width / 20;
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
            this.paths.forEach(path => {
                ctx.strokeStyle = color.mainColor;
                ctx.lineWidth = width / 25;
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
            this.paths.forEach(path => {
                ctx.strokeStyle = 'white';
                ctx.lineWidth = width / 50;
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
    const centerx = width / 2;
    const fontSize = height / 10;

    copiedNeonLines.move(movement, width, height);
    copiedNeonLines.draw(ctx, width, height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(209,211,212,0.7)';
    ctx.font = fontSize + 'px Tilt Neon';
    const textWidth = ctx.measureText('Tracing - ').width;

    ctx.fillText('Tracing - ' + copiedNeonLines.numCopy, centerx - textWidth / 2 - fontSize / 2, fontSize);
}

export default AnimationT;