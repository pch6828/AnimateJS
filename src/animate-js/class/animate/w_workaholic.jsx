class FallingObject {
    constructor() {
        this.posRatio = { xRatio: Math.random(), yRatio: 0 };
        this.dyRatio = 0;
        this.ddyRatio = Math.random() * 0.0003;
        this.scale = Math.random() * 0.2 + 0.8;
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.bottomObj = null;
    }

    move(movement, width, height) {
        if (this.bottomObj === null) {
            this.posRatio.yRatio += this.dyRatio;
            this.dyRatio += this.ddyRatio;
        }
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
        this.widthRatio = ColorBox.widthRatio;
        this.heightRatio = ColorBox.heightRatio;
    }

    draw(ctx, width, height) {
        const boxWidth = width * this.widthRatio;
        const boxHeight = width * this.heightRatio;
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
        this.widthRatio = ColorFile.widthRatio;
        this.heightRatio = (Math.random() * 0.2 + 0.8) * 0.04;
    }

    draw(ctx, width, height) {
        const fileWidth = width * this.widthRatio;
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

        this.widthRatio = PaperPile.widthRatio;
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
        const paperPileWidth = width * this.widthRatio;
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
    constructor(word) {
        this.word = word;
        this.point = { x: 0, y: 0 };
        this.stack = [];
        this.angle = 0;
    }

    move(movement, width, height) {
        this.angle += (movement.mousePoint.x - this.point.x) / width * Math.PI;
        this.angle *= 0.8;
        this.point.x = movement.mousePoint.x;
        this.point.y = movement.mousePoint.y;
    }

    stackObj(ctx, objDropper, width, height) {
        const fontSize = height / 15;
        ctx.font = fontSize + 'px Monoton';

        const wordWidth = ctx.measureText(this.word).width;
        const wordX = this.point.x;
        const wordY = this.point.y;
        const stackWidthRatio = 0.8;

        objDropper.objects.forEach(obj => {
            const objX = obj.posRatio.xRatio * width;
            const objY = obj.posRatio.yRatio * height;
            const objWidth = obj.widthRatio * width * obj.scale;
            const objHeight = obj.heightRatio * width * obj.scale;

            if (obj.bottomObj === null
                && objX >= wordX - wordWidth * stackWidthRatio / 2 && objX <= wordX + wordWidth * stackWidthRatio / 2 &&
                objY + objHeight / 2 >= wordY - fontSize / 2 && objY + objHeight / 2 <= wordY) {
                obj.bottomObj = this;
                obj.posRatio.xRatio = 0;
                obj.posRatio.yRatio = 0;
                this.stack.push({ obj: obj, dxRatio: (objX - wordX) / width, dyRatio: (objY - wordY) / height });
            }
        });
    }

    draw(ctx, width, height) {
        const fontSize = height / 15;
        ctx.save();
        ctx.translate(this.point.x, this.point.y);
        console.log(this.angle);
        ctx.rotate(this.angle);
        ctx.font = fontSize + 'px Monoton';
        ctx.fillStyle = 'white';
        const textWidth = ctx.measureText(this.word).width;

        ctx.fillText(this.word, - textWidth / 2, fontSize / 2);

        this.stack.forEach(element => {
            ctx.save();
            ctx.translate(element.dxRatio * width, element.dyRatio * height);
            element.obj.draw(ctx, width, height);
            ctx.restore();
        });
        ctx.restore();
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
            if (obj.bottomObj === null)
                obj.draw(ctx, width, height);
        });
    }
}
const mouseChasingWord = new MouseChasingWord('Workaholic');
const objDropper = new ObjectDropper();

function AnimationW(ctx, width, height, movement) {

    // 일이 하늘에서 천천히 떨어지고 마우스 위에 Workaholic 글자가 따라다니도록
    // 마우스가 움직임에 따라 글자가 기울어지고, 이에 맞춰서 쌓인 오브젝트가 이리 저리 흔들리다가 떨어지도록
    mouseChasingWord.move(movement, width, height);
    objDropper.move(movement, width, height);

    mouseChasingWord.stackObj(ctx, objDropper, width, height);

    mouseChasingWord.draw(ctx, width, height);
    objDropper.draw(ctx, width, height);
}

export default AnimationW;