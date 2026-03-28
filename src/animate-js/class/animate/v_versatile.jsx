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

function createScratchCanvas(width, height, ctx) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height);
    }

    const canvas = ctx.canvas.ownerDocument.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function traceRoundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

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
        const bodyWidth = width / 20;
        const bodyLength = width / 5;
        const toothStartY = bodyLength * 0.5;
        const toothDepth = bodyWidth * 0.18;
        const toothOuterX = bodyWidth * 0.5;
        const toothInnerX = toothOuterX - toothDepth;
        const toothStep = width / 100;
        const toothCount = 8;
        const metalGradient = ctx.createLinearGradient(0, 0, 0, bodyLength + bodyWidth * 0.58);
        metalGradient.addColorStop(0, '#ece7de');
        metalGradient.addColorStop(0.44, '#b2b8bc');
        metalGradient.addColorStop(1, '#6a737a');

        ctx.fillStyle = metalGradient;
        ctx.shadowColor = 'rgba(29, 22, 18, 0.1)';
        ctx.shadowBlur = width / 80;
        ctx.shadowOffsetY = width / 120;

        ctx.beginPath();
        ctx.moveTo(-bodyWidth * 0.5, 0);
        ctx.lineTo(toothOuterX, 0);
        ctx.lineTo(toothOuterX, toothStartY);
        for (let i = 0; i < toothCount; i++) {
            const valleyY = toothStartY + toothStep * (i * 2 + 0.8);
            const peakY = toothStartY + toothStep * (i * 2 + 1.6);
            ctx.lineTo(toothInnerX, valleyY);
            ctx.lineTo(toothOuterX, peakY);
        }
        ctx.lineTo(-bodyWidth * 0.18, toothStartY + toothStep * (toothCount * 2 - 0.2));
        ctx.lineTo(-bodyWidth * 0.5, bodyLength * 0.8);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = Math.max(1, width / 180);
        ctx.beginPath();
        ctx.moveTo(bodyWidth * 0.12, bodyWidth * 0.12);
        ctx.lineTo(bodyWidth * 0.12, bodyLength * 0.82);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(104, 116, 126, 0.32)';
        ctx.lineWidth = Math.max(1, width / 175);
        ctx.beginPath();
        ctx.moveTo(0, bodyWidth * 0.22);
        ctx.lineTo(0, bodyLength * 0.86);
        ctx.stroke();
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
        const shaftWidth = width / 50;
        const shaftLength = width / 5;
        const shaftGradient = ctx.createLinearGradient(0, 0, 0, shaftLength);
        shaftGradient.addColorStop(0, '#ece7de');
        shaftGradient.addColorStop(0.42, '#b2b8bc');
        shaftGradient.addColorStop(1, '#6d7780');
        ctx.lineWidth = shaftWidth;
        ctx.strokeStyle = shaftGradient;
        ctx.shadowColor = 'rgba(29, 22, 18, 0.08)';
        ctx.shadowBlur = width / 110;
        ctx.shadowOffsetY = width / 130;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, shaftLength);
        ctx.closePath();
        ctx.stroke();

        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255,255,255,0.22)';
        ctx.lineWidth = Math.max(1, width / 190);
        ctx.beginPath();
        ctx.moveTo(shaftWidth * 0.12, shaftWidth * 0.2);
        ctx.lineTo(shaftWidth * 0.12, shaftLength * 0.9);
        ctx.stroke();

        const headTopY = shaftLength;
        const headShoulderY = headTopY + shaftWidth * 0.18;
        const headBottomY = headTopY + shaftWidth * 1.28;
        const headHalfTop = shaftWidth * 0.36;
        const headHalfMid = shaftWidth * 0.88;
        const headHalfBottom = shaftWidth * 0.76;
        const headGradient = ctx.createLinearGradient(0, headTopY, 0, headBottomY);
        headGradient.addColorStop(0, '#8ca0ab');
        headGradient.addColorStop(0.5, '#6f8793');
        headGradient.addColorStop(1, '#556a75');

        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.moveTo(-headHalfTop, headTopY);
        ctx.lineTo(headHalfTop, headTopY);
        ctx.lineTo(headHalfMid, headShoulderY);
        ctx.lineTo(headHalfBottom, headBottomY);
        ctx.lineTo(-headHalfBottom, headBottomY);
        ctx.lineTo(-headHalfMid, headShoulderY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = Math.max(1, width / 190);
        ctx.beginPath();
        ctx.moveTo(-headHalfTop * 0.2, headTopY + shaftWidth * 0.18);
        ctx.lineTo(-headHalfBottom * 0.1, headBottomY - shaftWidth * 0.22);
        ctx.stroke();

        ctx.restore();
    }
};

class BottleOpener extends Blade {
    draw(ctx, width, height) {
        const scratchCanvas = createScratchCanvas(width, height, ctx);
        const scratchCtx = scratchCanvas.getContext('2d');

        scratchCtx.save();
        scratchCtx.translate(this.xRatio * width, this.yRatio * height);
        scratchCtx.rotate(this.deg);

        // Draw the main body of the bottle opener
        scratchCtx.globalCompositeOperation = 'source-over';
        scratchCtx.lineCap = 'round';
        scratchCtx.lineJoin = 'round';
        scratchCtx.lineWidth = width / 20;
        const openerWidth = scratchCtx.lineWidth;
        const openerLength = width / 6;
        const joinRadius = openerWidth * 0.3;
        const endRadius = openerWidth * 0.18;
        const shaftRightX = openerWidth / 2;
        const leftX = -openerWidth / 2;
        const bottomY = openerLength + openerWidth / 2;
        const outlineWidth = Math.max(1.1, width / 150);
        const highlightWidth = Math.max(1, width / 185);
        const bodyGradient = scratchCtx.createLinearGradient(0, 0, 0, openerLength + openerWidth / 2);
        bodyGradient.addColorStop(0, '#ece7de');
        bodyGradient.addColorStop(0.42, '#b2b8bc');
        bodyGradient.addColorStop(1, '#6a737a');
        scratchCtx.fillStyle = bodyGradient;

        const traceBottleBody = () => {
            scratchCtx.beginPath();
            scratchCtx.moveTo(leftX, 0);
            scratchCtx.lineTo(shaftRightX, 0);
            scratchCtx.lineTo(shaftRightX, openerLength - joinRadius * 0.55);
            scratchCtx.quadraticCurveTo(
                shaftRightX,
                openerLength + openerWidth * 0.34,
                leftX + endRadius,
                bottomY
            );
            scratchCtx.arcTo(
                leftX,
                bottomY,
                leftX,
                bottomY - endRadius,
                endRadius
            );
            scratchCtx.closePath();
        };

        const hookSlotLeft = -1;
        const hookSlotTop = -openerWidth * 0.18;
        const hookSlotHeight = openerWidth * 0.34;
        const hookStemLeft = openerWidth * 0.2;
        const hookStemTop = -openerWidth * 0.62;
        const hookStemWidth = openerWidth * 0.26;
        const hookStemBottom = hookSlotTop + hookSlotHeight;
        const hookRadius = openerWidth * 0.13;

        const traceHookCutout = () => {
            scratchCtx.beginPath();
            scratchCtx.moveTo(hookSlotLeft - outlineWidth * 0.5, hookSlotTop + hookSlotHeight);
            scratchCtx.lineTo(hookStemLeft + hookStemWidth, hookStemBottom);
            scratchCtx.lineTo(hookStemLeft + hookStemWidth, hookStemTop + hookRadius);
            scratchCtx.lineTo(hookStemLeft + hookRadius, hookStemTop);
            scratchCtx.quadraticCurveTo(
                hookStemLeft,
                hookStemTop,
                hookStemLeft,
                hookStemTop + hookRadius
            );
            scratchCtx.lineTo(hookStemLeft, hookStemBottom - hookStemWidth);
            scratchCtx.lineTo(hookSlotLeft - outlineWidth * 0.5, hookSlotTop);
            scratchCtx.closePath();
        };

        const traceShaftCutout = () => {
            traceRoundedRect(
                scratchCtx,
                -openerWidth * 0.2,
                0,
                openerWidth * 0.45,
                width / 6 * 0.5,
                openerWidth * 0.3
            );
        };

        traceBottleBody();
        scratchCtx.fill();

        scratchCtx.strokeStyle = 'rgba(255,255,255,0.18)';
        scratchCtx.lineWidth = highlightWidth;
        scratchCtx.beginPath();
        scratchCtx.moveTo(-openerWidth * 0.05, openerWidth * 0.12);
        scratchCtx.lineTo(-openerWidth * 0.05, openerLength * 0.86);
        scratchCtx.stroke();

        // Draw the cutout(opening) of the hook part of the bottle opener
        scratchCtx.save();
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.lineCap = 'square';
        scratchCtx.lineJoin = 'miter';
        scratchCtx.translate(-openerWidth / 2, width / 6 * 0.9);
        traceHookCutout();
        scratchCtx.fill();
        scratchCtx.lineWidth = outlineWidth * 2;
        scratchCtx.stroke();

        scratchCtx.restore();

        // Draw the cutout of the shaft of the bottle opener
        scratchCtx.save();
        scratchCtx.globalCompositeOperation = 'destination-out';
        scratchCtx.translate(-openerWidth / 2, 0);
        traceShaftCutout();
        scratchCtx.fill();
        scratchCtx.lineWidth = outlineWidth * 2;
        scratchCtx.stroke();

        scratchCtx.restore();

        scratchCtx.restore();

        ctx.drawImage(scratchCanvas, 0, 0);
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
        const stemWidth = width / 20;
        const stemLength = width / 12;
        const screwWidth = stemWidth / 5;
        const stemGradient = ctx.createLinearGradient(0, 0, 0, stemLength);
        stemGradient.addColorStop(0, '#e7e3dc');
        stemGradient.addColorStop(0.42, '#b2b8bc');
        stemGradient.addColorStop(1, '#7c868e');
        const leadGradient = ctx.createLinearGradient(0, 0, 0, screwWidth);
        leadGradient.addColorStop(0, '#7c868e');
        leadGradient.addColorStop(1, '#8d989f');
        ctx.lineWidth = stemWidth;
        ctx.strokeStyle = stemGradient;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, stemLength);
        ctx.closePath();
        ctx.stroke();

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = screwWidth;
        ctx.save();
        ctx.translate(0, stemLength);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.lineWidth);
        ctx.closePath();
        ctx.strokeStyle = leadGradient;
        ctx.stroke();

        ctx.translate(0, ctx.lineWidth);

        ctx.strokeStyle = 'rgba(126, 138, 145, 0.9)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i));
            ctx.lineTo(-ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 1));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(163, 170, 174, 0.86)';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(-ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 1));
            ctx.lineTo(ctx.lineWidth * 5 / 3, ctx.lineWidth / 2 + ctx.lineWidth * (2 * i + 2));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(screwWidth * 5 / 3, screwWidth / 2);
        ctx.closePath();
        ctx.lineWidth = screwWidth;
        ctx.strokeStyle = 'rgba(163, 170, 174, 0.86)';
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

    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
    backgroundGradient.addColorStop(0, '#f3ede2');
    backgroundGradient.addColorStop(0.52, '#e2d5c1');
    backgroundGradient.addColorStop(1, '#c7b59b');
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, width, height);

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
