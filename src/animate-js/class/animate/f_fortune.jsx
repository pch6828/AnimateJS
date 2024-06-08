class FortunePaper {
    constructor(text, widthRatio, fontRatio) {
        this.message = text;
        this.paperWidthRatio = widthRatio;
        this.paperHeightRatio = 1 / 20;
        this.prevIsDown = false;
        this.selectedPos = null;
        this.fontRatio = fontRatio;
        this.isOut = false;
        this.falling = false;
        this.isDropped = false;
        this.rotate = (Math.random() + 0.01) / 40 * Math.PI;
        this.pos = { x: 0, y: 0 };
        this.leftDxRatio = -(Math.random() + 0.01) / 10;
        this.rightDxRatio = (Math.random() + 0.01) / 10;
        this.dyRatio = 0;
        this.ddyRatio = (Math.random() + 0.01) / 100;
    }

    move(movement, width, height, ctx) {
        const baseX = width / 2;
        const baseY = height / 2;
        const paperWidth = -width * this.paperWidthRatio;
        const paperHeight = -width * this.paperHeightRatio;
        const angle = Math.PI / 6 - Math.PI / 3;
        const area = new Path2D();
        const fontSize = width * this.fontRatio;
        ctx.font = fontSize + 'px Times New Roman';
        const textWidth = -(ctx.measureText(this.message).width + fontSize);

        const isOut = -(paperWidth - textWidth) > width / 10;
        if (isOut) {
            this.isOut = isOut;
        }

        const areaBottomCenter = {
            x: baseX + Math.cos(angle) * (width / 40 + (this.isOut ? paperWidth - textWidth : Math.min(0, paperWidth - textWidth))),
            y: baseY + Math.sin(angle) * (width / 40 + (this.isOut ? paperWidth - textWidth : Math.min(0, paperWidth - textWidth)))
        };
        const areaTopCenter = {
            x: baseX + Math.cos(angle) * (width / 40 + paperWidth),
            y: baseY + Math.sin(angle) * (width / 40 + paperWidth)
        };

        area.moveTo(
            areaBottomCenter.x + paperHeight / 2 * Math.cos(angle - Math.PI / 2),
            areaBottomCenter.y + paperHeight / 2 * Math.sin(angle - Math.PI / 2)
        );
        area.lineTo(
            areaTopCenter.x + paperHeight / 2 * Math.cos(angle - Math.PI / 2),
            areaTopCenter.y + paperHeight / 2 * Math.sin(angle - Math.PI / 2)
        );
        area.lineTo(
            areaTopCenter.x - paperHeight / 2 * Math.cos(angle - Math.PI / 2),
            areaTopCenter.y - paperHeight / 2 * Math.sin(angle - Math.PI / 2)
        );
        area.lineTo(
            areaBottomCenter.x - paperHeight / 2 * Math.cos(angle - Math.PI / 2),
            areaBottomCenter.y - paperHeight / 2 * Math.sin(angle - Math.PI / 2)
        );
        area.closePath();

        if (movement.isDown) {
            if (!this.prevIsDown &&
                ctx.isPointInPath(area, movement.mousePoint.x, movement.mousePoint.y)) {
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
            if (this.selectedPos) {
                const dx = movement.mousePoint.x - this.selectedPos.x;
                const dy = movement.mousePoint.y - this.selectedPos.y;

                this.paperWidthRatio -= (dx * Math.cos(angle) + dy * Math.sin(angle)) / width;
                this.paperWidthRatio = Math.max(0.05, this.paperWidthRatio);
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
        } else {
            this.selectedPos = null;
            if (this.isOut) {
                this.falling = true;
            }
        }

        if (this.falling) {
            this.pos.y += this.dyRatio * height / 10;
            this.dyRatio += this.ddyRatio;
        }

        this.prevIsDown = movement.isDown;
        if (this.pos.y + areaBottomCenter.y > height * 1.1) {
            this.isDropped = true;
        }
        return isOut;
    }

    draw(ctx, width, height) {
        const paperWidth = -width * this.paperWidthRatio;
        const paperHeight = -width * this.paperHeightRatio;
        const fontSize = width * this.fontRatio;
        ctx.font = fontSize + 'px Times New Roman';
        const textWidth = -(ctx.measureText(this.message).width + fontSize);

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.rotate(-Math.PI / 6);
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(Math.PI / 6);
        ctx.rotate(-Math.PI / 3);
        ctx.fillStyle = "rgba(255,255,255,1)";
        if (this.isOut) {
            ctx.fillRect(width / 40 + paperWidth - textWidth, width / 40, textWidth, paperHeight);
        } else {
            ctx.fillRect(width / 40 + Math.min(0, paperWidth - textWidth), width / 40, Math.max(paperWidth, textWidth), paperHeight);
        }
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = "rgba(0,0,0,1)"
        ctx.fillText(this.message, width / 40 + Math.min(0, paperWidth - textWidth) + fontSize / 2 + Math.max(paperWidth, textWidth), width / 40 - fontSize * 2 / 3);
        ctx.restore();
    }
};

class FortuneCookie {
    constructor(text) {
        this.paper = new FortunePaper(text, 0.05, 0.03);
        this.falling = false;
        this.leftAngle = 0;
        this.rightAngle = 0;
        this.leftRotate = (Math.random() + 0.01) / 30 * Math.PI;
        this.rightRotate = -(Math.random() + 0.01) / 30 * Math.PI;
        this.leftPos = { x: 0, y: 0 };
        this.rightPos = { x: 0, y: 0 };
        this.leftDxRatio = -(Math.random() + 0.01) / 10;
        this.rightDxRatio = (Math.random() + 0.01) / 10;
        this.dyRatio = 0;
        this.ddyRatio = (Math.random() + 0.01) / 100;
        this.isDropped = false;
    }

    move(movement, width, height, ctx) {
        const paperOut = this.paper.move(movement, width, height, ctx);
        const cookieSize = width / 10;

        if (paperOut) {
            this.falling = paperOut;
        }

        if (this.falling) {
            this.leftAngle += this.leftRotate;
            this.rightAngle += this.rightRotate;
            this.leftPos.x += this.leftDxRatio * width / 10;
            this.rightPos.x += this.rightDxRatio * width / 10;
            this.leftPos.y += this.dyRatio * height / 10;
            this.rightPos.y += this.dyRatio * height / 10;
            this.dyRatio += this.ddyRatio;
        }

        if ((this.leftPos.y > height + cookieSize || this.leftPos.x < -cookieSize) &&
            (this.rightPos.y > height + cookieSize || this.rightPos.x > width + cookieSize) &&
            this.paper.isDropped)
            this.isDropped = true;
    }

    draw(ctx, width, height) {
        const centerx = width / 2;
        const centery = height / 2;
        const cookieSize = width / 10;

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = width / 30;

        ctx.save();
        ctx.translate(centerx, centery);
        ctx.rotate(Math.PI / 6);

        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.translate(this.leftPos.x, this.leftPos.y);
        ctx.rotate(Math.PI / 2);
        ctx.rotate(this.leftAngle);
        ctx.fillStyle = "rgba(255,170,77,1)";
        ctx.strokeStyle = "rgba(255,170,77,1)";

        ctx.beginPath();
        ctx.moveTo(0, -cookieSize);
        ctx.lineTo(-cookieSize / 2 * Math.sqrt(3), -cookieSize / 2);
        ctx.arcTo(-cookieSize * Math.sqrt(3), cookieSize, 0, cookieSize, cookieSize);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        ctx.restore();

        this.paper.draw(ctx, width, height);

        ctx.save();
        ctx.rotate(-Math.PI / 6);
        ctx.translate(this.rightPos.x, this.rightPos.y);
        ctx.rotate(Math.PI / 6);
        ctx.rotate(this.rightAngle);
        ctx.fillStyle = "rgba(252,156,36,1)";
        ctx.strokeStyle = "rgba(252,156,36,1)";

        ctx.beginPath();
        ctx.moveTo(0, -cookieSize);
        ctx.lineTo(cookieSize / 2 * Math.sqrt(3), -cookieSize / 2);
        ctx.arcTo(cookieSize * Math.sqrt(3), cookieSize, 0, cookieSize, cookieSize);
        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = "rgba(136,61,36,1)";
        ctx.lineWidth = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(cookieSize / 2 * Math.sqrt(3), -cookieSize / 2);
        ctx.arcTo(cookieSize * Math.sqrt(3), cookieSize, 0, cookieSize, cookieSize);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();

        ctx.restore();
    }
};

const message = [
    'Look how far you\'ve come.',
    'Be bold, be courageous, be your best.',
    'MIND MATTER',
    'Seek adventure.',
    'Progress, not perfection.',
    'Whatever you can do, you must do.'
];

var fortuneCookie = null;

function AnimationF(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const cookieSize = width / 10;
    const fontSize = height / 8;

    const letters = ['F', 'o', 'r', 't', 'u', 'n', 'e'];

    function get_random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.save();
    ctx.translate(centerx, centery);
    for (let i = 0; i < letters.length; i++) {
        ctx.save();
        ctx.rotate(Math.PI / 9 * (i - 3));
        ctx.translate(0, -cookieSize * 1.4);

        ctx.font = fontSize + 'px Times New Roman';
        const letter = letters[i];
        const letterWidth = ctx.measureText(letter).width;
        ctx.fillText(letter, -letterWidth / 2, 0);

        ctx.restore();
    }
    ctx.restore();

    if (!fortuneCookie)
        fortuneCookie = new FortuneCookie(get_random(message));

    fortuneCookie.draw(ctx, width, height);
    fortuneCookie.move(movement, width, height, ctx);

    if (fortuneCookie.isDropped)
        fortuneCookie = null;
}

export default AnimationF;