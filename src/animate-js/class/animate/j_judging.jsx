const FONT_FAMILY = '"Fredericka the Great", "Times New Roman", serif';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DETACH_DISTANCE_RATIO = 0.17;
const LETTER_COLORS = [
    '#b3433d',
    '#2f6c9f',
    '#4d7a3c',
    '#8d5a2b',
    '#6d4aa1',
    '#2a7b72',
    '#ad6b1f',
];
const THEME = {
    backgroundTop: '#efe2c2',
    backgroundBottom: '#d8bc8e',
    board: '#a87b55',
    boardEdge: '#6d4a31',
    boardShadow: 'rgba(57, 35, 21, 0.22)',
    clip: '#b9bec5',
    clipDark: '#676d76',
    clipHighlight: 'rgba(255, 255, 255, 0.45)',
    paper: '#fff8ec',
    paperBack: '#f5ecd8',
    paperEdge: 'rgba(111, 82, 52, 0.18)',
    paperShadow: 'rgba(61, 40, 24, 0.17)',
    paperLine: 'rgba(84, 124, 170, 0.32)',
    marginLine: 'rgba(191, 102, 92, 0.34)',
    ink: '#34261a',
    accent: '#8a5a3b',
    hint: 'rgba(52, 38, 26, 0.62)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function approach(current, target, factor) {
    return current + (target - current) * factor;
}

function getLetter(index) {
    return LETTERS[((index % LETTERS.length) + LETTERS.length) % LETTERS.length];
}

function getNextLetterColor(previousColor) {
    const candidates = LETTER_COLORS.filter((color) => color !== previousColor);
    const pool = candidates.length > 0 ? candidates : LETTER_COLORS;
    return pool[Math.floor(Math.random() * pool.length)];
}

function createState(width, height) {
    return {
        width,
        height,
        currentIndex: LETTERS.indexOf('J'),
        currentLetterColor: LETTER_COLORS[0],
        stackDepth: 4,
        prevIsDown: false,
        grabbed: false,
        detached: false,
        detaching: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        paperOffsetX: 0,
        paperOffsetY: 0,
        releaseVelocityX: 0,
        releaseVelocityY: 0,
        releaseRotation: 0,
        paperRotation: 0,
        settleRotation: 0,
        frame: 0,
    };
}

function ensureState(width, height) {
    if (!judgingState || judgingState.width !== width || judgingState.height !== height) {
        judgingState = createState(width, height);
    }

    return judgingState;
}

function getMetrics(ctx, width, height) {
    const scale = Math.min(width, height);
    const boardWidth = Math.min(width * 0.62, scale * 1.02);
    const boardHeight = Math.min(height * 0.88, scale * 1.34);
    const boardX = (width - boardWidth) / 2;
    const boardY = (height - boardHeight) / 2 + height * 0.025;
    const paperWidth = boardWidth * 0.86;
    const paperHeight = boardHeight * 0.78;
    const paperX = width / 2 - paperWidth / 2;
    const paperY = boardY + boardHeight * 0.13;
    const lineGap = Math.max(18, paperHeight * 0.1);
    const paperTitleSize = clamp(scale * 0.062, 32, 58);
    const paperLetterSize = clamp(scale * 0.22, 100, 196);

    ctx.font = `700 ${paperTitleSize}px ${FONT_FAMILY}`;
    const planWidth = ctx.measureText('Plan').width;
    ctx.font = `700 ${paperLetterSize}px ${FONT_FAMILY}`;
    const letterWidth = ctx.measureText('W').width;

    return {
        width,
        height,
        centerX: width / 2,
        centerY: height / 2,
        boardX,
        boardY,
        boardWidth,
        boardHeight,
        boardRadius: boardWidth * 0.04,
        paperX,
        paperY,
        paperWidth,
        paperHeight,
        lineGap,
        paperTitleSize,
        paperLetterSize,
        paperTextY: paperY + paperHeight * 0.16,
        paperLetterY: paperY + paperHeight * 0.58,
        planWidth,
        letterWidth,
        detachDistance: Math.max(height, width) * DETACH_DISTANCE_RATIO,
        clipX: width / 2,
        clipY: boardY + boardHeight * 0.065,
        clipWidth: paperWidth * 0.26,
        clipHeight: boardHeight * 0.105,
        hintY: boardY + boardHeight * 0.92,
        boardTilt: -0.072,
    };
}

function getPaperRect(metrics) {
    return {
        left: metrics.paperX,
        top: metrics.paperY,
        right: metrics.paperX + metrics.paperWidth,
        bottom: metrics.paperY + metrics.paperHeight,
    };
}

function isPointInRect(point, rect) {
    return point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom;
}

function resetTopPaper(state) {
    state.grabbed = false;
    state.detached = false;
    state.detaching = false;
    state.dragOffsetX = 0;
    state.dragOffsetY = 0;
    state.paperOffsetX = 0;
    state.paperOffsetY = 0;
    state.releaseVelocityX = 0;
    state.releaseVelocityY = 0;
    state.releaseRotation = 0;
    state.paperRotation = 0;
}

function beginNextPaper(state) {
    state.currentIndex = (state.currentIndex + 1) % LETTERS.length;
    state.currentLetterColor = getNextLetterColor(state.currentLetterColor);
    resetTopPaper(state);
    state.settleRotation = 0;
}

function updateInteraction(state, metrics, movement) {
    state.frame += 1;

    const pointer = movement.mousePoint;
    const paperRect = getPaperRect(metrics);

    if (!state.prevIsDown && movement.isDown && !state.detached && isPointInRect(pointer, paperRect)) {
        state.grabbed = true;
        state.dragOffsetX = pointer.x - (metrics.paperX + state.paperOffsetX);
        state.dragOffsetY = pointer.y - (metrics.paperY + state.paperOffsetY);
        state.releaseVelocityX = 0;
        state.releaseVelocityY = 0;
    }

    if (movement.isDown && state.grabbed) {
        const previousX = state.paperOffsetX;
        const previousY = state.paperOffsetY;
        const targetX = pointer.x - metrics.paperX - state.dragOffsetX;
        const targetY = pointer.y - metrics.paperY - state.dragOffsetY;

        state.paperOffsetX = targetX;
        state.paperOffsetY = clamp(targetY, -metrics.boardHeight * 0.04, metrics.boardHeight * 0.72);
        state.releaseVelocityX = state.paperOffsetX - previousX;
        state.releaseVelocityY = state.paperOffsetY - previousY;

        const dragDistance = Math.hypot(state.paperOffsetX * 0.7, Math.max(0, state.paperOffsetY));
        state.paperRotation = clamp(state.paperOffsetX / metrics.paperWidth * 0.4, -0.26, 0.26);

        if (dragDistance >= metrics.detachDistance) {
            state.grabbed = false;
            state.detached = true;
            state.detaching = true;
            state.releaseVelocityX = clamp(state.releaseVelocityX * 1.1, -18, 18);
            state.releaseVelocityY = Math.max(12, state.releaseVelocityY + metrics.paperHeight * 0.015);
            state.releaseRotation = state.paperRotation;
        }
    }

    if (!movement.isDown && state.grabbed) {
        state.grabbed = false;
    }

    if (!state.grabbed && !state.detached) {
        state.paperOffsetX = approach(state.paperOffsetX, 0, 0.18);
        state.paperOffsetY = approach(state.paperOffsetY, 0, 0.18);
        state.paperRotation = approach(state.paperRotation, state.settleRotation, 0.12);
    }

    if (state.detached) {
        state.paperOffsetX += state.releaseVelocityX;
        state.paperOffsetY += state.releaseVelocityY;
        state.releaseVelocityX *= 0.992;
        state.releaseVelocityY += metrics.height * 0.0018;
        state.releaseRotation += state.releaseVelocityX / Math.max(metrics.paperWidth, 1) * 0.18;
        state.paperRotation = state.releaseRotation;

        if (state.paperOffsetY > metrics.height + metrics.paperHeight * 0.3) {
            beginNextPaper(state);
        }
    }

    state.prevIsDown = movement.isDown;
}

function drawBackground(ctx, width, height, metrics) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, THEME.backgroundTop);
    gradient.addColorStop(1, THEME.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
        metrics.centerX,
        metrics.boardY + metrics.boardHeight * 0.34,
        metrics.boardWidth * 0.08,
        metrics.centerX,
        metrics.centerY,
        Math.max(width, height) * 0.68
    );
    glow.addColorStop(0, 'rgba(255, 247, 230, 0.88)');
    glow.addColorStop(1, 'rgba(255, 247, 230, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
}

function roundedRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
}

function drawClipboard(ctx, metrics) {
    ctx.save();
    ctx.translate(metrics.centerX, metrics.centerY);
    ctx.rotate(metrics.boardTilt);
    ctx.translate(-metrics.centerX, -metrics.centerY);
    ctx.shadowColor = THEME.boardShadow;
    ctx.shadowBlur = metrics.boardWidth * 0.05;
    ctx.shadowOffsetY = metrics.boardHeight * 0.03;
    ctx.fillStyle = THEME.board;
    roundedRect(ctx, metrics.boardX, metrics.boardY, metrics.boardWidth, metrics.boardHeight, metrics.boardRadius);
    ctx.fill();

    ctx.strokeStyle = THEME.boardEdge;
    ctx.lineWidth = Math.max(2, metrics.boardWidth * 0.012);
    roundedRect(ctx, metrics.boardX, metrics.boardY, metrics.boardWidth, metrics.boardHeight, metrics.boardRadius);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 245, 227, 0.22)';
    ctx.lineWidth = Math.max(1.5, metrics.boardWidth * 0.004);
    roundedRect(
        ctx,
        metrics.boardX + metrics.boardWidth * 0.025,
        metrics.boardY + metrics.boardWidth * 0.025,
        metrics.boardWidth * 0.95,
        metrics.boardHeight * 0.95,
        metrics.boardRadius * 0.8
    );
    ctx.stroke();
    ctx.restore();
}

function drawClip(ctx, metrics) {
    ctx.save();
    ctx.translate(metrics.centerX, metrics.centerY);
    ctx.rotate(metrics.boardTilt);
    ctx.translate(-metrics.centerX, -metrics.centerY);
    const clipShadowY = metrics.clipY + metrics.clipHeight * 0.15;
    ctx.fillStyle = 'rgba(51, 33, 20, 0.18)';
    roundedRect(
        ctx,
        metrics.clipX - metrics.clipWidth * 0.56,
        clipShadowY,
        metrics.clipWidth * 1.12,
        metrics.clipHeight * 0.9,
        metrics.clipHeight * 0.26
    );
    ctx.fill();

    const clipGradient = ctx.createLinearGradient(0, metrics.clipY, 0, metrics.clipY + metrics.clipHeight);
    clipGradient.addColorStop(0, THEME.clipHighlight);
    clipGradient.addColorStop(0.42, THEME.clip);
    clipGradient.addColorStop(1, THEME.clipDark);
    ctx.fillStyle = clipGradient;
    roundedRect(
        ctx,
        metrics.clipX - metrics.clipWidth / 2,
        metrics.clipY,
        metrics.clipWidth,
        metrics.clipHeight,
        metrics.clipHeight * 0.28
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(89, 96, 106, 0.7)';
    roundedRect(
        ctx,
        metrics.clipX - metrics.clipWidth * 0.18,
        metrics.clipY - metrics.clipHeight * 0.38,
        metrics.clipWidth * 0.36,
        metrics.clipHeight * 0.86,
        metrics.clipHeight * 0.22
    );
    ctx.fill();
    ctx.restore();
}

function drawPaperSheet(ctx, metrics, letter, offsetX, offsetY, rotation, options = {}) {
    const x = metrics.paperX + offsetX;
    const y = metrics.paperY + offsetY;
    const scale = options.scale ?? 1;
    const paperWidth = metrics.paperWidth * scale;
    const paperHeight = metrics.paperHeight * scale;
    const lineGap = metrics.lineGap * scale;
    const lineStartX = paperWidth * 0.12;
    const lineEndX = paperWidth * 0.88;
    const foldSize = Math.min(paperWidth, paperHeight) * 0.14;
    const foldLeftX = paperWidth - foldSize;
    const foldTopY = paperHeight - foldSize;

    ctx.save();
    ctx.translate(metrics.centerX, metrics.centerY);
    ctx.rotate(metrics.boardTilt);
    ctx.translate(-metrics.centerX, -metrics.centerY);
    ctx.translate(x + paperWidth / 2, y + paperHeight / 2);
    ctx.rotate(rotation);
    ctx.translate(-paperWidth / 2, -paperHeight / 2);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(paperWidth, 0);
    ctx.lineTo(paperWidth, foldTopY);
    ctx.lineTo(foldLeftX, paperHeight);
    ctx.lineTo(0, paperHeight);
    ctx.closePath();

    ctx.shadowColor = THEME.paperShadow;
    ctx.shadowBlur = metrics.paperWidth * 0.05;
    ctx.shadowOffsetY = metrics.paperHeight * 0.025;
    ctx.fillStyle = options.fill ?? THEME.paper;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.strokeStyle = THEME.paperEdge;
    ctx.lineWidth = Math.max(1, metrics.paperWidth * 0.0035);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(paperWidth, 0);
    ctx.lineTo(paperWidth, foldTopY);
    ctx.lineTo(foldLeftX, paperHeight);
    ctx.lineTo(0, paperHeight);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = THEME.paperLine;
    ctx.lineWidth = 1;
    for (let yPos = paperHeight * 0.26; yPos < paperHeight * 0.9; yPos += lineGap) {
        ctx.beginPath();
        ctx.moveTo(lineStartX, Math.round(yPos) + 0.5);
        ctx.lineTo(lineEndX, Math.round(yPos) + 0.5);
        ctx.stroke();
    }

    ctx.fillStyle = '#efe3cb';
    ctx.beginPath();
    ctx.moveTo(foldLeftX, foldTopY);
    ctx.lineTo(paperWidth, foldTopY);
    ctx.lineTo(foldLeftX, paperHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(111, 82, 52, 0.22)';
    ctx.beginPath();
    ctx.moveTo(foldLeftX, foldTopY);
    ctx.lineTo(paperWidth - 0.5, foldTopY);
    ctx.lineTo(foldLeftX, paperHeight - 0.5);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = THEME.ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${metrics.paperTitleSize * scale}px ${FONT_FAMILY}`;
    ctx.fillText('Plan', paperWidth / 2, paperHeight * 0.14);

    ctx.fillStyle = options.letterColor ?? THEME.ink;
    ctx.font = `700 ${metrics.paperLetterSize * scale}px ${FONT_FAMILY}`;
    ctx.fillText(letter, paperWidth / 2, paperHeight * 0.55);

    ctx.restore();
}

function drawPaperStack(ctx, metrics, state) {
    for (let depth = state.stackDepth - 1; depth >= 0; depth -= 1) {
        const letter = getLetter(state.currentIndex + depth + 1);
        const spread = depth + 1;
        const offsetX = spread * metrics.paperWidth * 0.012;
        const offsetY = spread * metrics.paperHeight * 0.024;
        const rotation = spread * 0.012;

        drawPaperSheet(ctx, metrics, letter, offsetX, offsetY, rotation, {
            scale: 1 - spread * 0.015,
            fill: depth % 2 === 0 ? THEME.paperBack : '#f9f0de',
        });
    }

    drawPaperSheet(
        ctx,
        metrics,
        getLetter(state.currentIndex),
        state.paperOffsetX,
        state.paperOffsetY,
        state.paperRotation,
        {
            letterColor: state.currentLetterColor,
        }
    );
}

let judgingState = null;

export function AnimationJ(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height);

    updateInteraction(state, metrics, movement);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, width, height, metrics);
    drawClipboard(ctx, metrics);
    drawPaperStack(ctx, metrics, state);
    drawClip(ctx, metrics);

    ctx.restore();
}

export function CleanJ() {
    judgingState = null;
}

export const descriptionJ = [
    `MBTI J 성향답게 계획을 세우는 일을 꽤 좋아합니다.
    머릿속에 일단 큰 흐름이 잡혀 있어야 마음이 편한 편이고,
    해야 할 일이 생기면 자연스럽게 순서와 경우의 수를 먼저 정리하게 됩니다.`,
    `그렇다고 계획이 하나뿐인 건 아닙니다.
    Plan A가 틀어질 때를 대비한 Plan B,
    또 그다음 상황을 위한 Plan C까지 같이 적어 두는 편입니다.
    종이를 한 장 넘기면 바로 다음 계획이 나오는 이미지가 그래서 잘 어울린다고 느꼈습니다.`,
    `이번 인터랙션도 그런 모습을 담았습니다.
    클립보드의 종이를 직접 잡아 끌어내리면
    그 아래에서 다음 알파벳 계획표가 올라옵니다.
    Z까지 가면 다시 A부터 이어지도록 만들어 계획이 끝없이 이어지는 느낌을 넣었습니다.`
];

export const toolTipJ = [
    '클립보드 위의 종이를 잡아 아래로 끌어내려 보세요. 종이가 떨어지면 다음 계획표가 바로 나타납니다.',
    'Plan Z까지 뜯어낸 후에는 다시 Plan A로 돌아갑니다.'
];
