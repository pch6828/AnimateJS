class WordBalloon {
    static maxSizeFactor = 50;
    static maxTimestamp = 200;

    constructor(direction, word) {
        this.direction = direction;
        this.childs = [];
        this.maxChild = word.length === 1 ? 0 : word.length;
        this.timestamp = 0;
        this.dt = 1;
        this.prevIsDown = false;
        this.word = word;
        console.log(word);
    }
    move(movement, x, y, balloonWidth, balloonHeight, ctx) {
        this.timestamp += this.dt;
        this.timestamp = Math.min(this.timestamp, WordBalloon.maxTimestamp)

        if (this.timestamp >= WordBalloon.maxTimestamp) {
            var noChild = true;
            for (let i = 0; i < this.childs.length; i++) {
                const balloon = this.childs[i];
                if (balloon.dt !== 0) {
                    noChild = false;
                }
            }
            if (noChild)
                this.dt = -1;
        } else if (this.timestamp <= 0) {
            this.dt = 0;
        }

        const area = new Path2D();
        area.rect(x, y, balloonWidth * this.direction, -balloonHeight);

        if (!this.prevIsDown && movement.isDown &&
            ctx.isPointInPath(area, movement.mousePoint.x, movement.mousePoint.y)) {
            this.dt = 1;
            if (this.childs.length < this.maxChild) {
                this.childs.push(new WordBalloon(this.direction, ' '));
            } else {
                for (let i = 0; i < this.maxChild; i++) {
                    const balloon = this.childs[i];
                    if (balloon.dt !== 1) {
                        balloon.dt = 1;
                        break;
                    }
                }
            }
        }

        this.prevIsDown = movement.isDown;

        for (let i = 0; i < this.childs.length; i++) {
            const balloon = this.childs[i];
            balloon.move(movement, 0, 0, 0, 0, ctx);
        }
    }

    draw(ctx, x, y, balloonWidth, balloonHeight, tailLength, shadowLength) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255,255,240,1)';
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -tailLength);
        ctx.lineTo(this.direction * balloonWidth / 10, -tailLength);
        ctx.closePath();
        ctx.fill();

        ctx.translate(0, -tailLength);
        ctx.beginPath();
        ctx.roundRect(0, 1, balloonWidth * this.direction, -balloonHeight,
            [0, balloonHeight / 4, balloonHeight / 4, balloonHeight / 4]);
        ctx.closePath();
        ctx.fill();

        var childTailLength = 0;
        for (let i = this.childs.length - 1; i >= 0; i--) {
            const balloon = this.childs[i];

            const childWidth = balloon.getBalloonWidth(balloonWidth / (100 + i * 5));
            const childHeight = balloon.getBalloonHeight(balloonHeight / (100 + i * 5));
            const childX = (shadowLength + i * balloonWidth / 8) * balloon.direction;

            childTailLength += balloon.getTailLength(balloonHeight / 500);

            balloon.draw(ctx, childX, -balloonHeight * 1.1, childWidth, childHeight, childTailLength);

            childTailLength += childHeight;
        }

        ctx.restore();
    }

    getTailLength(tailLengthUnit) {
        return tailLengthUnit * Math.min(this.timestamp, WordBalloon.maxSizeFactor);
    }

    getBalloonHeight(balloonHeightUnit) {
        return balloonHeightUnit * Math.min(this.timestamp, WordBalloon.maxSizeFactor);
    }

    getBalloonWidth(balloonWidthUnit) {
        return balloonWidthUnit * Math.min(this.timestamp, WordBalloon.maxSizeFactor);
    }
};

class Book {
    static wordList = ["cl", "ope", "cy", "dia", "en"];
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
                this.balloons.push(new WordBalloon(direction, Book.wordList[this.balloons.length]));
            } else {
                for (let i = 0; i < this.maxBalloon; i++) {
                    const balloon = this.balloons[i];
                    if (balloon.dt !== 1) {
                        balloon.dt = 1;
                        break;
                    }
                }
            }
        }
        this.prevIsDown = movement.isDown;

        var leftTailLength = 0;
        var rightTailLength = 0;

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];

            const balloonWidth = balloon.getBalloonWidth(pageWidth / (60 - i * 5));
            const balloonHeight = balloon.getBalloonHeight(pageHeight / (100 - i * 5));

            if (balloon.direction === -1) {
                leftTailLength += balloon.getTailLength(pageHeight / 800);
            } else {
                rightTailLength += balloon.getTailLength(pageHeight / 250);
            }

            const x = bottomCenterX + i * pageWidth / 8 * balloon.direction;
            const y = bottomCenterY - pageHeight * 1.2 - (balloon.direction === -1 ? leftTailLength : rightTailLength);

            balloon.move(movement, x, y, balloonWidth, balloonHeight, ctx);

            if (balloon.direction === -1) {
                leftTailLength += balloonHeight;
            } else {
                rightTailLength += balloonHeight;
            }
        }
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
            const x = i * pageWidth / 8 * balloon.direction;
            const balloonWidth = balloon.getBalloonWidth(pageWidth / (60 - i * 5));
            const balloonHeight = balloon.getBalloonHeight(pageHeight / (100 - i * 5));
            const shadowLength = Math.max((i - 2 >= 0 ?
                this.balloons[i - 2].getBalloonWidth(pageWidth / (60 - (i - 2) * 5)) - pageWidth / 8 * 1.5
                : 0), 0);

            if (balloon.direction === -1) {
                leftTailLength += balloon.getTailLength(pageHeight / 800);
            } else {
                rightTailLength += balloon.getTailLength(pageHeight / 250);
            }

            this.balloons[i].draw(ctx, x, -pageHeight * 1.2,
                balloonWidth, balloonHeight,
                (balloon.direction === -1 ? leftTailLength : rightTailLength),
                shadowLength);

            if (balloon.direction === -1) {
                leftTailLength += balloonHeight;
            } else {
                rightTailLength += balloonHeight;
            }
        }

        ctx.restore();
    }

};

var book = null;

function AnimationE(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 8;
    if (book === null) {
        book = new Book(0.5, 0.75);
    }

    book.move(movement, width, height, ctx);
    book.draw(ctx, width, height);

    ctx.fillStyle = 'black';
    ctx.font = fontSize + 'px Georgia';
    const textWidth = ctx.measureText('Encyclopedia').width;
    ctx.fillText('Encyclopedia', centerx - textWidth / 2, centery + fontSize * 3);
}

export default AnimationE;