class FortunePaper {
    constructor(text, xRatio) {
        this.message = text;
        this.xRatio = xRatio;
    }

    move(movement, width, height) {
        const x = width / 2;
        const y = height / 2;
        if (movement.isDown) {

        } else {

        }
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.rotate(-Math.PI / 3);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fillRect(width / 40, width / 40, -width / 4, -width / 20);
        ctx.restore();
    }
};

class FortuneCookie {
    constructor(text) {
        this.message = text;
        this.paper = new FortunePaper(text, 0);
    }

    move(movement, width, height) {
        this.paper.move(movement);
        if (movement.isDown) {

        } else {

        }
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
        fortuneCookie = new FortuneCookie('');

    fortuneCookie.move(movement, width, height);
    fortuneCookie.draw(ctx, width, height);
}

export default AnimationF;