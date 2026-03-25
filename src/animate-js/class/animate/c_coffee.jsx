const COFFEE_TEXT = 'COFFEE';
const FONT_FAMILY = '"Big Shoulders Display", "Times New Roman", serif';
const RETRO_COLORS = {
    backgroundTop: '#74b7a6',
    backgroundBottom: '#4f8b7d',
    sunOuter: 'rgba(247, 202, 118, 0.18)',
    sunInner: 'rgba(248, 227, 179, 0.85)',
    stripe: 'rgba(255, 244, 214, 0.12)',
    mug: '#efe0b7',
    mugShade: '#d7c08f',
    mugOutline: '#4a2b1d',
    highlight: '#fff9ea',
    coffeeDark: '#4d2918',
    coffeeMid: '#74462b',
    coffeeLight: '#a96b34',
    saucer: '#f4e4be',
    saucerShadow: 'rgba(70, 38, 24, 0.22)',
    stream: '#8f5428',
    streamHighlight: 'rgba(248, 220, 179, 0.45)',
    shadow: 'rgba(37, 19, 12, 0.16)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function approach(current, target, factor) {
    return current + (target - current) * factor;
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        idleFrames: 0,
        level: 0.2,
        targetLevel: 0.2,
        streamY: 0,
        streamLength: 0,
        pressStrength: 0,
        ripple: 0,
        steamSeed: Math.random() * Math.PI * 2,
    };
}

function getMetrics(ctx, width, height) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = Math.min(height * 0.29, width * 0.24);

    ctx.font = `${fontSize}px ${FONT_FAMILY}`;
    const textWidth = ctx.measureText(COFFEE_TEXT).width;
    const mugLeft = centerx - textWidth / 2;
    const mugRight = centerx + textWidth / 2;

    return {
        centerx,
        centery,
        fontSize,
        textWidth,
        mugLeft,
        mugRight,
        textBaselineY: centery + fontSize * 0.09,
        cupTopY: centery - fontSize * 0.84,
        cupBottomY: centery + fontSize * 0.88,
        handleCenterX: mugRight + fontSize * 0.12,
        handleCenterY: centery - fontSize * 0.22,
        handleRadius: fontSize * 0.36,
        handleHoleRadius: fontSize * 0.2,
        saucerY: centery + fontSize * 1.1,
        saucerRadiusX: textWidth * 0.62,
        saucerRadiusY: fontSize * 0.18,
    };
}

function ensureState(width, height) {
    if (!coffeeState || coffeeState.width !== width || coffeeState.height !== height) {
        coffeeState = createState(width, height);
    }

    return coffeeState;
}

function updateState(state, metrics, movement) {
    state.frame += 1;

    if (movement.isDown) {
        state.idleFrames = 0;
        state.pressStrength = approach(state.pressStrength, 1, 0.2);
        state.streamLength = Math.min(state.streamLength + metrics.fontSize * 0.09, metrics.fontSize * 1.7);
        state.streamY = Math.min(state.streamY + metrics.fontSize * 0.11, metrics.cupTopY + metrics.fontSize * 0.32);
    } else {
        state.idleFrames += 1;
        state.pressStrength = approach(state.pressStrength, 0, 0.18);
        state.streamLength = Math.max(state.streamLength - metrics.fontSize * 0.08, 0);
        state.streamY = Math.max(state.streamY - metrics.fontSize * 0.04, 0);
    }

    const streamBottom = state.streamY;
    const contactY = metrics.cupTopY + metrics.fontSize * 0.24;
    const isContacting = state.pressStrength > 0.08 && streamBottom >= contactY;

    if (isContacting) {
        state.targetLevel = clamp(state.targetLevel + 0.008 + state.pressStrength * 0.004, 0.16, 0.82);
        state.ripple = clamp(state.ripple + 0.055, 0, 1.2);
    } else if (state.idleFrames > 65) {
        const decay = state.idleFrames > 140 ? 0.004 : 0.0022;
        state.targetLevel = clamp(state.targetLevel - decay, 0.14, 0.82);
    }

    state.level = approach(state.level, state.targetLevel, movement.isDown ? 0.05 : 0.028);
    state.ripple *= movement.isDown ? 0.94 : 0.965;
}

function drawBackground(ctx, width, height, metrics, frame) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, RETRO_COLORS.backgroundTop);
    gradient.addColorStop(1, RETRO_COLORS.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = RETRO_COLORS.stripe;
    const stripeGap = Math.max(18, Math.round(height / 20));
    for (let y = -stripeGap; y < height + stripeGap; y += stripeGap) {
        ctx.fillRect(0, y, width, 2);
    }

    const sunRadius = Math.min(width, height) * 0.26;
    const sunGradient = ctx.createRadialGradient(
        metrics.centerx,
        metrics.centery - metrics.fontSize * 0.42,
        sunRadius * 0.25,
        metrics.centerx,
        metrics.centery - metrics.fontSize * 0.42,
        sunRadius
    );
    sunGradient.addColorStop(0, RETRO_COLORS.sunInner);
    sunGradient.addColorStop(1, RETRO_COLORS.sunOuter);
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(metrics.centerx, metrics.centery - metrics.fontSize * 0.42, sunRadius, 0, Math.PI * 2);
    ctx.fill();
}

function drawSaucer(ctx, metrics) {
    ctx.fillStyle = RETRO_COLORS.saucerShadow;
    ctx.beginPath();
    ctx.ellipse(
        metrics.centerx,
        metrics.saucerY + metrics.fontSize * 0.08,
        metrics.saucerRadiusX * 1.02,
        metrics.saucerRadiusY * 0.9,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = RETRO_COLORS.saucer;
    ctx.strokeStyle = RETRO_COLORS.mugOutline;
    ctx.lineWidth = Math.max(2, metrics.fontSize * 0.025);
    ctx.beginPath();
    ctx.ellipse(metrics.centerx, metrics.saucerY, metrics.saucerRadiusX, metrics.saucerRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(74, 43, 29, 0.18)';
    ctx.lineWidth = Math.max(1.5, metrics.fontSize * 0.012);
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(
            metrics.centerx,
            metrics.saucerY,
            metrics.saucerRadiusX * (0.68 + i * 0.04),
            metrics.saucerRadiusY * (0.36 + Math.abs(i) * 0.04),
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }
}

function drawMugSilhouette(ctx, metrics) {
    ctx.fillStyle = RETRO_COLORS.mugShade;
    ctx.beginPath();
    ctx.arc(
        metrics.handleCenterX,
        metrics.handleCenterY,
        metrics.handleRadius,
        Math.PI / 2,
        -Math.PI / 2,
        true
    );
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = RETRO_COLORS.mug;
    ctx.beginPath();
    ctx.arc(
        metrics.handleCenterX,
        metrics.handleCenterY,
        metrics.handleRadius * 0.9,
        Math.PI / 2,
        -Math.PI / 2,
        true
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(metrics.handleCenterX, metrics.handleCenterY, metrics.handleHoleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = RETRO_COLORS.mug;
    ctx.font = `${metrics.fontSize}px ${FONT_FAMILY}`;
    ctx.fillText(COFFEE_TEXT, metrics.mugLeft, metrics.textBaselineY);

    ctx.beginPath();
    ctx.arc(metrics.centerx, metrics.textBaselineY, metrics.textWidth / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(
        metrics.mugRight - metrics.fontSize * 0.02,
        metrics.textBaselineY - metrics.fontSize * 0.7,
        metrics.fontSize * 0.18,
        metrics.fontSize * 0.78
    );
}

function drawCoffeeFill(ctx, metrics, state) {
    const fillHeight = (metrics.cupBottomY - metrics.cupTopY) * state.level;
    const liquidY = metrics.cupBottomY - fillHeight;
    const waveAmplitude = metrics.fontSize * (0.018 + state.ripple * 0.018);
    const innerLeft = metrics.mugLeft + metrics.fontSize * 0.08;
    const innerRight = metrics.mugRight - metrics.fontSize * 0.08;
    const bowlRadius = metrics.textWidth / 2 - metrics.fontSize * 0.08;
    const bowlCenterY = metrics.textBaselineY;
    const bottomY = bowlCenterY + bowlRadius;
    const liquidGradient = ctx.createLinearGradient(0, liquidY, 0, metrics.cupBottomY);
    liquidGradient.addColorStop(0, RETRO_COLORS.coffeeLight);
    liquidGradient.addColorStop(0.36, RETRO_COLORS.coffeeMid);
    liquidGradient.addColorStop(1, RETRO_COLORS.coffeeDark);

    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = liquidGradient;
    ctx.beginPath();
    if (liquidY >= bowlCenterY) {
        const circleOffset = clamp((liquidY - bowlCenterY) / bowlRadius, 0, 1);
        const theta = Math.asin(circleOffset);
        const surfaceLeft = metrics.centerx - Math.cos(theta) * bowlRadius;
        const surfaceRight = metrics.centerx + Math.cos(theta) * bowlRadius;

        ctx.moveTo(surfaceLeft, liquidY);
        for (let step = 0; step <= 6; step++) {
            const ratio = step / 6;
            const x = surfaceLeft + (surfaceRight - surfaceLeft) * ratio;
            const sway = Math.sin(state.frame * 0.08 + ratio * 4.2 + state.steamSeed) * waveAmplitude;
            const y = liquidY + sway;
            ctx.lineTo(x, y);
        }
        ctx.arc(metrics.centerx, bowlCenterY, bowlRadius, theta, Math.PI - theta, false);
    } else {
        ctx.moveTo(innerLeft, bottomY);
        ctx.lineTo(innerLeft, liquidY);

        for (let step = 0; step <= 6; step++) {
            const ratio = step / 6;
            const x = innerLeft + (innerRight - innerLeft) * ratio;
            const sway = Math.sin(state.frame * 0.08 + ratio * 4.2 + state.steamSeed) * waveAmplitude;
            const y = liquidY + sway;
            ctx.lineTo(x, y);
        }

        ctx.lineTo(innerRight, bottomY);
        ctx.arc(metrics.centerx, bowlCenterY, bowlRadius, 0, Math.PI, false);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(223, 187, 134, ${0.28 + state.ripple * 0.12})`;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
        const ratio = (i + 0.5) / 4;
        const x = innerLeft + (innerRight - innerLeft) * ratio;
        const y = liquidY + Math.sin(state.frame * 0.09 + i * 0.9) * waveAmplitude * 1.8;
        ctx.moveTo(x - metrics.fontSize * 0.06, y);
        ctx.arc(x, y, metrics.fontSize * 0.035, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

function drawMugOutline(ctx, metrics) {
    ctx.strokeStyle = RETRO_COLORS.mugOutline;
    ctx.lineWidth = Math.max(2.5, metrics.fontSize * 0.03);
    ctx.font = `${metrics.fontSize}px ${FONT_FAMILY}`;
    ctx.strokeText(COFFEE_TEXT, metrics.mugLeft, metrics.textBaselineY);

    ctx.beginPath();
    ctx.arc(metrics.centerx, metrics.textBaselineY, metrics.textWidth / 2, 0, Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
        metrics.handleCenterX,
        metrics.handleCenterY,
        metrics.handleRadius * 0.9,
        Math.PI / 2,
        -Math.PI / 2,
        true
    );
    ctx.stroke();

    ctx.strokeStyle = RETRO_COLORS.highlight;
    ctx.lineWidth = Math.max(1.5, metrics.fontSize * 0.014);
    ctx.beginPath();
    ctx.moveTo(metrics.mugLeft + metrics.fontSize * 0.1, metrics.cupTopY + metrics.fontSize * 0.18);
    ctx.lineTo(metrics.mugLeft + metrics.textWidth * 0.26, metrics.cupTopY + metrics.fontSize * 0.08);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(metrics.mugLeft + metrics.fontSize * 0.22, metrics.textBaselineY + metrics.fontSize * 0.5);
    ctx.lineTo(metrics.mugLeft + metrics.textWidth * 0.18, metrics.textBaselineY + metrics.fontSize * 0.72);
    ctx.stroke();
}

function drawSteam(ctx, metrics, state) {
    if (state.level < 0.2) {
        return;
    }

    ctx.strokeStyle = 'rgba(255, 249, 234, 0.35)';
    ctx.lineWidth = Math.max(1.2, metrics.fontSize * 0.01);

    for (let i = 0; i < 3; i++) {
        const startX = metrics.centerx + (i - 1) * metrics.fontSize * 0.22;
        const startY = metrics.cupTopY + metrics.fontSize * 0.18;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        for (let step = 1; step <= 4; step++) {
            const y = startY - step * metrics.fontSize * 0.18;
            const sway = Math.sin(state.frame * 0.05 + i + step * 0.8 + state.steamSeed) * metrics.fontSize * 0.04;
            ctx.quadraticCurveTo(startX + sway, y + metrics.fontSize * 0.04, startX + sway * 1.2, y);
        }

        ctx.stroke();
    }
}

function drawStream(ctx, metrics, state) {
    if (state.streamLength <= 0 || state.pressStrength <= 0.03) {
        return;
    }

    const fillHeight = (metrics.cupBottomY - metrics.cupTopY) * state.level;
    const liquidY = metrics.cupBottomY - fillHeight;
    const startX = metrics.centerx + Math.sin(state.frame * 0.11) * metrics.fontSize * 0.015;
    const tipX = metrics.centerx + Math.sin(state.frame * 0.08) * metrics.fontSize * 0.022;
    const streamWidth = metrics.fontSize * (0.045 + state.pressStrength * 0.03);
    const topY = -metrics.fontSize * 0.12;
    const entryY = metrics.cupTopY + metrics.fontSize * 0.12;
    const innerEndY = Math.min(liquidY + metrics.fontSize * 0.04, metrics.cupBottomY - metrics.fontSize * 0.1);

    ctx.strokeStyle = RETRO_COLORS.stream;
    ctx.lineWidth = streamWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, topY);
    ctx.bezierCurveTo(
        startX - metrics.fontSize * 0.015,
        topY + metrics.fontSize * 0.35,
        tipX + metrics.fontSize * 0.02,
        entryY - metrics.fontSize * 0.22,
        tipX,
        entryY
    );
    ctx.stroke();

    ctx.strokeStyle = RETRO_COLORS.streamHighlight;
    ctx.lineWidth = streamWidth * 0.22;
    ctx.beginPath();
    ctx.moveTo(startX - streamWidth * 0.08, topY + metrics.fontSize * 0.08);
    ctx.bezierCurveTo(
        startX - metrics.fontSize * 0.015,
        topY + metrics.fontSize * 0.34,
        tipX,
        entryY - metrics.fontSize * 0.2,
        tipX - streamWidth * 0.05,
        entryY - metrics.fontSize * 0.02
    );
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(
        metrics.mugLeft + metrics.fontSize * 0.08,
        metrics.cupTopY + metrics.fontSize * 0.08,
        metrics.textWidth - metrics.fontSize * 0.16,
        metrics.cupBottomY - metrics.cupTopY
    );
    ctx.clip();

    ctx.strokeStyle = RETRO_COLORS.stream;
    ctx.lineWidth = streamWidth * 0.72;
    ctx.beginPath();
    ctx.moveTo(tipX, entryY - metrics.fontSize * 0.02);
    ctx.quadraticCurveTo(
        metrics.centerx + Math.sin(state.frame * 0.06) * metrics.fontSize * 0.025,
        (entryY + innerEndY) / 2,
        metrics.centerx,
        innerEndY
    );
    ctx.stroke();

    ctx.strokeStyle = RETRO_COLORS.streamHighlight;
    ctx.lineWidth = streamWidth * 0.16;
    ctx.beginPath();
    ctx.moveTo(tipX - streamWidth * 0.04, entryY);
    ctx.quadraticCurveTo(
        metrics.centerx,
        (entryY + innerEndY) / 2,
        metrics.centerx - streamWidth * 0.04,
        innerEndY - metrics.fontSize * 0.02
    );
    ctx.stroke();
    ctx.restore();

    if (state.pressStrength > 0.2) {
        ctx.fillStyle = `rgba(255, 240, 214, ${0.14 + state.ripple * 0.1})`;
        ctx.beginPath();
        ctx.ellipse(
            metrics.centerx,
            liquidY + metrics.fontSize * 0.01,
            metrics.fontSize * (0.06 + state.ripple * 0.018),
            metrics.fontSize * 0.018,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

let coffeeState = null;

export function AnimationC(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height);

    updateState(state, metrics, movement);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, width, height, metrics, state.frame);
    drawSaucer(ctx, metrics);

    ctx.fillStyle = RETRO_COLORS.shadow;
    ctx.beginPath();
    ctx.ellipse(
        metrics.centerx,
        metrics.saucerY - metrics.fontSize * 0.12,
        metrics.textWidth * 0.4,
        metrics.fontSize * 0.12,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    drawMugSilhouette(ctx, metrics);
    drawCoffeeFill(ctx, metrics, state);
    drawMugOutline(ctx, metrics);
    drawSteam(ctx, metrics, state);
    drawStream(ctx, metrics, state);

    ctx.restore();
}

export function CleanC() {
    coffeeState = null;
}
