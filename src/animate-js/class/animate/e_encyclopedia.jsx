class Book {
    constructor(xRatio, yRatio) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.pageWidthRatio = 1 / 10;
        this.pageHeightRatio = 1 / 8;
    }

    draw(ctx, width, height) {
        const pageWidth = width * this.pageWidthRatio;
        const pageHeight = width * this.pageHeightRatio;
        const bottomCenter = {
            x: width * this.xRatio,
            y: height * this.yRatio
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(165,42,42,1)';

        ctx.fillRect(bottomCenter.x - pageWidth, bottomCenter.y, pageWidth * 2, -pageHeight);

        ctx.fillStyle = 'rgba(255,255,240,1)';
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x, bottomCenter.y);
        ctx.arcTo(bottomCenter.x, bottomCenter.y - pageHeight / 8, bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight / 8, pageHeight / 8);
        ctx.lineTo(bottomCenter.x - (pageWidth - pageHeight / 8), bottomCenter.y - pageHeight / 8);
        ctx.lineTo(bottomCenter.x - (pageWidth - pageHeight / 8), bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.lineTo(bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.arcTo(bottomCenter.x, bottomCenter.y - pageHeight / 8 - pageHeight, bottomCenter.x, bottomCenter.y - pageHeight, pageHeight / 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(239,236,224,1)';
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x, bottomCenter.y);
        ctx.arcTo(bottomCenter.x, bottomCenter.y - pageHeight / 8, bottomCenter.x + pageHeight / 8, bottomCenter.y - pageHeight / 8, pageHeight / 8);
        ctx.lineTo(bottomCenter.x + (pageWidth - pageHeight / 8), bottomCenter.y - pageHeight / 8);
        ctx.lineTo(bottomCenter.x + (pageWidth - pageHeight / 8), bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.lineTo(bottomCenter.x + pageHeight / 8, bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.arcTo(bottomCenter.x, bottomCenter.y - pageHeight / 8 - pageHeight, bottomCenter.x, bottomCenter.y - pageHeight, pageHeight / 8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(132,27,45,1)';
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x + pageHeight / 3, bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.lineTo(bottomCenter.x + pageHeight / 3 + pageHeight / 16, bottomCenter.y - pageHeight / 8 - pageHeight);
        ctx.lineTo(bottomCenter.x + pageHeight / 3 + pageHeight / 16, bottomCenter.y - pageHeight / 8 - pageHeight / 2);
        ctx.lineTo(bottomCenter.x + pageHeight / 3 + pageHeight / 32, bottomCenter.y - pageHeight / 8 - pageHeight / 2 - pageHeight / 32);
        ctx.lineTo(bottomCenter.x + pageHeight / 3, bottomCenter.y - pageHeight / 8 - pageHeight / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'black'
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = pageHeight / 32;

        ctx.beginPath();
        ctx.moveTo(bottomCenter.x - (pageWidth - pageHeight / 8) + pageHeight / 8, bottomCenter.y - pageHeight);
        ctx.lineTo(bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x - (pageWidth - pageHeight / 8) + pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8);
        ctx.lineTo(bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x - (pageWidth - pageHeight / 8) + pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8 * 2);
        ctx.lineTo(bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8 * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bottomCenter.x - (pageWidth - pageHeight / 8) + pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8 * 3);
        ctx.lineTo(bottomCenter.x - pageHeight / 8, bottomCenter.y - pageHeight + pageHeight / 8 * 3);
        ctx.closePath();
        ctx.stroke();
    }

};

var book = null;

function AnimationE(ctx, width, height, movement) {

    if (book === null) {
        book = new Book(0.5, 0.85);
    }

    book.draw(ctx, width, height);
}

export default AnimationE;