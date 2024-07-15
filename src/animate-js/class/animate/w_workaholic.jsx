class FallingObject {
    constructor() {
        this.posRatio = { xRatio: Math.random(), yRatio: 0 };
        this.dyRatio = 0;
        this.ddyRatio = Math.random() * 0.0003;
        this.scale = Math.random() * 0.2 + 0.8;
        this.direction = Math.random() > 0.5 ? 1 : -1;
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

class ColorBox extends FallingObject {
    static widthRatio = 0.15;
    static heightRatio = 0.1;
    constructor() {
        super();

        const randomCode = Math.random();
        this.color = randomCode < 0.33 ? '#ED1D24' : (randomCode > 0.66 ? '#F08F00' : '#77DD77');
    }

    draw(ctx, width, height) {
        const boxWidth = width * ColorBox.widthRatio;
        const boxHeight = width * ColorBox.heightRatio;
        const boxFrontWidthRatio = 0.7;
        const boxHandleRatio = 0.3;

        ctx.save();
        ctx.translate(width * this.posRatio.xRatio, height * this.posRatio.yRatio);
        ctx.scale(this.scale * this.direction, this.scale);
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = this.color;
        ctx.fillRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(
            -boxWidth / 2 + boxWidth * boxFrontWidthRatio, -boxHeight / 2,
            boxWidth * (1 - boxFrontWidthRatio), boxHeight
        );

        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = boxHeight / 15;
        ctx.beginPath();
        ctx.moveTo(-boxWidth / 2 + boxWidth * boxFrontWidthRatio / 2 * (1 - boxHandleRatio), -boxHeight / 2 * 0.7);
        ctx.lineTo(-boxWidth / 2 + boxWidth * boxFrontWidthRatio / 2 * (1 + boxHandleRatio), -boxHeight / 2 * 0.7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

    }
}

class ColorFile extends FallingObject {
    static widthRatio = 0.1;
    constructor() {
        super();

        const randomCode = Math.random();

        this.color = randomCode < 0.33 ? '#DEA5A4' : (randomCode > 0.66 ? '#89CFF0' : '#FF8F6C');
        this.heightRatio = (Math.random() * 0.2 + 0.8) * 0.04;
    }

    draw(ctx, width, height) {
        const fileWidth = width * ColorFile.widthRatio;
        const fileHeight = width * this.heightRatio;
        const fileFrontWidthRatio = 0.8;
        const fileLabelHeightRatio = 0.4;

        ctx.save();
        ctx.translate(width * this.posRatio.xRatio, height * this.posRatio.yRatio);
        ctx.scale(this.scale * this.direction, this.scale);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;
        ctx.fillRect(-fileWidth / 2, -fileHeight / 2, fileWidth, fileHeight);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(
            -fileWidth / 2 + fileWidth * fileFrontWidthRatio, -fileHeight / 2,
            fileWidth * (1 - fileFrontWidthRatio), fileHeight
        );

        ctx.fillStyle = 'rgba(255,255,240,1)';
        ctx.fillRect(
            -fileWidth / 2 + fileWidth * 0.3, -fileHeight / 2 * fileLabelHeightRatio,
            fileHeight * fileLabelHeightRatio * 1.5, fileHeight * fileLabelHeightRatio
        )
        ctx.beginPath();
        ctx.arc(-fileWidth / 2 + fileWidth * 0.3 + fileHeight * fileLabelHeightRatio * 2.5, 0, fileHeight * fileLabelHeightRatio / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class PaperPile extends FallingObject {
    static widthRatio = 0.1;
    constructor() {
        super();

        this.heightRatio = (Math.random() * 0.6 + 0.4) * 0.08;

        const markCount = Math.ceil(Math.random() * 5 + 3);
        this.marks = [];

        for (let i = 0; i < markCount; i++) {
            const randomCode = Math.random();
            const dir = randomCode < 0.33 ? -1 : (randomCode > 0.66 ? 1 : 0);

            this.marks[i] = { length: Math.random() * 0.3, pos: Math.random() * 0.8 + 0.1, dir: dir };
        }
    }
    draw(ctx, width, height) {
        const paperPileWidth = width * PaperPile.widthRatio;
        const paperPileHeight = width * this.heightRatio;
        const paperPileFrontWidthRatio = 0.6;

        ctx.save();
        ctx.translate(width * this.posRatio.xRatio, height * this.posRatio.yRatio);
        ctx.scale(this.scale * this.direction, this.scale);
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = 'rgba(255,255,240,1)';
        ctx.fillRect(-paperPileWidth / 2, -paperPileHeight / 2, paperPileWidth, paperPileHeight);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(
            -paperPileWidth / 2 + paperPileWidth * paperPileFrontWidthRatio, -paperPileHeight / 2,
            paperPileWidth * (1 - paperPileFrontWidthRatio), paperPileHeight
        );

        this.marks.forEach(mark => {
            ctx.strokeStyle = '#7F7F7F';
            ctx.lineWidth = height * 0.003;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'bevel';

            ctx.beginPath();
            if (mark.dir === 0) {
                ctx.moveTo(paperPileWidth * (paperPileFrontWidthRatio - mark.length - 0.5), (mark.pos - 0.5) * paperPileHeight);
                ctx.lineTo(paperPileWidth * (paperPileFrontWidthRatio + mark.length - 0.5), (mark.pos - 0.5) * paperPileHeight);
            } else {
                ctx.moveTo(mark.dir * paperPileWidth / 2, (mark.pos - 0.5) * paperPileHeight);
                ctx.lineTo(mark.dir * (paperPileWidth / 2 - paperPileWidth * mark.length), (mark.pos - 0.5) * paperPileHeight);
            }
            ctx.closePath();
            ctx.stroke();
        });
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

class ObjectDropper {
    static maxTimestamp = 50;
    constructor() {
        this.objects = [];
        this.nextSpawn = 0;
    }

    move(movement, width, height) {
        this.nextSpawn--;
        if (this.nextSpawn <= 0) {
            const randomCode = Math.random();

            this.nextSpawn = Math.ceil(Math.random() * ObjectDropper.maxTimestamp);
            this.objects.push(randomCode < 0.33 ? new ColorBox() : (randomCode > 0.66 ? new ColorFile() : new PaperPile()));
        }

        this.objects.forEach(obj => {
            obj.move(movement, width, height);
        });

        this.objects = this.objects.filter(obj => {
            return obj.posRatio.yRatio < 1.2;
        });
    }

    draw(ctx, width, height) {
        this.objects.forEach(obj => {
            obj.draw(ctx, width, height);
        });
    }
}
const mouseChasingWord = new MouseChasingWord('Workaholic');
const objDropper = new ObjectDropper();

function AnimationW(ctx, width, height, movement) {

    // 일이 하늘에서 천천히 떨어지고 마우스 위에 Workaholic 글자가 따라다니도록
    // 마우스가 움직임에 따라 글자 위에 쌓인 일들이 흔들리고, 일정 이상이 될 경우 다시 떨어지도록
    mouseChasingWord.move(movement, width, height);
    mouseChasingWord.draw(ctx, width, height);

    objDropper.move(movement, width, height);
    objDropper.draw(ctx, width, height);
}

export default AnimationW;