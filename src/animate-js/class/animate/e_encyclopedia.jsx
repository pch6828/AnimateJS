class WordBalloon {
    static maxSizeFactor = 50;
    static maxTimestamp = 1000000;

    constructor(direction) {
        this.direction = direction;
        this.childs = [];
        this.timestamp = 0;
        this.dt = 1;
    }
    move(movement, width, height, ctx) {
        this.timestamp += this.dt;

        if (this.timestamp === WordBalloon.maxTimestamp) {
            this.dt = -1;
        } else if (this.timestamp === 0) {
            this.dt = 0;
        }
    }

    draw(ctx, x, y, balloonWidth, tailLength) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillRect(0, 0, balloonWidth * this.direction, -tailLength);
        ctx.restore();
    }

    getTailLength(tailLengthUnit) {
        return tailLengthUnit * Math.min(this.timestamp, WordBalloon.maxSizeFactor);
    }
};

class Book {
    constructor(xRatio, yRatio) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.pageWidthRatio = 1 / 10;
        this.pageHeightRatio = 1 / 8;
        this.balloons = [];
        this.prevIsDown = false;
        this.maxBalloon = 5;
    }

    move(movement, width, height, ctx) {
        const bottomCenterX = width * this.xRatio;
        const bottomCenterY = height * this.yRatio;
        const pageWidth = width * this.pageWidthRatio;
        const pageHeight = width * this.pageHeightRatio;

        const area = new Path2D();
        area.rect(bottomCenterX - pageWidth, bottomCenterY, pageWidth * 2, -pageHeight);

        if (!this.prevIsDown && movement.isDown &&
            ctx.isPointInPath(area, movement.mousePoint.x, movement.mousePoint.y)) {
            if (this.balloons.length < this.maxBalloon) {
                const direction = this.balloons.length === 0
                    ? -1
                    : -(this.balloons[this.balloons.length - 1].direction);
                console.log(direction);
                this.balloons.push(new WordBalloon(direction));
            }
        }
        this.prevIsDown = movement.isDown;

        this.balloons.forEach(balloon => {
            balloon.move(movement, width, height, ctx);
        });
    }

    draw(ctx, width, height) {
        const pageWidth = width * this.pageWidthRatio;
        const pageHeight = width * this.pageHeightRatio;

        ctx.save();
        ctx.translate(width * this.xRatio, height * this.yRatio);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(165,42,42,1)';

        ctx.fillRect(-pageWidth, 0, pageWidth * 2, -pageHeight);

        ctx.fillStyle = 'rgba(255,255,240,1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arcTo(0, -pageHeight / 8, -pageHeight / 8, -pageHeight / 8, pageHeight / 8);
        ctx.lineTo(-(pageWidth - pageHeight / 8), -pageHeight / 8);
        ctx.lineTo(-(pageWidth - pageHeight / 8), -pageHeight / 8 - pageHeight);
        ctx.lineTo(-pageHeight / 8, -pageHeight / 8 - pageHeight);
        ctx.arcTo(0, - pageHeight / 8 - pageHeight, 0, - pageHeight, pageHeight / 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(239,236,224,1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arcTo(0, -pageHeight / 8, pageHeight / 8, -pageHeight / 8, pageHeight / 8);
        ctx.lineTo((pageWidth - pageHeight / 8), -pageHeight / 8);
        ctx.lineTo((pageWidth - pageHeight / 8), -pageHeight / 8 - pageHeight);
        ctx.lineTo(pageHeight / 8, -pageHeight / 8 - pageHeight);
        ctx.arcTo(0, -pageHeight / 8 - pageHeight, 0, -pageHeight, pageHeight / 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(132,27,45,1)';
        ctx.beginPath();
        ctx.moveTo(pageHeight / 3, -pageHeight / 8 - pageHeight);
        ctx.lineTo(pageHeight / 3 + pageHeight / 16, -pageHeight / 8 - pageHeight);
        ctx.lineTo(pageHeight / 3 + pageHeight / 16, -pageHeight / 8 - pageHeight / 2);
        ctx.lineTo(pageHeight / 3 + pageHeight / 32, -pageHeight / 8 - pageHeight / 2 - pageHeight / 32);
        ctx.lineTo(pageHeight / 3, -pageHeight / 8 - pageHeight / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'black'
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = pageHeight / 32;

        ctx.beginPath();
        ctx.moveTo(-(pageWidth - pageHeight / 8) + pageHeight / 8, -pageHeight);
        ctx.lineTo(-pageHeight / 8, - pageHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-(pageWidth - pageHeight / 8) + pageHeight / 8, -pageHeight + pageHeight / 8);
        ctx.lineTo(-pageHeight / 8, -pageHeight + pageHeight / 8);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-(pageWidth - pageHeight / 8) + pageHeight / 8, -pageHeight + pageHeight / 8 * 2);
        ctx.lineTo(-pageHeight / 8, - pageHeight + pageHeight / 8 * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-(pageWidth - pageHeight / 8) + pageHeight / 8, -pageHeight + pageHeight / 8 * 3);
        ctx.lineTo(-pageHeight / 8, -pageHeight + pageHeight / 8 * 3);
        ctx.closePath();
        ctx.stroke();

        var leftTailLength = 0;
        var rightTailLength = 0;

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            const x = i * pageWidth / 10 * balloon.direction;
            if (balloon.direction === -1) {
                leftTailLength += balloon.getTailLength(pageHeight / 250);
            } else {
                rightTailLength += balloon.getTailLength(pageHeight / 200);
            }
            this.balloons[i].draw(ctx, x, -pageHeight * 1.2,
                50, (balloon.direction === -1 ? leftTailLength : rightTailLength));
        }

        ctx.restore();
    }

};

var book = null;

function AnimationE(ctx, width, height, movement) {

    if (book === null) {
        book = new Book(0.5, 0.85);
    }

    book.move(movement, width, height, ctx);
    book.draw(ctx, width, height);
}

export default AnimationE;