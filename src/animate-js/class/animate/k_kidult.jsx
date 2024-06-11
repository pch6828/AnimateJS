class Stud {
    static studWidth = 0;
    constructor(block, color) {
        this.connection = null;
        this.block = block;
        this.color = color;
    }

    move() {

    }

    draw(ctx, x, y, width, height) {
        if (this.connection) {
            this.connection.draw(ctx, x, y, width, height, this);
        }
        else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = this.color;

            ctx.beginPath();
            ctx.roundRect(x - Stud.studWidth / 2, y - Stud.studWidth / 2, Stud.studWidth, Stud.studWidth, Stud.studWidth / 4)
            ctx.closePath();
            ctx.fill();
        }
    }
};

class LegoBlock {
    constructor(letter, blockColor, studColor) {
        this.size = Math.floor(Math.random() * 3) + 1;
        this.letter = letter;
        this.color = blockColor;
        this.drawed = false;
        this.studs = [];
        this.antiStuds = [];

        for (let i = 0; i < this.size; i++) {
            this.studs[i] = new Stud(this, studColor);
            this.antiStuds[i] = null;
        }

        this.selectPos = null;
    }

    move(movement, width, height) {

    }

    draw(ctx, x, y, width, height, stud) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;
        const antiStudIdx = this.antiStuds.indexOf(stud);

        if (this.drawed) {
            return;
        }

        this.drawed = true;

        for (let i = 0; i < this.size; i++) {
            const stud = this.studs[i];
            stud.draw(ctx, x - blockWidth * antiStudIdx + blockWidth * i, y - blockHeight, width, height);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;

        ctx.fillRect(x - blockWidth * antiStudIdx - blockWidth / 2, y, blockWidth * this.size, -blockHeight);
    }

    connect(stud) {

    }
};

const blocks = [];
const basePlateStud = [];

function AnimationK(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const basePlateLength = 21; // max block length * # of letters
    const basePlateColor = {
        studColor: "rgba(96,103,112,1)",
        blockColor: "rgba(66,73,82,1)"
    };

    Stud.studWidth = width / 50;
    // 레고  
    // KID, ADULT로 레고 블록 
    // 회색 OR 검은색으로 플레이트
    // 조립 기능 구현, 블록 버리기 기능 구현
    // 블록을 버릴 경우 위에서 해당 글자의 블럭 떨어트리기

    if (blocks.length === 0) {
        blocks[0] = new LegoBlock('A', 'red', 'red');
        blocks[1] = new LegoBlock('D');
        blocks[2] = new LegoBlock('U');
        blocks[3] = new LegoBlock('L');
        blocks[4] = new LegoBlock('T');
        blocks[5] = new LegoBlock('K');
        blocks[6] = new LegoBlock('I');
    }

    if (basePlateStud.length === 0) {
        for (let i = 0; i < basePlateLength; i++) {
            basePlateStud[i] = new Stud(null, basePlateColor.studColor);
        }
    }

    for (let i = 0; i < blocks[0].size; i++) {
        basePlateStud[i].connection = blocks[0];
        blocks[0].antiStuds[i] = basePlateStud[i];
    }

    for (let i = 0; i < basePlateLength; i++) {
        const x = centerx - (10 - i) * Stud.studWidth * 2;
        const y = centery * 1.3;
        basePlateStud[i].draw(ctx, x, y, width, height);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = basePlateColor.blockColor;
    ctx.fillRect(centerx - 21 * Stud.studWidth, centery * 1.3, 42 * Stud.studWidth, Stud.studWidth);

    for (let i = 0; i < blocks.length; i++) {
        blocks[i].drawed = false;
    }
}

export default AnimationK;