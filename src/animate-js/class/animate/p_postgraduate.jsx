class GraduationCap {
    constructor(xRatio, yRatio) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.defaultXRatio = xRatio;
        this.defaultYRatio = yRatio;
        this.widthRatio = 0.2;
        this.heightRatio = 0.1;
        this.selectedPos = null;
        this.prevIsDown = false;
        this.throw = false;
        this.throwVector = null;
        this.angle = 0;
    }

    move(movement, width, height) {
        const currentPos = { x: width * this.xRatio, y: height * this.yRatio };
        const capWidth = this.widthRatio * width / 3.5 * 2;
        const capHeight = this.heightRatio * width;
        if (movement.isDown) {
            if (!this.prevIsDown &&
                currentPos.x - capWidth / 2 <= movement.mousePoint.x &&
                movement.mousePoint.x <= currentPos.x + capWidth / 2 &&
                currentPos.y - capHeight / 2 <= movement.mousePoint.y &&
                movement.mousePoint.y <= currentPos.y + capHeight / 2) {
                this.throw = false;
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
            if (this.selectedPos) {
                this.throwVector = { dx: 0, dy: 0 };
                this.throwVector.dx = (movement.mousePoint.x - this.selectedPos.x) / width;
                this.throwVector.dy = (movement.mousePoint.y - this.selectedPos.y) / height;

                this.xRatio += (movement.mousePoint.x - this.selectedPos.x) / width;
                this.yRatio += (movement.mousePoint.y - this.selectedPos.y) / height;
                const throwVectorSize = Math.sqrt(this.throwVector.dx * this.throwVector.dx + this.throwVector.dy * this.throwVector.dy);
                this.angle += this.throwVector.dx * (isNaN(throwVectorSize) ? 1 : throwVectorSize) * 100;
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
        } else {
            this.selectedPos = null;
        }

        if (this.prevIsDown && this.throwVector && !this.selectedPos) {
            this.throw = true;
        }
        this.prevIsDown = movement.isDown;

        if (this.throw) {
            this.xRatio += this.throwVector.dx / 10;
            this.yRatio += this.throwVector.dy / 10;
            this.throwVector.dy += 0.0015;
            this.angle *= 1.01;
        }

        if (this.xRatio > 1.1 || this.xRatio < -0.1 || this.yRatio > 1.1 || this.yRatio < -0.1) {
            this.throw = false;
            this.xRatio = this.defaultXRatio;
            this.yRatio = this.defaultYRatio;
            this.throwVector = null;
            this.angle = 0;
        }
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';

        ctx.fillStyle = 'rgba(30,44,74,1)';
        ctx.translate(width * this.xRatio, height * this.yRatio);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-width * this.widthRatio / 3.5, -width * this.heightRatio / 6);
        ctx.lineTo(-width * this.widthRatio / 3, width * this.heightRatio / 3.5);
        ctx.lineTo(0, width * this.heightRatio / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(8,19,43,1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * this.widthRatio / 3.5, -width * this.heightRatio / 6);
        ctx.lineTo(width * this.widthRatio / 3, width * this.heightRatio / 3.5);
        ctx.lineTo(0, width * this.heightRatio / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(35,56,114,1)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width * this.widthRatio / 3.5 * 2, -width * this.heightRatio / 4);
        ctx.lineTo(0, -width * this.heightRatio / 2);
        ctx.lineTo(-width * this.widthRatio / 3.5 * 2, -width * this.heightRatio / 4);
        ctx.closePath();
        ctx.fill();

        ctx.save();
        ctx.fillStyle = 'rgba(254,223,0,1)';
        ctx.strokeStyle = 'rgba(254,223,0,1)';
        ctx.lineWidth = width * this.widthRatio / 100;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.translate(-width * this.widthRatio / 7 * 3, -width * this.heightRatio / 16 * 3);
        ctx.rotate(this.angle * 2.5);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width * this.heightRatio / 4);
        ctx.closePath();
        ctx.stroke();

        ctx.lineWidth = width * this.widthRatio / 50;

        ctx.beginPath();
        ctx.moveTo(0, width * this.heightRatio / 4);
        ctx.lineTo(0, width * this.heightRatio / 3);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
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
    ctx.fillText('Postgraduate', centerx - textwidth / 2, centery + fontSize * 1.2);

    if (graudationCap === null) {
        graudationCap = new GraduationCap(0.5, 0.53);
    }

    graudationCap.move(movement, width, height);
    graudationCap.draw(ctx, width, height);

    // 학사모를 잡아 던질 수 있으며
    // 한번 던진 학사모는 글씨 뒤로 떨어지도록
    // 떨어진 뒤에는 폭죽이 랜덤한 개수로 터지도록
    // 터지고 나서 학사모가 다시 글씨 위로 리스폰
}

export default AnimationP