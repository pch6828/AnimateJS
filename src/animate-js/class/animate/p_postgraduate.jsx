class GraduationCap {
    constructor(xRatio, yRatio) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.widthRatio = 0.2;
        this.heightRatio = 0.1;
    }

    move() {

    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = 'rgba(30,44,74,1)';
        ctx.translate(width * this.xRatio, height * this.yRatio)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-width * this.widthRatio / 3, -width * this.heightRatio / 6);
        ctx.lineTo(-width * this.widthRatio / 3.5, -width * this.heightRatio / 1.5);
        ctx.lineTo(0, -width * this.heightRatio / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(8,19,43,1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * this.widthRatio / 3, -width * this.heightRatio / 6);
        ctx.lineTo(width * this.widthRatio / 3.5, -width * this.heightRatio / 1.5);
        ctx.lineTo(0, -width * this.heightRatio / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(35,56,114,1)';
        ctx.beginPath();
        ctx.moveTo(0, -width * this.heightRatio / 2);
        ctx.lineTo(width * this.widthRatio / 3.5 * 2, -width * this.heightRatio / 4 * 3);
        ctx.lineTo(0, -width * this.heightRatio);
        ctx.lineTo(-width * this.widthRatio / 3.5 * 2, -width * this.heightRatio / 4 * 3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
};

var graudationCap = null;

function AnimationP(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 6;

    ctx.font = fontSize + 'px Times New Roman';
    const textwidth = ctx.measureText('Postgraduate').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText('Postgraduate', centerx - textwidth / 2, centery + fontSize * 1.5);

    if (graudationCap === null) {
        graudationCap = new GraduationCap(0.5, 0.65);
    }

    graudationCap.draw(ctx, width, height);
    // 학사모를 잡아 던질 수 있으며
    // 한번 던진 학사모는 글씨 뒤로 떨어지도록
    // 떨어진 뒤에는 폭죽이 랜덤한 개수로 터지도록
    // 터지고 나서 학사모가 다시 글씨 위로 리스폰
}

export default AnimationP