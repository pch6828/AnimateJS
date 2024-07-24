class ClimbingLetters {
    static maxPillar = 5;
    static pillarWidthRatio = 0.15;
    static maxTimestamp = 100;
    static shadowStrength = 5;

    constructor(word) {
        this.letters = [];
        this.pillars = [];
        this.startPoint = {
            xRatio: ClimbingLetters.pillarWidthRatio / 2,
            yRatio: Math.random() * 0.2 + 0.3,
            timestamp: ClimbingLetters.maxTimestamp
        };
        this.endPoint = {
            xRatio: 1 - ClimbingLetters.pillarWidthRatio / 2,
            yRatio: Math.random() * 0.2 + 0.6,
            timestamp: ClimbingLetters.maxTimestamp
        };

        for (const c of word) {
            this.letters.push({
                value: c,
                currentPoint: this.startPoint,
                endPoint: this.endPoint,
                timestamp: 0
            });
        }
        this.prevIsDown = false;
        this.letterMoving = false;
        this.transitioning = false;
    }

    move(movement, width, height) {
        if (this.letterMoving) {

        } else if (this.transitioning) {

        } else {
            if (!this.prevIsDown && movement.isDown &&
                movement.mousePoint.x / width > Math.min(this.startPoint.xRatio, this.endPoint.xRatio) + ClimbingLetters.pillarWidthRatio * 0.8 &&
                movement.mousePoint.x / width < Math.max(this.startPoint.xRatio, this.endPoint.xRatio) - ClimbingLetters.pillarWidthRatio * 0.8) {
                this.pillars.push({
                    xRatio: movement.mousePoint.x / width,
                    yRatio: 1 - movement.mousePoint.y / height,
                    timestamp: 0
                });
            }

            for (let i = 0; i < this.pillars.length - ClimbingLetters.maxPillar; i++) {
                const pillar = this.pillars[i];
                pillar.timestamp--;
            }

            while (this.pillars.length > ClimbingLetters.maxPillar && this.pillars[0].timestamp <= 0) {
                this.pillars.splice(0, 1);
            }


            for (let i = Math.max(0, this.pillars.length - ClimbingLetters.maxPillar); i < this.pillars.length; i++) {
                const pillar = this.pillars[i];
                pillar.timestamp++;
                pillar.timestamp = Math.min(pillar.timestamp, ClimbingLetters.maxTimestamp);
            }

            if (this.pillars.length === ClimbingLetters.maxPillar) {
                const pillars = this.pillars.toSorted((a, b) => {
                    return a.xRatio === b.xRatio ? 0 : (a.xRatio < b.xRatio ? -1 : 1);
                });
                var prevXRatio = this.startPoint.xRatio;
                this.letterMoving = true;

                pillars.forEach((pillar) => {
                    console.log(pillar.xRatio - prevXRatio, ClimbingLetters.pillarWidthRatio);
                    if (pillar.xRatio - prevXRatio > ClimbingLetters.pillarWidthRatio * 1.5 || pillar.timestamp < ClimbingLetters.maxTimestamp) {
                        this.letterMoving = false;
                    }
                    prevXRatio = pillar.xRatio;
                })

                if (this.endPoint.xRatio - prevXRatio > ClimbingLetters.pillarWidthRatio * 1.5) {
                    this.letterMoving = false;
                }
            }
        }
        this.prevIsDown = movement.isDown;
    }

    drawPillar(ctx, width, height, pillar) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#56944F';

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.shadowBlur = 20;
        ctx.shadowColor = "black";
        ctx.lineWidth = 1;
        for (let i = 0; i < ClimbingLetters.shadowStrength; i++)
            ctx.strokeRect((pillar.xRatio - ClimbingLetters.pillarWidthRatio / 2) * width, height,
                ClimbingLetters.pillarWidthRatio * width, -pillar.yRatio * height * pillar.timestamp / ClimbingLetters.maxTimestamp);
        ctx.restore();
        ctx.fillRect((pillar.xRatio - ClimbingLetters.pillarWidthRatio / 2) * width, height,
            ClimbingLetters.pillarWidthRatio * width, -pillar.yRatio * height * pillar.timestamp / ClimbingLetters.maxTimestamp);

        ctx.restore();
    }

    draw(ctx, width, height) {
        const pillars = this.pillars.toSorted((a, b) => {
            return a.yRatio === b.yRatio ? 0 : (a.yRatio < b.yRatio ? 1 : -1);
        });

        pillars.forEach((pillar) => {
            this.drawPillar(ctx, width, height, pillar);
        });

        this.drawPillar(ctx, width, height, this.startPoint);
        this.drawPillar(ctx, width, height, this.endPoint);

        this.letters.forEach((letter) => {

        });
    }
}

var climbingLetters = null;

export function AnimationM(ctx, width, height, movement) {
    const centerx = width / 2;
    const fontSize = height / 10;

    if (!climbingLetters) {
        climbingLetters = new ClimbingLetters('MENTEE');
    }

    climbingLetters.move(movement, width, height);
    climbingLetters.draw(ctx, width, height);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(94,113,106,0.7)';
    ctx.font = fontSize + 'px Major Mono Display';
    const textWidth = ctx.measureText('mentor').width;

    ctx.fillText('mentor', centerx - textWidth / 2, fontSize);
    // MENTEE 글자가 줄줄이 이동하는 이미지
    // 임의의 높이에 바닥을 두고 처음에는 좌측 바닥에 글자들이 있도록
    // 시작할 때 랜덤한 높이로 기둥이 생기도록 (목적지)
    // 클릭할 때마다 해당 위치까지 기둥이 생기도록 (최대 6개, 초과 시 처음 만든 기둥부터 사라짐)
    // 만들어진 기둥들을 통해서 글자들이 목적지로 갈 수 있다면(각 기둥 간의 거리가 일정 수준 이하라면) 이동
    // 이동이 끝나면 기둥이 내려오면서 다음 목적지 생성, 무한 반복
}

export function CleanM() {
    climbingLetters = null;
}