class HomingString {
    constructor(str, currentPos) {
        this.prevIsDown = false;
        this.selectedPos = null;
        this.str = str;
        this.currentPos = currentPos;
    }

    move(movement, homingPos, width, height) {
        if (movement.isDown) {
            if (!this.prevIsDown &&
                this.currentPos.x <= movement.mousePoint.x &&
                movement.mousePoint.x <= this.currentPos.x + width &&
                this.currentPos.y - height <= movement.mousePoint.y &&
                movement.mousePoint.y <= this.currentPos.y) {
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
            if (this.selectedPos) {
                this.currentPos.x += movement.mousePoint.x - this.selectedPos.x;
                this.currentPos.y += movement.mousePoint.y - this.selectedPos.y;
                this.selectedPos = { x: movement.mousePoint.x, y: movement.mousePoint.y };
            }
        } else {
            this.selectedPos = null;
        }
        if (!this.selectedPos) {
            this.currentPos.x += (homingPos.x - this.currentPos.x) * 0.005;
            this.currentPos.y += (homingPos.y - this.currentPos.y) * 0.005;
        }
        this.prevIsDown = movement.isDown;
    }

    draw(ctx) {
        ctx.globalCompositeOperation = 'xor';
        ctx.fillText(this.str, this.currentPos.x, this.currentPos.y);
    }
}

var movingLetters = [];

export function AnimationH(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 7;
    const roundCorner = fontSize / 5;

    ctx.globalCompositeOperation = 'source-over';

    ctx.font = fontSize + 'px Madimi One';
    const textwidth = ctx.measureText('Homebody').width;
    const textwidthHome = ctx.measureText('Home').width;
    const textwidthBody = ctx.measureText('body').width;
    const homingPos = [
        { x: centerx - textwidth / 2 + textwidthHome, y: centery + fontSize / 4 },
        { x: centerx - textwidth / 2 + textwidthHome + ctx.measureText('b').width, y: centery + fontSize / 4 },
        { x: centerx - textwidth / 2 + textwidthHome + ctx.measureText('bo').width, y: centery + fontSize / 4 },
        { x: centerx - textwidth / 2 + textwidthHome + ctx.measureText('bod').width, y: centery + fontSize / 4 }
    ];

    if (movingLetters.length === 0) {
        movingLetters[0] = new HomingString('b', homingPos[0]);
        movingLetters[1] = new HomingString('o', homingPos[1]);
        movingLetters[2] = new HomingString('d', homingPos[2]);
        movingLetters[3] = new HomingString('y', homingPos[3]);
    }

    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.strokeStyle = 'rgba(255,255,255,1)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize / 3;

    ctx.fillText('Home', centerx - textwidth / 2, centery + fontSize / 4);

    // Draw House icon
    ctx.beginPath();
    ctx.roundRect(centerx - textwidth / 2 + textwidthHome, centery - fontSize, textwidthBody, fontSize * 1.5, [roundCorner, roundCorner, roundCorner, roundCorner]);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(centerx - textwidth / 2 + textwidthHome, centery - fontSize * 0.7);
    ctx.lineTo(centerx - textwidth / 2 + textwidthHome + textwidthBody / 2, centery - fontSize * 1.5);
    ctx.lineTo(centerx + textwidth / 2, centery - fontSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerx - textwidth / 2 + textwidthHome + textwidthBody * 0.8, centery - fontSize * 0.7);
    ctx.lineTo(centerx - textwidth / 2 + textwidthHome + textwidthBody * 0.8, centery - fontSize * 1.5);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,211,0,1)'
    for (let i = 0; i < movingLetters.length; i++) {
        const letterWidth = ctx.measureText(movingLetters[i].str).width;
        const letterHeight = fontSize;
        movingLetters[i].move(movement, homingPos[i], letterWidth, letterHeight);
        movingLetters[i].draw(ctx);
    }
}

export function CleanH() {
    movingLetters = [];
}