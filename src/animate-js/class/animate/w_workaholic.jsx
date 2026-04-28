const TITLE_TEXT = 'Workaholic';
const FALLING_TEXT = 'work';
const TITLE_FONT_FAMILY = '"Cormorant Garamond", "Times New Roman", serif';
const BLOCK_FONT_FAMILY = '"Georgia", "Times New Roman", serif';
const BLOCK_COLORS = ['#2b4b73', '#6f3b2c', '#8a5a22', '#5f4859', '#285246'];
const PALETTE = {
    skyTop: '#f3ead7',
    skyBottom: '#d4b995',
    haze: 'rgba(255, 248, 231, 0.42)',
    stripe: 'rgba(120, 84, 53, 0.08)',
    floorTop: '#866445',
    floorFront: '#5b412d',
    floorShadow: 'rgba(43, 25, 16, 0.22)',
    stageLight: 'rgba(255, 240, 217, 0.3)',
    titleFill: '#24140d',
    titleStroke: '#fff2dd',
    titleShadow: 'rgba(56, 32, 20, 0.18)',
    titleHighlight: 'rgba(255, 248, 232, 0.45)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function randomRange(min, max) {
    return lerp(min, max, Math.random());
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        nextId: 0,
        titleX: width / 2,
        titleVelocity: 0,
        spawnCountdown: 0,
        blocks: [],
        lastReleaseFrame: -999,
    };
}

function ensureState(width, height) {
    if (!workaholicState || workaholicState.width !== width || workaholicState.height !== height) {
        workaholicState = createState(width, height);
    }

    return workaholicState;
}

function getMetrics(ctx, width, height, state) {
    const scale = Math.min(width, height);
    const titleFontSize = clamp(scale * 0.115, 54, 142);
    const floorY = height * 0.84;
    const floorThickness = clamp(scale * 0.08, 34, 88);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic 700 ${titleFontSize}px ${TITLE_FONT_FAMILY}`;

    const titleWidth = ctx.measureText(TITLE_TEXT).width;
    const titleHeight = titleFontSize * 0.72;
    const titleCenterY = floorY - titleHeight * 0.42;
    const titleTopY = titleCenterY - titleHeight * 0.66;

    return {
        width,
        height,
        scale,
        centerX: width / 2,
        centerY: height / 2,
        floorY,
        floorThickness,
        titleFontSize,
        titleWidth,
        titleHeight,
        titleCenterY,
        titleTopY,
        spawnIntervalMin: 8,
        spawnIntervalMax: 18,
        gravity: clamp(scale * 0.00078, 1.2, 2.6),
        releaseThreshold: titleWidth * 0.0045,
        maxBlocks: 52,
    };
}

function getTitleSupportRect(metrics, state) {
    const supportInset = metrics.titleWidth * 0.1;
    const supportWidth = metrics.titleWidth - supportInset * 2;
    const supportHeight = metrics.titleHeight * 0.86;

    return {
        left: state.titleX - supportWidth / 2,
        right: state.titleX + supportWidth / 2,
        top: metrics.titleTopY,
        bottom: metrics.titleTopY + supportHeight,
        width: supportWidth,
        height: supportHeight,
    };
}

function getTextMetrics(ctx, word, fontSize, fontFamily) {
    ctx.font = `italic 700 ${fontSize}px ${fontFamily}`;
    const width = ctx.measureText(word).width;

    return {
        width,
        height: fontSize * 0.58,
    };
}

function createBlock(ctx, metrics, state) {
    const fontSize = randomRange(metrics.titleFontSize * 0.42, metrics.titleFontSize * 0.84);
    const size = getTextMetrics(ctx, FALLING_TEXT, fontSize, BLOCK_FONT_FAMILY);
    const spawnPadding = size.width * 0.65;

    return {
        id: state.nextId++,
        x: randomRange(spawnPadding, metrics.width - spawnPadding),
        y: -fontSize,
        prevY: -fontSize,
        vx: randomRange(-metrics.titleFontSize * 0.01, metrics.titleFontSize * 0.01),
        vy: randomRange(metrics.gravity * 0.35, metrics.gravity * 0.8),
        angle: randomRange(-0.08, 0.08),
        angularVelocity: randomRange(-0.007, 0.007),
        fontSize,
        width: size.width,
        height: size.height,
        color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
        resting: false,
        supportType: null,
        supportId: null,
    };
}

function getSupportRoot(blockMap, block) {
    let current = block;
    let guard = 0;

    while (current && current.supportType === 'block' && guard < 24) {
        current = blockMap.get(current.supportId);
        guard += 1;
    }

    return current ? current.supportType : null;
}

function wakeBlock(block, vx, vy, spin) {
    block.resting = false;
    block.supportType = null;
    block.supportId = null;
    block.vx = vx;
    block.vy = vy;
    block.angularVelocity = spin;
}

function nudgeNearbyBlocks(state, metrics, originBlock, intensity) {
    for (const block of state.blocks) {
        if (!block.resting || block.id === originBlock.id) {
            continue;
        }

        const dx = block.x - originBlock.x;
        const dy = block.y - originBlock.y;
        const distanceX = Math.abs(dx);
        const distanceY = Math.abs(dy);

        if (distanceX > originBlock.width * 0.9 || distanceY > metrics.titleFontSize * 0.55) {
            continue;
        }

        const push = intensity * (dx === 0 ? (Math.random() > 0.5 ? 1 : -1) : Math.sign(dx));
        wakeBlock(
            block,
            push * randomRange(0.25, 0.55),
            -Math.abs(intensity) * randomRange(0.16, 0.28),
            push * randomRange(0.006, 0.014),
        );
    }
}

function releaseBlocksFromTitleMotion(state, metrics) {
    if (Math.abs(state.titleVelocity) < metrics.releaseThreshold || state.frame - state.lastReleaseFrame < 5) {
        return;
    }

    const blockMap = new Map(state.blocks.map((block) => [block.id, block]));
    state.lastReleaseFrame = state.frame;

    for (const block of state.blocks) {
        if (!block.resting) {
            continue;
        }

        const root = getSupportRoot(blockMap, block);
        const direction = block.x >= state.titleX ? 1 : -1;

        if (root === 'title') {
            wakeBlock(
                block,
                state.titleVelocity * 0.95 + direction * randomRange(0.4, 1.3),
                -randomRange(1.2, 2.2),
                direction * randomRange(0.01, 0.03),
            );
            continue;
        }

        const touchingFloor = block.supportType === 'floor' &&
            Math.abs(block.y + block.height / 2 - metrics.floorY) < metrics.titleFontSize * 0.08;
        const closeToTitle = Math.abs(block.x - state.titleX) < metrics.titleWidth * 0.58;

        if (touchingFloor && closeToTitle) {
            wakeBlock(
                block,
                state.titleVelocity * 0.75 + direction * randomRange(0.3, 0.95),
                -randomRange(0.7, 1.35),
                direction * randomRange(0.006, 0.02),
            );
        }
    }
}

function hasHorizontalSupport(block, supportLeft, supportRight) {
    const overlapLeft = Math.max(block.x - block.width / 2, supportLeft);
    const overlapRight = Math.min(block.x + block.width / 2, supportRight);
    const overlap = overlapRight - overlapLeft;

    return overlap >= block.width * 0.28;
}

function hasValidSupport(block, state, metrics, blockMap) {
    const bottom = block.y + block.height / 2;

    if (block.supportType === 'floor') {
        return Math.abs(bottom - metrics.floorY) < metrics.titleFontSize * 0.06;
    }

    if (block.supportType === 'title') {
        const rect = getTitleSupportRect(metrics, state);
        return Math.abs(bottom - rect.top) < metrics.titleFontSize * 0.06 &&
            hasHorizontalSupport(block, rect.left, rect.right);
    }

    if (block.supportType === 'block') {
        const supportBlock = blockMap.get(block.supportId);

        if (!supportBlock || !supportBlock.resting) {
            return false;
        }

        const top = supportBlock.y - supportBlock.height / 2;
        return Math.abs(bottom - top) < metrics.titleFontSize * 0.06 &&
            hasHorizontalSupport(
                block,
                supportBlock.x - supportBlock.width / 2,
                supportBlock.x + supportBlock.width / 2,
            );
    }

    return false;
}

function settleBlock(block, support, impactSpeed) {
    block.y = support.topY - block.height / 2;
    block.prevY = block.y;
    block.vx = 0;
    block.vy = 0;
    block.angle = clamp(block.angle, -0.16, 0.16);
    block.angularVelocity = 0;
    block.resting = true;
    block.supportType = support.type;
    block.supportId = support.id;

    return impactSpeed;
}

function findSupport(state, metrics, block, blockMap) {
    const prevBottom = block.prevY + block.height / 2;
    const currentBottom = block.y + block.height / 2;
    const crossingTolerance = metrics.titleFontSize * 0.08;
    const supports = [];

    if (prevBottom <= metrics.floorY + crossingTolerance && currentBottom >= metrics.floorY) {
        supports.push({
            type: 'floor',
            id: null,
            topY: metrics.floorY,
        });
    }

    const titleRect = getTitleSupportRect(metrics, state);
    if (
        prevBottom <= titleRect.top + crossingTolerance &&
        currentBottom >= titleRect.top &&
        hasHorizontalSupport(block, titleRect.left, titleRect.right)
    ) {
        supports.push({
            type: 'title',
            id: null,
            topY: titleRect.top,
        });
    }

    for (const candidate of state.blocks) {
        if (candidate.id === block.id || !candidate.resting) {
            continue;
        }

        const topY = candidate.y - candidate.height / 2;
        if (
            prevBottom <= topY + crossingTolerance &&
            currentBottom >= topY &&
            hasHorizontalSupport(
                block,
                candidate.x - candidate.width / 2,
                candidate.x + candidate.width / 2,
            )
        ) {
            supports.push({
                type: 'block',
                id: candidate.id,
                topY,
            });
        }
    }

    if (!supports.length) {
        return null;
    }

    supports.sort((a, b) => a.topY - b.topY);
    return supports[0];
}

function updateTitle(state, metrics, movement) {
    const hasPointer = movement.isDown || movement.mousePoint.x > 0 || movement.mousePoint.y > 0;
    const pointerX = hasPointer ? movement.mousePoint.x : metrics.centerX;
    const nextTarget = clamp(pointerX, metrics.titleWidth * 0.56, metrics.width - metrics.titleWidth * 0.56);
    const nextX = lerp(state.titleX, nextTarget, 0.18);

    state.titleVelocity = nextX - state.titleX;
    state.titleX = nextX;
}

function spawnBlocks(ctx, state, metrics) {
    state.spawnCountdown -= 1;
    if (state.spawnCountdown > 0) {
        return;
    }

    state.spawnCountdown = Math.ceil(randomRange(metrics.spawnIntervalMin, metrics.spawnIntervalMax));
    state.blocks.push(createBlock(ctx, metrics, state));
}

function updateBlocks(state, metrics) {
    const blockMap = new Map(state.blocks.map((block) => [block.id, block]));

    for (const block of state.blocks) {
        if (block.resting) {
            if (!hasValidSupport(block, state, metrics, blockMap)) {
                wakeBlock(
                    block,
                    state.titleVelocity * 0.65 + randomRange(-0.25, 0.25),
                    -randomRange(0.3, 0.8),
                    randomRange(-0.01, 0.01),
                );
            }
            continue;
        }

        block.prevY = block.y;
        block.vy += metrics.gravity;
        block.x += block.vx;
        block.y += block.vy;
        block.angle += block.angularVelocity;

        block.vx *= 0.996;
        block.angularVelocity *= 0.995;

        const wallPadding = block.width * 0.52;
        if (block.x < wallPadding) {
            block.x = wallPadding;
            block.vx = Math.abs(block.vx) * 0.45;
        } else if (block.x > metrics.width - wallPadding) {
            block.x = metrics.width - wallPadding;
            block.vx = -Math.abs(block.vx) * 0.45;
        }

        const support = findSupport(state, metrics, block, blockMap);
        if (!support) {
            continue;
        }

        const impactSpeed = settleBlock(block, support, block.vy);
        if (impactSpeed > metrics.gravity * 2.2) {
            nudgeNearbyBlocks(state, metrics, block, impactSpeed * 0.65);
        }
    }

    state.blocks = state.blocks.filter((block) => {
        const offscreenBottom = block.y - block.height / 2 > metrics.height + metrics.titleFontSize * 2.2;
        return !offscreenBottom;
    });

    if (state.blocks.length <= metrics.maxBlocks) {
        return;
    }

    const blockMapAfterUpdate = new Map(state.blocks.map((block) => [block.id, block]));
    const removable = state.blocks.filter((block) => {
        const root = getSupportRoot(blockMapAfterUpdate, block);
        return root === 'floor' && Math.abs(block.x - state.titleX) > metrics.titleWidth * 0.95;
    });

    removable.sort((a, b) => a.id - b.id);
    while (state.blocks.length > metrics.maxBlocks && removable.length) {
        const target = removable.shift();
        state.blocks = state.blocks.filter((block) => block.id !== target.id && block.supportId !== target.id);
    }
}

function drawBackground(ctx, metrics, frame) {
    const gradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    gradient.addColorStop(0, PALETTE.skyTop);
    gradient.addColorStop(1, PALETTE.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    const haze = ctx.createRadialGradient(
        metrics.centerX,
        metrics.centerY * 0.82,
        metrics.scale * 0.08,
        metrics.centerX,
        metrics.centerY,
        metrics.scale * 0.72,
    );
    haze.addColorStop(0, PALETTE.haze);
    haze.addColorStop(1, 'rgba(255, 248, 231, 0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    const stripeGap = clamp(metrics.scale * 0.065, 24, 56);
    ctx.strokeStyle = PALETTE.stripe;
    ctx.lineWidth = 1;
    for (let y = stripeGap * 0.25; y < metrics.height; y += stripeGap) {
        const drift = Math.sin(frame * 0.015 + y * 0.02) * metrics.scale * 0.015;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(metrics.width, y + drift);
        ctx.stroke();
    }
}

function drawFloor(ctx, metrics, state) {
    ctx.fillStyle = PALETTE.floorShadow;
    ctx.beginPath();
    ctx.ellipse(
        state.titleX,
        metrics.floorY + metrics.floorThickness * 0.42,
        metrics.titleWidth * 0.62,
        metrics.floorThickness * 0.32,
        0,
        0,
        Math.PI * 2,
    );
    ctx.fill();

    const floorGradient = ctx.createLinearGradient(0, metrics.floorY, 0, metrics.floorY + metrics.floorThickness);
    floorGradient.addColorStop(0, PALETTE.floorTop);
    floorGradient.addColorStop(1, PALETTE.floorFront);
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, metrics.floorY, metrics.width, metrics.floorThickness);

    ctx.fillStyle = PALETTE.stageLight;
    ctx.beginPath();
    ctx.ellipse(
        state.titleX,
        metrics.floorY + metrics.floorThickness * 0.08,
        metrics.titleWidth * 0.44,
        metrics.floorThickness * 0.11,
        0,
        0,
        Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 245, 226, 0.32)';
    ctx.lineWidth = Math.max(2, metrics.scale * 0.004);
    ctx.beginPath();
    ctx.moveTo(0, metrics.floorY);
    ctx.lineTo(metrics.width, metrics.floorY);
    ctx.stroke();
}

function drawTitle(ctx, metrics, state) {
    ctx.save();
    ctx.translate(state.titleX, metrics.titleCenterY);
    ctx.rotate(clamp(state.titleVelocity / metrics.titleWidth * 4.5, -0.08, 0.08));
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic 700 ${metrics.titleFontSize}px ${TITLE_FONT_FAMILY}`;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.fillStyle = PALETTE.titleShadow;
    ctx.fillText(TITLE_TEXT, metrics.titleFontSize * 0.02, metrics.titleFontSize * 0.1);

    ctx.lineWidth = Math.max(1.5, metrics.titleFontSize * 0.03);
    ctx.strokeStyle = PALETTE.titleStroke;
    ctx.strokeText(TITLE_TEXT, 0, 0);

    ctx.fillStyle = PALETTE.titleFill;
    ctx.fillText(TITLE_TEXT, 0, 0);

    ctx.strokeStyle = PALETTE.titleHighlight;
    ctx.lineWidth = Math.max(1, metrics.titleFontSize * 0.012);
    ctx.beginPath();
    ctx.moveTo(-metrics.titleWidth * 0.4, -metrics.titleFontSize * 0.18);
    ctx.quadraticCurveTo(0, -metrics.titleFontSize * 0.28, metrics.titleWidth * 0.36, -metrics.titleFontSize * 0.12);
    ctx.stroke();

    ctx.restore();
}

function drawBlock(ctx, block) {
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.angle);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `italic 700 ${block.fontSize}px ${BLOCK_FONT_FAMILY}`;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, block.fontSize * 0.035);
    ctx.strokeStyle = 'rgba(255, 247, 233, 0.72)';
    ctx.strokeText(FALLING_TEXT, 0, 0);
    ctx.fillStyle = block.color;
    ctx.fillText(FALLING_TEXT, 0, 0);
    ctx.restore();
}

function drawBlocks(ctx, state) {
    const sortedBlocks = [...state.blocks].sort((left, right) => {
        return (left.y + left.height / 2) - (right.y + right.height / 2);
    });

    for (const block of sortedBlocks) {
        drawBlock(ctx, block);
    }
}

let workaholicState = null;

export function AnimationW(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height, state);

    state.frame += 1;

    updateTitle(state, metrics, movement);
    spawnBlocks(ctx, state, metrics);
    releaseBlocksFromTitleMotion(state, metrics);
    updateBlocks(state, metrics);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, metrics, state.frame);
    drawFloor(ctx, metrics, state);
    drawTitle(ctx, metrics, state);
    drawBlocks(ctx, state);

    ctx.restore();
}

export function CleanW() {
    workaholicState = null;
}

export const descriptionW = [
    `눈앞에 일이 생기면 일단 쳐내고 싶어지는 편입니다. 진행 중인 일 위로 또 다른 일이 떨어져도 어쩐지 그냥 쌓아 두지는 못하겠더라고요.`,
    `이번 화면은 그런 감각을 Workaholic 타이포그래피와 계속 떨어지는 work 조각으로 옮겼습니다. 아래의 Workaholic은 마우스를 따라 좌우로 움직이고, 위에서는 서로 다른 크기의 work가 떨어지며 바닥과 글자 위에 계속 쌓입니다.`,
    `하지만 오래 버티지는 못합니다. Workaholic이 움직이는 순간 위에 걸쳐 있던 일들도, 바닥 근처에 겨우 버티던 일들도 다시 무너져 떨어지도록 만들어서 밀려드는 업무와 그것을 쳐내는 리듬을 함께 보이게 했습니다.`,
];

export const toolTipW = [
    '마우스를 좌우로 움직이면 아래의 Workaholic 타이포그래피가 그 방향을 따라 움직입니다.',
    '하늘에서 떨어지는 work가 바닥과 글자 위에 쌓이고, 빠르게 움직이면 얹혀 있던 조각과 바닥 근처 조각이 다시 무너집니다.',
];
