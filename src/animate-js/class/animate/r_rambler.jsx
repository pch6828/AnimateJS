class WalkingLetter {
    static maxAngle = 30;
    constructor() {
        this.pos = { xRatio: 0.5, yRatio: 0.5 };
        this.headSizeRatio = 0.08;
        this.upperLegLengthRatio = 0.15;
        this.lowerLegLengthRatio = 0.05;
        this.leftLeg = { hipAngle: 0, kneeAngle: 0, ankleAngle: 0 };
        this.rightLeg = { hipAngle: 0, kneeAngle: 0, ankleAngle: 0 };
        this.dAngle = 1;
    }

    move(movement, width, height) {
        this.leftLeg.hipAngle += this.dAngle;
        if (Math.abs(this.leftLeg.hipAngle) >= WalkingLetter.maxAngle) {
            this.dAngle = -this.dAngle;
        }
    }

    drawLeg(ctx, width, height, leg) {
        ctx.save();
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
        ctx.rotate(leg.ankleAngle * Math.PI / 180);
        ctx.translate(0, height * this.lowerLegLengthRatio);
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
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = height * 0.02;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.arc(0, 0, this.headSizeRatio * height, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        this.drawLeg(ctx, width, height, this.leftLeg);
        this.drawLeg(ctx, width, height, this.rightLeg);

        ctx.restore();
    }
}

const walkingLetter = new WalkingLetter();

export function AnimationR(ctx, width, height, movement) {
    // 좌우에서 걸어다니는 글자가 일정 간격으로 나옴 (원형 몸통과 다리 두개, 몸통에 글자 적혀있도록)
    // 다리 길이, 속도 등은 랜덤
    // 글자를 마우스로 잡을 수 있고, 이를 가지고 움직이다가 떨어트릴 수 있음

    walkingLetter.move(movement, width, height);
    walkingLetter.draw(ctx, width, height);
}

export function CleanR() {
}