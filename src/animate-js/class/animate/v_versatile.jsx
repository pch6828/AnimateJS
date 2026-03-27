const BladeStatus = {
    default: 'default',
    open: 'open',
    close: 'close'
};

const HANDLE_COLORS = {
    bodyTop: '#99332c',
    bodyBottom: '#742320',
    outline: '#4a1714',
    highlight: 'rgba(255, 231, 208, 0.12)',
    shadow: 'rgba(32, 16, 12, 0.12)',
    rivetLight: '#d4bb8b',
    rivetDark: '#8a6635',
    ring: '#6e8a97',
    ink: '#16100f'
};

function drawRivet(ctx, x, y, radius) {
    const gradient = ctx.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.15,
        x,
        y,
        radius
    );
    gradient.addColorStop(0, HANDLE_COLORS.rivetLight);
    gradient.addColorStop(1, HANDLE_COLORS.rivetDark);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(55, 31, 16, 0.32)';
    ctx.lineWidth = Math.max(1, radius * 0.18);
    ctx.stroke();
}

function drawHandleRing(ctx, centerx, centery, width) {
    const ringX = centerx + width / 8 + width / 30;
    const ringY = centery + width / 15;
    const ringRadius = width / 40;
    const connectorWidth = Math.max(1.5, width / 140);

    ctx.save();

    ctx.strokeStyle = 'rgba(63, 72, 80, 0.26)';
    ctx.lineWidth = Math.max(2, width / 85);
    ctx.beginPath();
    ctx.arc(ringX, ringY + ringRadius * 0.14, ringRadius * 0.98, 0, Math.PI * 2);
    ctx.stroke();

    const ringGradient = ctx.createLinearGradient(
        ringX,
        ringY - ringRadius,
        ringX,
        ringY + ringRadius
    );
    ringGradient.addColorStop(0, '#bfcacf');
    ringGradient.addColorStop(0.45, HANDLE_COLORS.ring);
    ringGradient.addColorStop(1, '#647c89');

    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = Math.max(1.8, width / 110);
    ctx.beginPath();
    ctx.arc(ringX, ringY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 248, 239, 0.28)';
    ctx.lineWidth = Math.max(1, width / 180);
    ctx.beginPath();
    ctx.arc(ringX - ringRadius * 0.08, ringY - ringRadius * 0.06, ringRadius * 0.82, Math.PI * 1.05, Math.PI * 1.68);
    ctx.stroke();

    ctx.strokeStyle = HANDLE_COLORS.handleEdge;
    ctx.lineWidth = connectorWidth;
    ctx.beginPath();
    ctx.moveTo(centerx + width / 8 - width / 140, centery + width / 35);
    ctx.lineTo(ringX - ringRadius * 0.88, ringY - ringRadius * 0.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 236, 214, 0.1)';
    ctx.lineWidth = Math.max(1, connectorWidth * 0.7);
    ctx.beginPath();
    ctx.moveTo(centerx + width / 8 - width / 160, centery + width / 38);
    ctx.lineTo(ringX - ringRadius * 0.74, ringY - ringRadius * 0.58);
    ctx.stroke();

    ctx.restore();
}

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
        const bladeLength = width / 4;
        const bladeWidth = width / 22;
        const bladeGradient = ctx.createLinearGradient(0, 0, 0, bladeLength);
        bladeGradient.addColorStop(0, '#f0ece4');
        bladeGradient.addColorStop(0.38, '#b9c0c4');
        bladeGradient.addColorStop(1, '#6f7a82');

        ctx.fillStyle = bladeGradient;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(bladeWidth / 2, bladeLength * 0.12);
        ctx.lineTo(bladeWidth / 2, bladeLength * 0.78);
        ctx.quadraticCurveTo(bladeWidth * 0.22, bladeLength * 0.96, 0, bladeLength);
        ctx.quadraticCurveTo(-bladeWidth * 0.22, bladeLength * 0.96, -bladeWidth / 2, bladeLength * 0.78);
        ctx.lineTo(-bladeWidth / 2, bladeLength * 0.12);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(81, 86, 90, 0.55)';
        ctx.lineWidth = Math.max(1.1, width / 140);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = Math.max(1, width / 180);
        ctx.beginPath();
        ctx.moveTo(bladeWidth * 0.18, bladeLength * 0.08);
        ctx.lineTo(bladeWidth * 0.18, bladeLength * 0.76);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(108, 123, 133, 0.45)';
        ctx.lineWidth = Math.max(1, width / 170);
        ctx.beginPath();
        ctx.moveTo(0, bladeLength * 0.16);
        ctx.lineTo(0, bladeLength * 0.86);
        ctx.stroke();

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
    const handleLeft = centerx - width / 8;
    const handleRight = centerx + width / 8;
    const handleLineWidth = width / 10;
    const handleTop = centery - handleLineWidth / 2;
    const handleBottom = centery + handleLineWidth / 2;

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

    ctx.fillStyle = HANDLE_COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(centerx, centery + width / 18, width / 4.7, width / 30, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    const handleGradient = ctx.createLinearGradient(0, handleTop, 0, handleBottom);
    handleGradient.addColorStop(0, HANDLE_COLORS.bodyTop);
    handleGradient.addColorStop(1, HANDLE_COLORS.bodyBottom);

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = handleGradient;
    ctx.lineWidth = handleLineWidth;
    ctx.shadowColor = 'rgba(27, 14, 11, 0.14)';
    ctx.shadowBlur = width / 55;
    ctx.shadowOffsetY = width / 110;

    ctx.beginPath();
    ctx.moveTo(handleLeft, centery);
    ctx.lineTo(handleRight, centery);
    ctx.closePath();

    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = HANDLE_COLORS.outline;
    ctx.lineWidth = Math.max(1.5, width / 125);
    ctx.beginPath();
    ctx.moveTo(handleLeft, handleTop);
    ctx.lineTo(handleRight, handleTop);
    ctx.moveTo(handleLeft, handleBottom);
    ctx.lineTo(handleRight, handleBottom);
    ctx.stroke();

    ctx.strokeStyle = HANDLE_COLORS.highlight;
    ctx.lineWidth = Math.max(1, width / 150);
    ctx.beginPath();
    ctx.moveTo(handleLeft + width / 60, centery - handleLineWidth * 0.18);
    ctx.lineTo(handleRight - width / 40, centery - handleLineWidth * 0.18);
    ctx.stroke();

    drawRivet(ctx, handleLeft, centery, width / 60);
    drawRivet(ctx, handleRight, centery, width / 60);

    drawHandleRing(ctx, centerx, centery, width);

    ctx.fillStyle = HANDLE_COLORS.ink;
    ctx.font = 'italic ' + fontSize + 'px Georgia';
    const textwidth = ctx.measureText('Versatile').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = HANDLE_COLORS.ink;
    ctx.fillText('Versatile', centerx - textwidth / 2, centery + fontSize * 1.7);

}

export function CleanV() {
    Blade.selected = null;
    blades = [];
}

export const descriptionV = [
    ``,
];

export const toolTipV = [
    ''
];
