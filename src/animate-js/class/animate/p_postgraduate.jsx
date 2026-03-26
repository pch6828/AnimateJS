const RETRO_COLORS = {
    paper: '#d5e1dc',
    paperShade: '#adc1bb',
    checkerLight: 'rgba(239, 247, 243, 0.22)',
    checkerDark: 'rgba(83, 118, 113, 0.13)',
    sunOuter: 'rgba(212, 124, 53, 0.12)',
    sunInner: 'rgba(246, 197, 122, 0.75)',
    shadow: 'rgba(72, 41, 25, 0.16)',
    capTop: '#1f395e',
    capTopLight: '#355883',
    capTopDark: '#11243d',
    capEdge: '#0d1625',
    capBand: '#1a2f4b',
    capBandLight: '#2a466a',
    capBandShade: '#102238',
    button: '#f3d36d',
    tassel: '#dfb13f',
    tasselShade: '#b27f17',
    sparkle: 'rgba(255, 247, 220, 0.55)',
    typeFill: '#1f3840',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function lengthOf(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

function clampVector(dx, dy, maxLength) {
    const vectorLength = lengthOf(dx, dy);

    if (!vectorLength || vectorLength <= maxLength) {
        return { dx, dy };
    }

    const scale = maxLength / vectorLength;
    return {
        dx: dx * scale,
        dy: dy * scale,
    };
}

function createCapState(width, height) {
    return {
        width,
        height,
        homeXRatio: 0.5,
        homeYRatio: 0.43,
        xRatio: 0.5,
        yRatio: 0.43,
        velocityX: 0,
        velocityY: 0,
        angle: -0.08,
        spin: 0,
        pointerOffset: null,
        prevPointer: null,
        dragging: false,
        prevIsDown: false,
        frame: 0,
        flightFrames: 0,
        respawning: false,
        respawnProgress: 1,
        respawnDriftSeed: Math.random() * Math.PI * 2,
    };
}

function ensureState(width, height) {
    if (!graduationCapState || graduationCapState.width !== width || graduationCapState.height !== height) {
        graduationCapState = createCapState(width, height);
    }

    return graduationCapState;
}

function getMetrics(width, height) {
    const scale = Math.min(width, height);
    const capWidth = scale * 0.4;
    const capHeight = capWidth * 0.38;
    const bandWidth = capWidth * 0.52;
    const bandHeight = capHeight * 0.42;

    return {
        centerX: width / 2,
        centerY: height / 2,
        scale,
        capWidth,
        capHeight,
        bandWidth,
        bandHeight,
        titleSize: clamp(scale * 0.11, 42, 112),
        shadowWidth: capWidth * 0.64,
        shadowHeight: capHeight * 0.23,
        tasselLength: capHeight * 1.04,
    };
}

function buildCapPath(metrics) {
    const path = new Path2D();

    path.moveTo(0, -metrics.capHeight * 0.58);
    path.lineTo(metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    path.lineTo(0, metrics.capHeight * 0.42);
    path.lineTo(-metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    path.closePath();

    path.moveTo(-metrics.bandWidth * 0.36, metrics.capHeight * 0.18);
    path.lineTo(metrics.bandWidth * 0.36, metrics.capHeight * 0.18);
    path.lineTo(metrics.bandWidth * 0.5, metrics.capHeight * 0.62);
    path.lineTo(-metrics.bandWidth * 0.5, metrics.capHeight * 0.62);
    path.closePath();

    return path;
}

function traceCapTopShape(ctx, metrics) {
    ctx.moveTo(0, -metrics.capHeight * 0.58);
    ctx.lineTo(metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    ctx.lineTo(0, metrics.capHeight * 0.42);
    ctx.lineTo(-metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    ctx.closePath();
}

function traceCapBandShape(ctx, metrics) {
    ctx.moveTo(-metrics.bandWidth * 0.39, metrics.capHeight * 0.18);
    ctx.lineTo(metrics.bandWidth * 0.39, metrics.capHeight * 0.18);
    ctx.quadraticCurveTo(
        metrics.bandWidth * 0.48,
        metrics.capHeight * 0.3,
        metrics.bandWidth * 0.5,
        metrics.capHeight * 0.6
    );
    ctx.quadraticCurveTo(
        0,
        metrics.capHeight * 0.76,
        -metrics.bandWidth * 0.5,
        metrics.capHeight * 0.6
    );
    ctx.quadraticCurveTo(
        -metrics.bandWidth * 0.48,
        metrics.capHeight * 0.3,
        -metrics.bandWidth * 0.39,
        metrics.capHeight * 0.18
    );
    ctx.closePath();
}

function isCapGrabbed(ctx, movement, state, metrics) {
    const capPath = buildCapPath(metrics);

    ctx.save();
    ctx.translate(state.xRatio * state.width, state.yRatio * state.height);
    ctx.rotate(state.angle);
    const isHit = ctx.isPointInPath(capPath, movement.mousePoint.x, movement.mousePoint.y);
    ctx.restore();

    return isHit;
}

function resetCapState(state) {
    state.xRatio = state.homeXRatio;
    state.yRatio = -0.18;
    state.velocityX = 0;
    state.velocityY = 0;
    state.angle = -0.16;
    state.spin = 0;
    state.pointerOffset = null;
    state.prevPointer = null;
    state.dragging = false;
    state.flightFrames = 0;
    state.respawning = true;
    state.respawnProgress = 0;
    state.respawnDriftSeed = Math.random() * Math.PI * 2;
}

function updateCapState(ctx, state, metrics, movement) {
    state.frame += 1;
    const pointer = movement.mousePoint;
    const worldX = state.xRatio * state.width;
    const worldY = state.yRatio * state.height;

    if (movement.isDown) {
        if (!state.prevIsDown && isCapGrabbed(ctx, movement, state, metrics)) {
            state.dragging = true;
            state.pointerOffset = {
                x: pointer.x - worldX,
                y: pointer.y - worldY,
            };
            state.prevPointer = { x: pointer.x, y: pointer.y };
            state.velocityX = 0;
            state.velocityY = 0;
            state.spin = 0;
        }

        if (state.dragging && state.pointerOffset) {
            const targetX = pointer.x - state.pointerOffset.x;
            const targetY = pointer.y - state.pointerOffset.y;
            const dx = state.prevPointer ? pointer.x - state.prevPointer.x : 0;
            const dy = state.prevPointer ? pointer.y - state.prevPointer.y : 0;

            state.xRatio = clamp(targetX / state.width, -0.12, 1.12);
            state.yRatio = clamp(targetY / state.height, -0.12, 1.12);
            state.velocityX = dx / state.width;
            state.velocityY = dy / state.height;
            state.spin = clamp((dx / state.width) * 1.4 + (dy / state.height) * 0.4, -0.22, 0.22);
            state.angle = clamp(state.angle + state.spin * 0.8, -1.2, 1.2);
            state.prevPointer = { x: pointer.x, y: pointer.y };
        }
    } else if (state.prevIsDown && state.dragging) {
        state.dragging = false;
        state.pointerOffset = null;
        state.prevPointer = null;

        const speed = lengthOf(state.velocityX, state.velocityY);
        if (speed < 0.0035) {
            state.velocityX *= 0.35;
            state.velocityY = Math.max(state.velocityY * 0.35, 0.008);
            state.spin *= 0.4;
            state.flightFrames = 1;
        } else {
            const clampedVelocity = clampVector(
                state.velocityX * 1.55,
                state.velocityY * 1.55,
                0.038
            );
            state.velocityX = clampedVelocity.dx;
            state.velocityY = clampedVelocity.dy;
            state.spin = clamp(state.spin, -0.12, 0.12);
            state.flightFrames = 1;
        }
    }

    if (!state.dragging) {
        const speed = lengthOf(state.velocityX, state.velocityY);
        const isFlying = speed > 0.0008 || Math.abs(state.spin) > 0.0008 || state.flightFrames > 0;

        if (isFlying) {
            state.flightFrames += 1;
            state.xRatio += state.velocityX;
            state.yRatio += state.velocityY;
            state.velocityY += 0.0018;
            state.velocityX *= 0.992;
            state.velocityY *= 0.996;
            state.angle += state.spin;
            state.spin *= 0.992;
        } else if (state.respawning) {
            state.respawnProgress = clamp(state.respawnProgress + 0.012, 0, 1);

            const eased = 1 - Math.pow(1 - state.respawnProgress, 3);
            const sway = Math.sin(state.frame * 0.08 + state.respawnDriftSeed) * 0.018 * (1 - eased);
            const tilt = Math.sin(state.frame * 0.11 + state.respawnDriftSeed) * 0.16 * (1 - eased);

            state.xRatio = state.homeXRatio + sway;
            state.yRatio = lerp(-0.18, state.homeYRatio, eased);
            state.angle = -0.12 + tilt;
            state.spin = 0;

            if (state.respawnProgress >= 1) {
                state.respawning = false;
                state.xRatio = state.homeXRatio;
                state.yRatio = state.homeYRatio;
                state.angle = -0.08;
            }
        } else {
            state.xRatio = lerp(state.xRatio, state.homeXRatio, 0.08);
            state.yRatio = lerp(state.yRatio, state.homeYRatio, 0.08);
            state.angle = lerp(state.angle, -0.08 + Math.sin(state.frame * 0.035) * 0.045, 0.12);
            state.spin = lerp(state.spin, 0, 0.18);
            state.flightFrames = 0;
        }
    }

    state.prevIsDown = movement.isDown;

    if (
        state.xRatio < -0.22 ||
        state.xRatio > 1.22 ||
        state.yRatio < -0.28 ||
        state.yRatio > 1.22
    ) {
        resetCapState(state);
    }
}

function drawBackground(ctx, width, height, metrics) {
    const paperGradient = ctx.createLinearGradient(0, 0, 0, height);
    paperGradient.addColorStop(0, RETRO_COLORS.paper);
    paperGradient.addColorStop(1, RETRO_COLORS.paperShade);

    ctx.fillStyle = paperGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(metrics.centerX, metrics.centerY);
    ctx.rotate(-0.22);
    ctx.translate(-metrics.centerX, -metrics.centerY);

    const cellSize = Math.max(26, Math.round(Math.min(width, height) / 14));
    for (let row = -Math.ceil(height / cellSize); row < Math.ceil((height * 2) / cellSize); row++) {
        for (let col = -Math.ceil(width / cellSize); col < Math.ceil((width * 2) / cellSize); col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? RETRO_COLORS.checkerLight : RETRO_COLORS.checkerDark;
            ctx.fillRect(
                -width * 0.25 + col * cellSize,
                -height * 0.25 + row * cellSize,
                cellSize,
                cellSize
            );
        }
    }
    ctx.restore();
}

function drawTitle(ctx, metrics) {
    const titleY = metrics.centerY + metrics.capHeight * 1.44;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic 700 ${metrics.titleSize}px "Times New Roman", serif`;

    ctx.fillStyle = RETRO_COLORS.typeFill;
    ctx.fillText('Postgraduate', metrics.centerX, titleY);
    ctx.restore();
}

function drawShadow(ctx, state, metrics) {
    const x = state.xRatio * state.width;
    const y = state.yRatio * state.height;
    const wallY = metrics.centerY - metrics.capHeight * 0.08;
    const depthRatio = clamp((y - state.homeYRatio * state.height) / metrics.scale, -0.18, 0.22);
    const horizontalDrift = (x - metrics.centerX) * 0.16;
    const projectedX = metrics.centerX + horizontalDrift;
    const projectedY = wallY + (y - metrics.centerY) * 0.18;
    const widthScale = 0.92 + Math.max(0, depthRatio) * 0.45;
    const heightScale = 0.58 + Math.max(0, depthRatio) * 0.22;

    ctx.save();
    ctx.translate(projectedX, projectedY);
    ctx.rotate(state.angle * 0.2);
    ctx.scale(widthScale, heightScale);

    ctx.fillStyle = 'rgba(72, 41, 25, 0.085)';
    ctx.beginPath();
    traceCapTopShape(ctx, metrics);
    traceCapBandShape(ctx, metrics);
    ctx.fill();
    ctx.restore();
}

function drawCapTop(ctx, metrics) {
    ctx.strokeStyle = RETRO_COLORS.capEdge;
    ctx.lineWidth = Math.max(2, metrics.capWidth * 0.018);

    ctx.fillStyle = RETRO_COLORS.capTop;
    ctx.beginPath();
    traceCapTopShape(ctx, metrics);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = RETRO_COLORS.capTopLight;
    ctx.beginPath();
    ctx.moveTo(0, -metrics.capHeight * 0.58);
    ctx.lineTo(metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    ctx.lineTo(0, metrics.capHeight * 0.04);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = RETRO_COLORS.capTopDark;
    ctx.beginPath();
    ctx.moveTo(0, metrics.capHeight * 0.42);
    ctx.lineTo(metrics.capWidth * 0.56, -metrics.capHeight * 0.02);
    ctx.lineTo(0, metrics.capHeight * 0.04);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 247, 220, 0.22)';
    ctx.lineWidth = Math.max(1, metrics.capWidth * 0.008);
    ctx.beginPath();
    ctx.moveTo(-metrics.capWidth * 0.16, -metrics.capHeight * 0.22);
    ctx.lineTo(metrics.capWidth * 0.2, -metrics.capHeight * 0.08);
    ctx.stroke();
}

function drawCapBand(ctx, metrics) {
    ctx.fillStyle = RETRO_COLORS.capBand;
    ctx.beginPath();
    traceCapBandShape(ctx, metrics);
    ctx.fill();

    ctx.fillStyle = RETRO_COLORS.capBandLight;
    ctx.beginPath();
    ctx.moveTo(-metrics.bandWidth * 0.36, metrics.capHeight * 0.18);
    ctx.lineTo(metrics.bandWidth * 0.36, metrics.capHeight * 0.18);
    ctx.quadraticCurveTo(
        metrics.bandWidth * 0.4,
        metrics.capHeight * 0.26,
        metrics.bandWidth * 0.42,
        metrics.capHeight * 0.38
    );
    ctx.quadraticCurveTo(
        0,
        metrics.capHeight * 0.48,
        -metrics.bandWidth * 0.42,
        metrics.capHeight * 0.38
    );
    ctx.quadraticCurveTo(
        -metrics.bandWidth * 0.4,
        metrics.capHeight * 0.26,
        -metrics.bandWidth * 0.36,
        metrics.capHeight * 0.18
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = RETRO_COLORS.capBandShade;
    ctx.beginPath();
    ctx.moveTo(-metrics.bandWidth * 0.44, metrics.capHeight * 0.4);
    ctx.lineTo(metrics.bandWidth * 0.44, metrics.capHeight * 0.4);
    ctx.quadraticCurveTo(
        metrics.bandWidth * 0.48,
        metrics.capHeight * 0.48,
        metrics.bandWidth * 0.5,
        metrics.capHeight * 0.6
    );
    ctx.quadraticCurveTo(
        0,
        metrics.capHeight * 0.76,
        -metrics.bandWidth * 0.5,
        metrics.capHeight * 0.6
    );
    ctx.quadraticCurveTo(
        -metrics.bandWidth * 0.48,
        metrics.capHeight * 0.48,
        -metrics.bandWidth * 0.44,
        metrics.capHeight * 0.4
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = RETRO_COLORS.capEdge;
    ctx.lineWidth = Math.max(2, metrics.capWidth * 0.014);
    ctx.beginPath();
    traceCapBandShape(ctx, metrics);
    ctx.stroke();
}

function drawTassel(ctx, state, metrics) {
    const tasselSwing = state.dragging ? state.spin * 3.6 : Math.sin(state.frame * 0.09 + state.angle * 2) * 0.22 + state.spin * 2.8;

    ctx.save();
    ctx.translate(-metrics.capWidth * 0.25, -metrics.capHeight * 0.05);

    ctx.fillStyle = RETRO_COLORS.button;
    ctx.beginPath();
    ctx.arc(0, 0, metrics.capHeight * 0.11, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = RETRO_COLORS.tassel;
    ctx.lineWidth = Math.max(2, metrics.capWidth * 0.015);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
        -metrics.capWidth * 0.12 + tasselSwing * metrics.capWidth * 0.08,
        metrics.capHeight * 0.36,
        -metrics.capWidth * 0.05 + tasselSwing * metrics.capWidth * 0.16,
        metrics.tasselLength
    );
    ctx.stroke();

    const tasselX = -metrics.capWidth * 0.05 + tasselSwing * metrics.capWidth * 0.16;
    const tasselY = metrics.tasselLength;
    ctx.strokeStyle = RETRO_COLORS.tasselShade;
    ctx.lineWidth = Math.max(1.4, metrics.capWidth * 0.009);

    for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(tasselX, tasselY - metrics.capHeight * 0.06);
        ctx.lineTo(tasselX + i * metrics.capWidth * 0.01, tasselY + metrics.capHeight * 0.12);
        ctx.stroke();
    }

    ctx.restore();
}

function drawSparkles(ctx, state, metrics) {
    const sparkleAlpha = state.dragging || state.flightFrames > 0 ? 1 : 0.45;
    ctx.save();
    ctx.strokeStyle = RETRO_COLORS.sparkle;
    ctx.lineWidth = Math.max(1, metrics.capWidth * 0.008);

    const sparkles = [
        { x: metrics.capWidth * 0.46, y: -metrics.capHeight * 0.38, scale: 1.1 },
        { x: -metrics.capWidth * 0.44, y: metrics.capHeight * 0.1, scale: 0.8 },
        { x: metrics.capWidth * 0.1, y: -metrics.capHeight * 0.78, scale: 0.68 },
    ];

    sparkles.forEach((sparkle, index) => {
        const pulse = 0.8 + Math.sin(state.frame * 0.08 + index) * 0.18;
        const size = metrics.capHeight * 0.18 * sparkle.scale * pulse;
        ctx.globalAlpha = sparkleAlpha;
        ctx.beginPath();
        ctx.moveTo(sparkle.x - size, sparkle.y);
        ctx.lineTo(sparkle.x + size, sparkle.y);
        ctx.moveTo(sparkle.x, sparkle.y - size);
        ctx.lineTo(sparkle.x, sparkle.y + size);
        ctx.stroke();
    });

    ctx.restore();
}

function drawCap(ctx, state, metrics) {
    ctx.save();
    ctx.translate(state.xRatio * state.width, state.yRatio * state.height);
    ctx.rotate(state.angle);

    drawCapBand(ctx, metrics);
    drawTassel(ctx, state, metrics);
    drawCapTop(ctx, metrics);
    drawSparkles(ctx, state, metrics);

    ctx.restore();
}

let graduationCapState = null;

export function AnimationP(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(width, height);

    updateCapState(ctx, state, metrics, movement);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, width, height, metrics);
    drawShadow(ctx, state, metrics);
    drawTitle(ctx, metrics);
    drawCap(ctx, state, metrics);

    ctx.restore();
}

export function CleanP() {
    graduationCapState = null;
}

export const descriptionP = [
    'I wanted the page to focus on the mortarboard itself, with a cleaner and more natural graduation-cap silhouette.',
    'You can pick up the cap, swing it, and throw it like a real graduation toss.',
    'If it leaves the screen, it reappears from above and drifts down softly so the interaction can be repeated.'
];

export const toolTipP = [
    'Press and drag the mortarboard to pick it up.',
    'Release with speed to toss it like a graduation cap.',
    'If it leaves the screen, it resets to the center for another throw.'
];
