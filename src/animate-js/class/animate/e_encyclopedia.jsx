class WordBalloon {
    constructor() {
        this.childs = [];
    }
    move(movement, width, height, ctx) {

    }
    draw(ctx, width, height) {

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
            if (this.balloons.length < 5) {
                this.balloons.push(new WordBalloon());
            }
        }
        this.prevIsDown = movement.isDown;
    }

    draw(ctx, width, height) {
        const pageWidth = width * this.pageWidthRatio;
        const pageHeight = width * this.pageHeightRatio;

        ctx.translate(width * this.xRatio, height * this.yRatio);

        ctx.save();
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

        ctx.restore();

        for (let i = 0; i < this.balloons.length; i++) {
            this.balloons[i].draw(ctx, width, height);
        }
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