class FortunePaper {
    constructor(text, widthRatio, fontRatio) {
        this.message = text;
        this.paperWidthRatio = widthRatio;
        this.paperHeightRatio = 1 / 20;
        this.prevIsDown = false;
        this.selectedPos = null;
        this.fontRatio = fontRatio;
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

        const areaBottomCenter = {
            x: baseX + Math.cos(angle) * (width / 40 + Math.min(0, paperWidth - textWidth)),
            y: baseY + Math.sin(angle) * (width / 40 + Math.min(0, paperWidth - textWidth))
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
        }

        this.prevIsDown = movement.isDown;
    }

    draw(ctx, width, height) {
        const paperWidth = -width * this.paperWidthRatio;
        const paperHeight = -width * this.paperHeightRatio;
        const fontSize = width * this.fontRatio;
        ctx.font = fontSize + 'px Times New Roman';
        const textWidth = -(ctx.measureText(this.message).width + fontSize);

        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.rotate(-Math.PI / 3);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(width / 40 + Math.min(0, paperWidth - textWidth), width / 40, Math.max(paperWidth, textWidth), paperHeight);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = "rgba(0,0,0,1)"
        ctx.fillText(this.message, width / 40 + Math.min(0, paperWidth - textWidth) + fontSize / 2 + Math.max(paperWidth, textWidth), width / 40 - fontSize * 2 / 3);
        ctx.restore();
    }
};

class FortuneCookie {
    constructor(text) {
        this.paper = new FortunePaper(text, 0.05, 0.03);
    }

    move(movement, width, height, ctx) {
        this.paper.move(movement, width, height, ctx);

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
        ctx.rotate(Math.PI / 3);
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
];

var fortuneCookie = null;

function AnimationF(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const cookieSize = width / 10;

    if (!fortuneCookie)
        fortuneCookie = new FortuneCookie(message[1]);

    fortuneCookie.draw(ctx, width, height);
    fortuneCookie.move(movement, width, height, ctx);
}

export default AnimationF;