class WalkingLetter {
    static maxAngle = 20;
    constructor() {
        this.headSizeRatio = 0.08;
        this.upperLegLengthRatio = 0.15;
        this.lowerLegLengthRatio = 0.05;
        this.leftLeg = { hipAngle: 0, kneeAngle: 0, ankleAngle: 0 };
        this.rightLeg = { hipAngle: 0, kneeAngle: 0, ankleAngle: 0 };
        this.dAngle = 0.5;
        this.scale = Math.random() * 0.3 + 0.7;

        this.direction = (Math.random() < 0.5 ? 1 : -1);
        this.dxRatio = (Math.random() * 0.5 + 0.5) * 0.0015;

        this.pos = {
            xRatio: this.direction === 1 ? -0.1 : 1.1,
            yRatio: Math.random() * 0.6 + 0.2
        };
    }

    move(movement, width, height) {
        this.leftLeg.hipAngle += this.dAngle;
        this.rightLeg.hipAngle = -this.leftLeg.hipAngle;

        if (Math.abs(this.leftLeg.hipAngle) >= WalkingLetter.maxAngle) {
            this.dAngle = -this.dAngle;
        }

        this.leftLeg.kneeAngle = Math.abs(this.leftLeg.hipAngle) * 1.5;
        this.rightLeg.kneeAngle = Math.abs(this.rightLeg.hipAngle) * 1.5;

        this.leftLeg.ankleAngle = -(this.leftLeg.hipAngle + this.leftLeg.kneeAngle) * 0.3;
        this.rightLeg.ankleAngle = -(this.rightLeg.hipAngle + this.rightLeg.kneeAngle) * 0.3;

        this.pos.xRatio += this.direction * this.dxRatio;
    }

    drawLeg(ctx, width, height, leg, shadow) {
        ctx.save();
        if (shadow) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = "black";
        }
        ctx.rotate(leg.hipAngle * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height * this.upperLegLengthRatio);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        ctx.translate(0, height * this.upperLegLengthRatio);
        ctx.rotate(leg.kneeAngle * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height * this.lowerLegLengthRatio);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        ctx.translate(0, height * this.lowerLegLengthRatio);
        ctx.rotate(leg.ankleAngle * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(height * this.lowerLegLengthRatio * 0.6, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
        ctx.restore();
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.pos.xRatio * width, this.pos.yRatio * height);
        ctx.scale(this.direction * this.scale, this.scale);
        ctx.fillStyle = '#F5F6EB';
        ctx.strokeStyle = '#F5F6EB';
        ctx.lineWidth = height * 0.02;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        this.drawLeg(ctx, width, height, this.leftLeg, true);
        this.drawLeg(ctx, width, height, this.leftLeg, false);
        this.drawLeg(ctx, width, height, this.rightLeg, true);
        this.drawLeg(ctx, width, height, this.rightLeg, false);

        ctx.shadowBlur = 20;
        ctx.shadowColor = "black";
        ctx.beginPath();
        ctx.arc(0, 0, this.headSizeRatio * height, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

class Walkers {
    static maxTimestamp = 300;
    static maxWalker = 10;
    constructor() {
        this.crowd = [];
        this.nextSpawn = 0;
    }

    move(movement, width, height) {
        this.nextSpawn--;
        if (this.nextSpawn < 0 && this.crowd.length < Walkers.maxWalker) {
            this.crowd.push(new WalkingLetter());
            this.crowd.sort((a, b) => {
                return a.pos.yRatio === b.pos.yRatio ? 0 : (a.pos.yRatio > b.pos.yRatio ? 1 : -1);
            })
            this.nextSpawn = Math.random() * Walkers.maxTimestamp;
        }

        this.crowd.forEach((walker) => {
            walker.move(movement, width, height);
        });

        console.log(this.crowd);
        this.crowd = this.crowd.filter((walker) => {
            return walker.pos.xRatio >= -0.2 && walker.pos.xRatio <= 1.2;
        });

        console.log(this.crowd);
    }

    draw(ctx, width, height) {
        this.crowd.forEach((walker) => {
            walker.draw(ctx, width, height);
        })
    }

}

var walkers = null;

export function AnimationR(ctx, width, height, movement) {
    // 좌우에서 걸어다니는 글자가 일정 간격으로 나옴 (원형 몸통과 다리 두개, 몸통에 글자 적혀있도록)
    // 다리 길이, 속도 등은 랜덤
    // 글자를 마우스로 잡을 수 있고, 이를 가지고 움직이다가 떨어트릴 수 있음

    if (walkers === null) {
        walkers = new Walkers();
    }

    walkers.move(movement, width, height);
    walkers.draw(ctx, width, height);
}

export function CleanR() {
    walkers = null;
}