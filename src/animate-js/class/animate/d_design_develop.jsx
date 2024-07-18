class RevealingPath {
    constructor(type, timestamp) {
        this.type = type;
        this.points = [];
        this.timestamp = timestamp;
    }

    addPoint(x, y) {
        this.points.push({ x: x, y: y });
    }

    isEmpty() {
        return this.points.length === 0;
    }

    removeSinglePoint() {
        this.points.splice(0, 1);
    }

    erase(ctx, width, height) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = width / 15;

        for (let i = 1; i < this.points.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
            ctx.lineTo(this.points[i].x, this.points[i].y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    fill(ctx, width, height, color) {
        ctx.globalCompositeOperation = 'destination-over';
        ctx.lineWidth = width / 15;
        ctx.strokeStyle = color;

        for (let i = 1; i < this.points.length; i++) {
            ctx.beginPath();
            ctx.moveTo(this.points[i - 1].x, this.points[i - 1].y);
            ctx.lineTo(this.points[i].x, this.points[i].y);
            ctx.closePath();
            ctx.stroke();
        }
    }
};

const PATH_MAX_LIFE = 1000;
var paths = [];
var bgTextDict = null;
var prevIsDown = false;
var timestamp = 0;

export function AnimationD(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = '#32363F'
    ctx.fillRect(0, 0, width, height);

    if (!bgTextDict) {
        bgTextDict = new Map([
            ['left', {
                text: 'Design',
                font: 'Brush Script MT',
                size: height / 3,
                color: '#F787B4',
                xRatio: -0.8,
                yRatio: -0.3
            }],
            ['right', {
                text: 'Develop',
                font: 'Century Gothic',
                size: height / 5,
                color: '#0695FE',
                xRatio: -0.2,
                yRatio: 0.4
            }]
        ]);
    }

    if (movement.isDown) {
        if (!prevIsDown) {
            paths.push(new RevealingPath(movement.mouseButton, timestamp));
            const lastPath = paths[paths.length - 1];
            lastPath.addPoint(movement.mousePoint.x, movement.mousePoint.y);
        } else {
            const lastPath = paths[paths.length - 1];
            lastPath.addPoint(movement.mousePoint.x, movement.mousePoint.y);
        }
    }
    prevIsDown = movement.isDown;

    for (let i = 0; i < paths.length; i++) {

        // 각 path가 그려질 때마다 그 path에 해당하는 내용물을 모두 지움, globalCompositeOperation은 destination-out
        // 이후 그 path에 해당하는 글씨를 적음, 이때 globalCompositeOperation은 destination-over
        paths[i].erase(ctx, width, height);

        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        const bgText = bgTextDict.get(paths[i].type);
        ctx.font = bgText.size + 'px ' + bgText.font;
        const textWidth = ctx.measureText(bgText.text).width;
        ctx.fillText(bgText.text, centerx + textWidth * bgText.xRatio, centery + bgText.size * bgText.yRatio);

        paths[i].fill(ctx, width, height, bgText.color);
        // 그 후 각 path를 채움, 이때 globalCompositeOperation은 다시 destination-over
        // 이 과정을 loop로 하면 클릭에 따라서 가능할 듯
        // path의 유지 시간은 약 2000프레임 정도로 해보자
    }


    if (paths.length > 0 && timestamp - paths[0].timestamp > PATH_MAX_LIFE) {
        paths[0].removeSinglePoint();
        if (paths[0].isEmpty())
            paths.splice(0, 1);
    }

    // 마우스 좌우 버튼에 따라 서로 다른 글씨가 드러나도록 만들기
    timestamp++;
    if (paths.length === 0) {
        timestamp = 0;
    }
}

export function CleanD() {
    paths = [];
    bgTextDict = null;
    prevIsDown = false;
    timestamp = 0;
}