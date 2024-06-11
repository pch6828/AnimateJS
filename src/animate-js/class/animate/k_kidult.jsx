class Stud {
    static studWidth = 0;
    constructor(block, color) {
        this.connection = null;
        this.block = block;
        this.color = color;
    }

    move() {

    }

    draw(ctx, x, y) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.roundRect(x - Stud.studWidth / 2, y - Stud.studWidth / 2, Stud.studWidth, Stud.studWidth, Stud.studWidth / 4)
        ctx.closePath();
        ctx.fill();
    }
};

const BlockStatus = {
    spawn: 'spawn',
    moving: 'moving',
    stable: 'stable',
    falling: 'falling'
};

class LegoBlock {
    constructor(letter) {
        this.size = Math.floor(Math.random() * 3) + 1;
        this.letter = letter;
        this.studs = [];
        this.antistuds = [];
        for (let i = 0; i < this.size; i++) {
            this.studs[i] = new Stud(this);
            this.antistuds[i] = null;
        }
        this.spawning = true;
        this.status = BlockStatus.spawn;
    }

    move(movement, width, height) {

    }

    draw(ctx, width, height) {
        ctx.globalCompositeOperation = 'source-over';
    }
};

const blocks = [];
const basePlate = [];

function AnimationK(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const basePlateLength = 21; // max block length * # of letters
    const basePlateColor = "rgba(66,73,82,1)";

    Stud.studWidth = width / 50;
    // 레고  
    // KID, ADULT로 레고 블록 
    // 회색 OR 검은색으로 플레이트
    // 조립 기능 구현, 블록 버리기 기능 구현
    // 블록을 버릴 경우 위에서 해당 글자의 블럭 떨어트리기

    if (blocks.length === 0) {
        blocks[0] = new LegoBlock('A');
        blocks[1] = new LegoBlock('D');
        blocks[2] = new LegoBlock('U');
        blocks[3] = new LegoBlock('L');
        blocks[4] = new LegoBlock('T');
        blocks[5] = new LegoBlock('K');
        blocks[6] = new LegoBlock('I');
    }

    if (basePlate.length === 0) {
        for (let i = 0; i < basePlateLength; i++) {
            basePlate[i] = new Stud(null, basePlateColor);
        }
    }

    for (let i = 0; i < basePlateLength; i++) {
        basePlate[i].draw(ctx, centerx - (10 - i) * Stud.studWidth * 2, centery * 1.3);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = basePlateColor;
    ctx.fillRect(centerx - 21 * Stud.studWidth, centery * 1.3, 42 * Stud.studWidth, Stud.studWidth);

}

export default AnimationK;