import { get_random } from "./util";

class Stud {
    static studWidth = 0;
    constructor(block, color) {
        this.connection = null;
        this.block = block;
        this.color = color;
        this.centerPos = null;
    }

    move() {

    }

    draw(ctx, x, y) {
        if (this.connection) {
            this.connection.draw(ctx, x, y, this);
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

    setPosition(x, y) {
        this.centerPos = { x: x, y: y };
        if (this.connection) {
            this.connection.setPosition(x, y, this);
        }
    }
};

class LegoBlock {
    constructor(letter, colorSet) {
        const color = get_random(colorSet);
        this.size = Math.floor(Math.random() * 3) + 1;
        this.letter = letter;
        this.color = color.blockColor;
        this.drawed = false;
        this.positioned = false;
        this.studs = [];
        this.antiStuds = [];
        this.prevIsDown = false;
        for (let i = 0; i < this.size; i++) {
            this.studs[i] = new Stud(this, color.studColor);
            this.antiStuds[i] = null;
        }

        this.selectedPos = null;
        this.isConnected = false;
        this.isFalling = false;
        this.dy = 0;
        this.ddy = 1;
        this.angle = 0;
        this.rotate = Math.random() * Math.PI / 18;
    }

    move(movement, ctx, studs) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;

        const area = new Path2D();
        if (this.isFalling) {
            this.selectedPos.y += this.dy;
            this.dy += this.ddy;
            this.angle += this.rotate;
            return;
        }

        for (let i = 0; i < this.size; i++) {
            if (this.studs[i].connection) {
                return;
            }
        }

        area.moveTo(
            this.studs[0].centerPos.x - blockWidth / 2,
            this.studs[0].centerPos.y + blockHeight
        );
        area.lineTo(
            this.studs[0].centerPos.x - blockWidth / 2 + blockWidth * this.size,
            this.studs[0].centerPos.y + blockHeight
        );
        area.lineTo(
            this.studs[0].centerPos.x - blockWidth / 2 + blockWidth * this.size,
            this.studs[0].centerPos.y
        );
        area.lineTo(
            this.studs[0].centerPos.x - blockWidth / 2,
            this.studs[0].centerPos.y
        );
        area.closePath();

        if (movement.isDown) {
            if (!this.prevIsDown &&
                ctx.isPointInPath(area, movement.mousePoint.x, movement.mousePoint.y)) {
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
                this.unconnect();
            }
            if (this.selectedPos) {
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
                this.isConnected = this.connectIfPossible(studs);

            }
        } else {
            if (this.isConnected) {
                this.selectedPos = null;
            } else {
                this.isFalling = true;
            }
        }

        this.prevIsDown = movement.isDown;
    }

    draw(ctx, x, y, stud) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;
        const antiStudIdx = this.selectedPos && !this.isConnected ? 0 : this.antiStuds.indexOf(stud);
        const fontSize = Stud.studWidth * 2.5;

        if (this.drawed || (!this.selectedPos && stud === undefined))
            return;

        this.drawed = true;

        if (this.isFalling) {
            this.drawed = true;
            ctx.save();
            ctx.translate(this.selectedPos.x, this.selectedPos.y);
            ctx.rotate(this.angle);
            x = -blockWidth / 2 * this.size + blockWidth / 2;
            y = blockHeight / 2;

            for (let i = 0; i < this.size; i++) {
                const stud = this.studs[i];
                stud.draw(ctx, x - blockWidth * antiStudIdx + blockWidth * i, y - blockHeight);
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = this.color;

            ctx.fillRect(x - blockWidth * antiStudIdx - blockWidth / 2, y, blockWidth * this.size, -blockHeight);
            ctx.font = fontSize + 'px Comic Sans MS';
            ctx.fillStyle = 'rgba(0,0,0,1)';
            const textWidth = ctx.measureText(this.letter).width;
            ctx.fillText(this.letter,
                x - blockWidth * antiStudIdx - blockWidth / 2 + blockWidth * this.size / 2 - textWidth / 2,
                y - blockHeight / 2 + fontSize / 2.5);

            ctx.restore();
            return;
        }

        if (this.selectedPos && !this.isConnected) {
            x = this.selectedPos.x - blockWidth / 2 * this.size + blockWidth / 2;
            y = this.selectedPos.y + blockHeight / 2;
        }

        for (let i = 0; i < this.size; i++) {
            const stud = this.studs[i];
            stud.draw(ctx, x - blockWidth * antiStudIdx + blockWidth * i, y - blockHeight);
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.color;

        ctx.fillRect(x - blockWidth * antiStudIdx - blockWidth / 2, y, blockWidth * this.size, -blockHeight);
        ctx.font = fontSize + 'px Comic Sans MS';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        const textWidth = ctx.measureText(this.letter).width;
        ctx.fillText(this.letter,
            x - blockWidth * antiStudIdx - blockWidth / 2 + blockWidth * this.size / 2 - textWidth / 2,
            y - blockHeight / 2 + fontSize / 2.5);
    }

    setPosition(x, y, stud) {
        if (this.positioned)
            return;

        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;
        const antiStudIdx = this.antiStuds.indexOf(stud);

        this.positioned = true;

        for (let i = 0; i < this.size; i++) {
            const stud = this.studs[i];
            const antiStud = this.antiStuds[i];

            stud.setPosition(x - blockWidth * antiStudIdx + blockWidth * i, y - blockHeight);

            if (antiStud)
                antiStud.setPosition(x - blockWidth * antiStudIdx + blockWidth * i, y);
        }
    }

    unconnect(needToConnect) {
        this.isConnected = false;
        for (let i = 0; i < this.size; i++) {
            const antiStud = this.antiStuds[i];
            const stud = this.studs[i];

            if (antiStud && antiStud.block !== needToConnect) {
                antiStud.connection = null;
                this.antiStuds[i] = null;
            }

            if (stud.connection) {
                stud.connection.unconnect(this);
            }
        }
    }

    connectIfPossible(studs) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;
        var connectPossible = true;

        this.unconnect();
        for (let i = 0; i < this.size; i++) {
            const x = this.selectedPos.x - blockWidth / 2 * this.size + blockWidth / 2 + blockWidth * i;
            const y = this.selectedPos.y + blockHeight / 2;

            for (let j = 0; j < studs.length; j++) {
                const stud = studs[j];
                const dx = x - stud.centerPos.x;
                const dy = y - stud.centerPos.y;

                if (stud.block === this) continue;

                if (Math.sqrt(dx * dx + dy * dy) <= Stud.studWidth / 3) {
                    for (let k = 0; k < studs.length; k++) {
                        const stud2 = studs[k];
                        if (stud2.block === this) continue;
                        if (stud2.centerPos.x === stud.centerPos.x &&
                            stud2.centerPos.y === stud.centerPos.y - 2 * blockHeight) {
                            connectPossible = false;
                            break;
                        }
                    }

                    if (!connectPossible && stud.connection && stud.connection !== this) {
                        connectPossible = false;
                        break;
                    }

                    this.antiStuds[i] = stud;
                    stud.connection = this;
                    break;
                }
            }
        }

        if (!connectPossible)
            this.unconnect();

        for (let i = 0; i < this.size; i++) {
            if (this.antiStuds[i])
                return true;
        }
        return false;
    }

    isFalledOut(height) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;

        return this.isFalling && this.selectedPos.y > height + Math.max(blockHeight, blockWidth * this.size);
    }

    spawn(studs, studToExclude) {
        const blockWidth = Stud.studWidth * 2;
        const blockHeight = Stud.studWidth * 3;

        while (true) {
            const antiStudIdx = Math.floor(Math.random() * this.size);
            var studIdx = Math.floor(Math.random() * studs.length);
            var connectPossible = true;

            while (studToExclude.includes(studs[studIdx]) || studs[studIdx].connection || (studs[studIdx].block && studs[studIdx].block.selectedPos)) {
                studIdx = Math.floor(Math.random() * studs.length);
            }

            const stud = studs[studIdx];
            this.antiStuds[antiStudIdx] = stud;
            stud.connection = this;
            this.isConnected = true;

            const leftBottomX = stud.centerPos.x - blockWidth * antiStudIdx - blockWidth / 2;
            const leftBottomY = stud.centerPos.y;

            for (let i = 0; i < this.size; i++) {
                if (this.antiStuds[i])
                    continue;
                const x = leftBottomX + blockWidth / 2 + blockWidth * i;
                const y = leftBottomY;

                for (let j = 0; j < studs.length; j++) {
                    const stud = studs[j];
                    if (studToExclude.includes(stud) || j === studIdx || (stud.block && stud.block.selectedPos))
                        continue;

                    const dx = stud.centerPos.x - x;
                    const dy = stud.centerPos.y - y;

                    if (Math.sqrt(dx * dx + dy * dy) <= Stud.studWidth / 3) {
                        for (let k = 0; k < studs.length; k++) {
                            const stud2 = studs[k];
                            if (stud2.block === this) continue;
                            if (stud2.centerPos.x === stud.centerPos.x &&
                                stud2.centerPos.y === stud.centerPos.y - 2 * blockHeight) {
                                connectPossible = false;
                                break;
                            }
                        }
                        if (stud.connection && stud.connection !== this) {
                            connectPossible = false;
                            break;
                        }
                        this.antiStuds[i] = stud;
                        stud.connection = this;
                        break;
                    }
                }
                if (!connectPossible)
                    break;
            }

            if (connectPossible)
                return;

            for (let i = 0; i < this.size; i++) {
                if (this.antiStuds[i]) {
                    this.antiStuds[i].connection = null;
                    this.antiStuds[i] = null;
                }
            }
        }
    }
};

const blocks = [];
const basePlateStud = [];

function blockSetUp(basePlateStud, blocks) {
    var adultLength = 0;
    const adultRange = 5;
    const kIdx = 5;
    const iIdx = 6;
    const dIdx = 1;

    for (let i = 0; i < adultRange; i++) {
        adultLength += blocks[i].size;
    }
    const adultStartIdx = Math.floor((basePlateStud.length - adultLength) / 2);
    var idx = adultStartIdx;

    for (let i = 0; i < adultRange; i++) {
        const block = blocks[i];
        for (let j = 0; j < block.size; j++) {
            basePlateStud[idx].connection = blocks[i];
            blocks[i].antiStuds[j] = basePlateStud[idx];
            blocks[i].isConnected = true;
            idx++;
        }
    }

    var blockIdx, studIdx;

    if (blocks[dIdx].size === 1 && blocks[iIdx].size === 3) {
        blockIdx = dIdx - 1;
        studIdx = blocks[dIdx - 1].size - 1;
    } else {
        blockIdx = dIdx;
        studIdx = 0;
    }

    for (let i = 0; i < blocks[iIdx].size; i++) {
        blocks[blockIdx].studs[studIdx].connection = blocks[iIdx];
        blocks[iIdx].antiStuds[i] = blocks[blockIdx].studs[studIdx];
        blocks[iIdx].isConnected = true;
        studIdx++;
        if (studIdx === blocks[blockIdx].size) {
            studIdx = 0;
            blockIdx++;
        }
    }

    for (let i = 0; i < blocks[kIdx].size && i < blocks[iIdx].size; i++) {
        blocks[iIdx].studs[i].connection = blocks[kIdx];
        blocks[kIdx].antiStuds[i] = blocks[iIdx].studs[i];
        blocks[kIdx].isConnected = true;
    }
}

function AnimationK(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const basePlateLength = 21; // max block length * # of letters
    const basePlateColor = {
        studColor: "rgba(96,103,112,1)",
        blockColor: "rgba(66,73,82,1)"
    };
    const colorSet = [
        {
            studColor: "rgba(234,67,74,1)",
            blockColor: "rgba(204,37,44,1)"
        },
        {
            studColor: "rgba(30,109,255,1)",
            blockColor: "rgba(0,79,255,1)"
        },
        {
            studColor: "rgba(254,231,21,1)",
            blockColor: "rgba(255,223,0,1)"
        },
        {
            studColor: "rgba(30,201,162,1)",
            blockColor: "rgba(0,171,132,1)"
        },
    ]

    var studs = [];

    Stud.studWidth = width / 50;

    if (basePlateStud.length === 0) {
        for (let i = 0; i < basePlateLength; i++) {
            basePlateStud[i] = new Stud(null, basePlateColor.studColor);
        }
    }

    if (blocks.length === 0) {
        blocks[0] = new LegoBlock('A', colorSet);
        blocks[1] = new LegoBlock('D', colorSet);
        blocks[2] = new LegoBlock('U', colorSet);
        blocks[3] = new LegoBlock('L', colorSet);
        blocks[4] = new LegoBlock('T', colorSet);
        blocks[5] = new LegoBlock('K', colorSet);
        blocks[6] = new LegoBlock('I', colorSet);
        blockSetUp(basePlateStud, blocks);
    }


    for (let i = 0; i < basePlateLength; i++) {
        const x = centerx - (10 - i) * Stud.studWidth * 2;
        const y = centery * 1.3;
        basePlateStud[i].setPosition(x, y)
    }

    studs = studs.concat(basePlateStud);
    for (let i = 0; i < blocks.length; i++) {
        studs = studs.concat(blocks[i].studs)
    }

    for (let i = 0; i < blocks.length; i++) {
        blocks[i].move(movement, ctx, studs);
    }

    for (let i = 0; i < basePlateLength; i++) {
        const x = centerx - (10 - i) * Stud.studWidth * 2;
        const y = centery * 1.3;
        basePlateStud[i].draw(ctx, x, y);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = basePlateColor.blockColor;
    ctx.fillRect(centerx - 21 * Stud.studWidth, centery * 1.3, 42 * Stud.studWidth, Stud.studWidth);

    for (let i = 0; i < blocks.length; i++) {
        if (!blocks[i].drawed)
            blocks[i].draw(ctx);
    }

    for (let i = 0; i < blocks.length; i++) {
        blocks[i].drawed = false;
        blocks[i].positioned = false;
        if (blocks[i].isFalledOut(height)) {
            const prevStuds = blocks[i].studs;
            blocks[i] = new LegoBlock(blocks[i].letter, colorSet);
            blocks[i].spawn(studs, prevStuds);
        }
    }
}

export default AnimationK;