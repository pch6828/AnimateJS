class Blade {
    constructor(xRatio, yRatio, deg) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.deg = deg;
    }
    move(movement) {

    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = width / 20;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 4);
        ctx.closePath();
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-atop';
        ctx.save();
        ctx.translate(ctx.lineWidth / 4, 0);
        ctx.strokeStyle = 'rgba(116,139,151,1)';
        ctx.lineWidth = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 4);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';

        ctx.translate(0, width / 6 * 1.8);
        ctx.save();
        ctx.rotate(Math.PI / 9);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -width / 7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        ctx.save();
        ctx.rotate(-Math.PI / 9);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -width / 7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        ctx.restore();
    }
};

const blades = [];

function AnimationV(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 6;

    if (blades.length === 0) {
        blades[0] = new Blade(0.375, 0.5, Math.PI * 13 / 12);
        blades[1] = new Blade(0.375, 0.5, Math.PI * 10 / 12);
        blades[2] = new Blade(0.375, 0.5, Math.PI * 8 / 12);
        blades[3] = new Blade(0.625, 0.5, Math.PI * 10 / 12);
        blades[4] = new Blade(0.625, 0.5, Math.PI * 15 / 12);
    }

    // 만능 주머니칼의 이미지, 하단에 versatile을 적어두자.
    // 대충 4, 5가지 칼을 그려놓고, 선택할 때마다 손잡이에 다른 텍스트가 적히도록 하자.

    for (let i = 0; i < blades.length; i++) {
        blades[i].draw(ctx, width, height);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(128,0,32,1)';
    ctx.lineWidth = width / 10;

    ctx.beginPath();
    ctx.moveTo(centerx - width / 8, centery);
    ctx.lineTo(centerx + width / 8, centery);
    ctx.closePath();

    ctx.stroke();



    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.font = 'italic ' + fontSize + 'px Georgia';
    const textwidth = ctx.measureText('Versatile').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText('Versatile', centerx - textwidth / 2, centery + fontSize * 1.7);

}

export default AnimationV;