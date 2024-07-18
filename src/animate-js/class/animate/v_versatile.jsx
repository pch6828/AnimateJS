const BladeStatus = {
    default: 'default',
    open: 'open',
    close: 'close'
};

class Blade {
    static selected = null;
    static EPSILON = 0.000001;

    constructor(xRatio, yRatio, deg) {
        this.xRatio = xRatio;
        this.yRatio = yRatio;
        this.deg = deg;
        this.defaultDeg = deg;
        this.openDeg = (xRatio < 0.5 ? Math.PI / 2 : 3 * Math.PI / 2);
        this.closeDeg = (xRatio < 0.5 ? 3 * Math.PI / 2 : Math.PI / 2);
        this.numMoveFrame = 10;
        this.prevIsDown = false;
        this.status = BladeStatus.default;
    }

    move(movement, width, height, ctx) {
        const baseX = width * this.xRatio;
        const baseY = height * this.yRatio;
        const areaWidth = width / 60;

        const areaBottomCenter = {
            x: baseX + Math.cos(this.deg + Math.PI / 2) * (width / 15),
            y: baseY + Math.sin(this.deg + Math.PI / 2) * (width / 15)
        };
        const areaTopCenter = {
            x: baseX + Math.cos(this.deg + Math.PI / 2) * (width / 4.5),
            y: baseY + Math.sin(this.deg + Math.PI / 2) * (width / 4.5)
        };

        const area = new Path2D();
        area.moveTo(areaBottomCenter.x, areaBottomCenter.y);
        area.lineTo(areaBottomCenter.x + Math.cos(this.deg) * areaWidth, areaBottomCenter.y + Math.sin(this.deg) * areaWidth);
        area.lineTo(areaTopCenter.x + Math.cos(this.deg) * areaWidth, areaTopCenter.y + Math.sin(this.deg) * areaWidth);
        area.lineTo(areaTopCenter.x, areaTopCenter.y);
        area.lineTo(areaTopCenter.x - Math.cos(this.deg) * areaWidth, areaTopCenter.y - Math.sin(this.deg) * areaWidth);
        area.lineTo(areaBottomCenter.x - Math.cos(this.deg) * areaWidth, areaBottomCenter.y - Math.sin(this.deg) * areaWidth);

        if (!this.prevIsDown && movement.isDown &&
            ctx.isPointInPath(area, movement.mousePoint.x, movement.mousePoint.y)) {
            if (!Blade.selected && this.status === BladeStatus.default) {
                Blade.selected = this;
            } else if (Blade.selected === this && this.status === BladeStatus.open) {
                Blade.selected = null;
            }
        }

        if (Blade.selected) {
            if (Blade.selected === this) {
                if (this.status === BladeStatus.default) {
                    this.deg += (this.openDeg - this.defaultDeg) / this.numMoveFrame;
                }
            } else {
                if (this.status === BladeStatus.open) {
                    this.deg += (this.closeDeg - this.openDeg) / this.numMoveFrame;
                } else if (this.status === BladeStatus.default) {
                    this.deg += (this.closeDeg - this.defaultDeg) / this.numMoveFrame;
                }
            }
        } else {
            if (this.status === BladeStatus.open) {
                this.deg += (this.defaultDeg - this.openDeg) / this.numMoveFrame;
            } else if (this.status === BladeStatus.close) {
                this.deg += (this.defaultDeg - this.closeDeg) / this.numMoveFrame;
            }
        }

        this.prevIsDown = movement.isDown;
        if (Math.abs(this.deg - this.defaultDeg) < Blade.EPSILON) {
            this.deg = this.defaultDeg;
            this.status = BladeStatus.default
        } else if (Math.abs(this.deg - this.closeDeg) < Blade.EPSILON) {
            this.deg = this.closeDeg;
            this.status = BladeStatus.close;
        } else if (Math.abs(this.deg - this.openDeg) < Blade.EPSILON) {
            this.deg = this.openDeg;
            this.status = BladeStatus.open;
        }
    }
    draw(ctx, width, height) { }
};

class Dagger extends Blade {
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = width / 20;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 4);
        ctx.closePath();
        ctx.stroke();

        ctx.globalCompositeOperation = 'source-atop';
        ctx.save();
        ctx.translate(ctx.lineWidth / 4, 0);
        ctx.strokeStyle = 'rgba(116,139,151,1)';
        ctx.lineWidth = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 4);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';

        ctx.translate(0, width / 6 * 1.8);
        ctx.save();
        ctx.rotate(Math.PI / 9);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -width / 7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
        ctx.save();
        ctx.rotate(-Math.PI / 9);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -width / 7);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        ctx.restore();
    }
};

class Saw extends Blade {
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = width / 20;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 5);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'rgba(152,160,165,1)';
        ctx.beginPath();
        ctx.moveTo(-ctx.lineWidth / 2, width / 5 - 1);
        ctx.arcTo(-ctx.lineWidth / 2, width / 5 + ctx.lineWidth, ctx.lineWidth / 2, width / 5 + ctx.lineWidth, ctx.lineWidth);
        ctx.lineTo(ctx.lineWidth / 2, width / 5 - 1);
        ctx.closePath();
        ctx.fill();

        ctx.globalCompositeOperation = 'destination-out';

        ctx.beginPath();
        ctx.moveTo(ctx.lineWidth / 2 + 1, width / 5 + ctx.lineWidth * 0.8);
        for (let i = 0; i < 8; i++) {
            ctx.lineTo(ctx.lineWidth / 4, width / 5 + ctx.lineWidth * 0.8 - width / 100 * (i * 2 + 1));
            ctx.lineTo(ctx.lineWidth / 2 + 1, width / 5 + ctx.lineWidth * 0.8 - width / 100 * (i * 2 + 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
};

class Driver extends Blade {
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = width / 50;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 5);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'rgba(116,139,151,1)';
        ctx.beginPath();
        ctx.moveTo(-ctx.lineWidth / 2, width / 5);
        ctx.lineTo(-ctx.lineWidth / 4 * 3, width / 5 + ctx.lineWidth / 4);
        ctx.lineTo(-ctx.lineWidth / 4 * 3, width / 5 + ctx.lineWidth * 1.5);
        ctx.lineTo(ctx.lineWidth / 4 * 3, width / 5 + ctx.lineWidth * 1.5);
        ctx.lineTo(ctx.lineWidth / 4 * 3, width / 5 + ctx.lineWidth / 4);
        ctx.lineTo(ctx.lineWidth / 2, width / 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
};

class BottleOpener extends Blade {
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = width / 20;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 6);
        ctx.closePath();
        ctx.stroke();

        ctx.save();
        ctx.translate(-ctx.lineWidth / 4, 0);
        ctx.lineWidth = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 6 + ctx.lineWidth);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.translate(-ctx.lineWidth / 2, width / 6 * 0.9);
        ctx.lineWidth = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.lineTo(ctx.lineWidth * 1.25, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(ctx.lineWidth * (1.25 - 1 / 3), 0);
        ctx.lineTo(ctx.lineWidth * (1.25 - 1 / 3), -ctx.lineWidth);
        ctx.closePath();
        ctx.lineWidth = ctx.lineWidth / 1.5;
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.translate(-ctx.lineWidth / 2, 0);
        ctx.lineWidth = ctx.lineWidth / 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 6 * 0.5);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        ctx.restore();
    }
};

class WineOpener extends Blade {
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.xRatio * width, this.yRatio * height);
        ctx.rotate(this.deg);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineCap = 'square';
        ctx.lineJoin = 'miter';
        ctx.lineWidth = width / 20;
        ctx.strokeStyle = 'rgba(152,160,165,1)';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, width / 12);
        ctx.closePath();
        ctx.stroke();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = ctx.lineWidth / 5;
        ctx.save();
        ctx.translate(0, width / 12);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.lineWidth);
        ctx.closePath();
        ctx.stroke();

        ctx.translate(0, ctx.lineWidth);

        ctx.strokeStyle = 'rgba(116,139,151,1)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i));
            ctx.lineTo(-ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 1));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(152,160,165,1)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 1));
            ctx.lineTo(ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 2));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ctx.lineWidth * 5 / 3, ctx.lineWidth / 2);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();

        ctx.restore();
    }
};

var blades = [];

export function AnimationV(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 6;

    if (blades.length === 0) {
        blades[0] = new Dagger(0.375, 0.5, Math.PI * 13 / 12);
        blades[1] = new Saw(0.375, 0.5, Math.PI * 10 / 12);
        blades[2] = new Driver(0.375, 0.5, Math.PI * 8 / 12);
        blades[3] = new BottleOpener(0.625, 0.5, Math.PI * 10 / 12);
        blades[4] = new WineOpener(0.625, 0.5, Math.PI * 15 / 12);
    }

    for (let i = 0; i < blades.length; i++) {
        blades[i].draw(ctx, width, height);
        blades[i].move(movement, width, height, ctx);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(128,0,32,1)';
    ctx.lineWidth = width / 10;

    ctx.beginPath();
    ctx.moveTo(centerx - width / 8, centery);
    ctx.lineTo(centerx + width / 8, centery);
    ctx.closePath();

    ctx.stroke();

    ctx.fillStyle = 'rgba(116,139,151,1)';
    ctx.beginPath();
    ctx.arc(centerx - width / 8, centery, width / 60, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fill();

    ctx.beginPath();
    ctx.arc(centerx + width / 8, centery, width / 60, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fill();

    ctx.lineWidth = width / 100;
    ctx.strokeStyle = 'rgba(116,139,151,1)';
    ctx.beginPath();
    ctx.arc(centerx + width / 8 + width / 30, centery + width / 15, width / 40, 0, Math.PI * 2);
    ctx.closePath();

    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.font = 'italic ' + fontSize + 'px Georgia';
    const textwidth = ctx.measureText('Versatile').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText('Versatile', centerx - textwidth / 2, centery + fontSize * 1.7);

}

export function CleanV() {
    Blade.selected = null;
    blades = [];
}