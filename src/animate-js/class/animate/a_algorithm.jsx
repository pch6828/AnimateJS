const ALGORITHM_TEXT = 'ALGORITHM';
const BAR_COUNT = ALGORITHM_TEXT.length;
const FONT_FAMILY = '"VT323", monospace';
const SORT_SPEED = 0.075;
const STEP_PAUSE_FRAMES = 10;
const PRE_SWAP_PAUSE_FRAMES = 10;
const RETRO_COLORS = {
    backgroundTop: '#efe2bf',
    backgroundBottom: '#cbb88f',
    panelFill: 'rgba(247, 239, 216, 0.2)',
    panelBorder: 'rgba(24, 57, 47, 0.72)',
    panelInnerBorder: 'rgba(243, 191, 120, 0.65)',
    vignette: 'rgba(58, 34, 20, 0.2)',
    titleShadow: '#b35c2e',
    titleFill: '#18392f',
    titleStroke: '#f8f0d8',
    titleHighlight: 'rgba(255, 250, 232, 0.5)',
    barFill: '#d46236',
    barShade: '#a14222',
    barHighlight: '#f3bf78',
    barSorted: '#295948',
    barSortedShade: '#17372d',
    barActive: '#8d2f24',
    barCap: '#fff1cb',
    accent: '#18392f',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function easeInOut(value) {
    return value < 0.5
        ? 2 * value * value
        : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function createShuffledValues() {
    const values = Array.from({ length: BAR_COUNT }, (_, index) => index + 1);

    for (let index = values.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        const temporary = values[index];
        values[index] = values[randomIndex];
        values[randomIndex] = temporary;
    }

    const isAlreadySorted = values.every((value, index) => value === index + 1);
    if (isAlreadySorted) {
        const temporary = values[0];
        values[0] = values[1];
        values[1] = temporary;
    }

    return values;
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        values: createShuffledValues(),
        compareIndex: 0,
        activeCompareIndex: 0,
        sortedTail: 0,
        swapping: false,
        preSwapPauseFrames: 0,
        swapProgress: 0,
        swapIndex: -1,
        prevIsDown: false,
        shuffleFlash: 1,
        settleFrames: 0,
        pauseFrames: 0,
    };
}

function resetState(state) {
    state.values = createShuffledValues();
    state.compareIndex = 0;
    state.activeCompareIndex = 0;
    state.sortedTail = 0;
    state.swapping = false;
    state.preSwapPauseFrames = 0;
    state.swapProgress = 0;
    state.swapIndex = -1;
    state.shuffleFlash = 1;
    state.settleFrames = 0;
    state.pauseFrames = 0;
}

function ensureState(width, height) {
    if (!algorithmState || algorithmState.width !== width || algorithmState.height !== height) {
        algorithmState = createState(width, height);
    }

    return algorithmState;
}

function updateBubbleSort(state) {
    state.frame += 1;
    state.shuffleFlash *= 0.94;

    if (state.pauseFrames > 0) {
        state.pauseFrames -= 1;
        return;
    }

    if (state.preSwapPauseFrames > 0) {
        state.preSwapPauseFrames -= 1;

        if (state.preSwapPauseFrames === 0) {
            state.swapping = true;
            state.swapProgress = 0;
        }

        return;
    }

    if (state.swapping) {
        state.swapProgress = clamp(state.swapProgress + SORT_SPEED, 0, 1);

        if (state.swapProgress >= 1) {
            const leftIndex = state.swapIndex;
            const rightIndex = leftIndex + 1;
            const temporary = state.values[leftIndex];

            state.values[leftIndex] = state.values[rightIndex];
            state.values[rightIndex] = temporary;
            state.swapping = false;
            state.swapProgress = 0;
            state.compareIndex += 1;
            state.swapIndex = -1;
            state.pauseFrames = STEP_PAUSE_FRAMES;
        }

        return;
    }

    if (state.sortedTail >= BAR_COUNT - 1) {
        state.settleFrames += 1;
        return;
    }

    const lastComparableIndex = BAR_COUNT - 1 - state.sortedTail;

    if (state.compareIndex >= lastComparableIndex) {
        state.activeCompareIndex = -1;
        state.sortedTail += 1;
        state.compareIndex = 0;
        state.pauseFrames = STEP_PAUSE_FRAMES;
        return;
    }

    state.activeCompareIndex = state.compareIndex;

    if (state.values[state.compareIndex] > state.values[state.compareIndex + 1]) {
        state.swapIndex = state.compareIndex;
        state.preSwapPauseFrames = PRE_SWAP_PAUSE_FRAMES;
        return;
    }

    state.compareIndex += 1;
    state.pauseFrames = STEP_PAUSE_FRAMES;
}

function updateInteraction(state, movement) {
    if (!state.prevIsDown && movement.isDown) {
        resetState(state);
    }

    state.prevIsDown = movement.isDown;
}

function getMetrics(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height);
    const fontSize = clamp(scale * 0.195, 58, 148);
    const baselineY = centerY + fontSize * 0.92;
    const titleTopY = baselineY - fontSize * 0.96;

    ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
    const textWidth = ctx.measureText(ALGORITHM_TEXT).width;
    const textStartX = centerX - textWidth / 2;

    const slotCenters = [];
    for (let index = 0; index < BAR_COUNT; index += 1) {
        const leftWidth = ctx.measureText(ALGORITHM_TEXT.slice(0, index)).width;
        const rightWidth = ctx.measureText(ALGORITHM_TEXT.slice(0, index + 1)).width;
        slotCenters.push(textStartX + (leftWidth + rightWidth) / 2);
    }

    const slotGap = BAR_COUNT > 1 ? slotCenters[1] - slotCenters[0] : textWidth;

    return {
        centerX,
        centerY,
        fontSize,
        baselineY,
        titleTopY,
        textWidth,
        textStartX,
        slotCenters,
        slotGap,
        barBaseY: titleTopY - fontSize * 0.12,
        barWidth: Math.max(12, slotGap * 0.54),
        maxBarHeight: fontSize * 1.28,
        captionY: baselineY + fontSize * 0.3,
    };
}

function drawBackground(ctx, width, height, metrics, frame, flash) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, RETRO_COLORS.backgroundTop);
    gradient.addColorStop(1, RETRO_COLORS.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const panelX = metrics.centerX - metrics.textWidth * 0.67;
    const panelY = metrics.centerY - metrics.fontSize * 1.66;
    const panelWidth = metrics.textWidth * 1.34;
    const panelHeight = metrics.fontSize * 2.88;
    const inset = Math.max(10, metrics.fontSize * 0.1);

    ctx.fillStyle = RETRO_COLORS.panelFill;
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    ctx.strokeStyle = RETRO_COLORS.panelBorder;
    ctx.lineWidth = Math.max(3, metrics.fontSize * 0.028);
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    ctx.strokeStyle = RETRO_COLORS.panelInnerBorder;
    ctx.lineWidth = Math.max(2, metrics.fontSize * 0.018);
    ctx.strokeRect(panelX + inset, panelY + inset, panelWidth - inset * 2, panelHeight - inset * 2);

    ctx.fillStyle = `rgba(248, 238, 211, ${flash * 0.14})`;
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(
        metrics.centerX,
        metrics.centerY,
        Math.min(width, height) * 0.24,
        metrics.centerX,
        metrics.centerY,
        Math.max(width, height) * 0.72
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, RETRO_COLORS.vignette);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
}

function drawTitle(ctx, metrics, frame) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `700 ${metrics.fontSize}px ${FONT_FAMILY}`;

    const drift = Math.sin(frame * 0.03) * metrics.fontSize * 0.012;
    ctx.lineWidth = Math.max(1.5, metrics.fontSize * 0.016);

    ctx.fillStyle = RETRO_COLORS.titleShadow;
    ctx.fillText(ALGORITHM_TEXT, metrics.textStartX + metrics.fontSize * 0.035, metrics.baselineY + drift);

    ctx.fillStyle = RETRO_COLORS.titleFill;
    ctx.strokeStyle = RETRO_COLORS.titleStroke;
    ctx.strokeText(ALGORITHM_TEXT, metrics.textStartX, metrics.baselineY);
    ctx.fillText(ALGORITHM_TEXT, metrics.textStartX, metrics.baselineY);

    ctx.restore();
}

function getBarX(metrics, state, index) {
    if (!state.swapping) {
        return metrics.slotCenters[index];
    }

    const easedProgress = easeInOut(state.swapProgress);
    if (index === state.swapIndex) {
        return lerp(metrics.slotCenters[index], metrics.slotCenters[index + 1], easedProgress);
    }

    if (index === state.swapIndex + 1) {
        return lerp(metrics.slotCenters[index + 1], metrics.slotCenters[index], easedProgress);
    }

    return metrics.slotCenters[index];
}

function getBarLift(metrics, state, index) {
    if (!state.swapping) {
        return 0;
    }

    if (index !== state.swapIndex && index !== state.swapIndex + 1) {
        return 0;
    }

    const easedProgress = easeInOut(state.swapProgress);
    return Math.sin(easedProgress * Math.PI) * metrics.fontSize * 0.08;
}

function drawBar(ctx, x, baseY, width, height, fillColor, shadeColor) {
    ctx.fillStyle = shadeColor;
    ctx.fillRect(x - width / 2 + width * 0.08, baseY - height, width, height);

    ctx.fillStyle = fillColor;
    ctx.fillRect(x - width / 2, baseY - height, width, height);

    ctx.fillStyle = RETRO_COLORS.barHighlight;
    ctx.fillRect(x - width / 2 + width * 0.12, baseY - height + width * 0.08, width * 0.18, Math.max(4, height - width * 0.16));

    ctx.fillStyle = RETRO_COLORS.barCap;
    ctx.fillRect(x - width / 2, baseY - height, width, Math.max(3, width * 0.12));
}

function drawBars(ctx, metrics, state) {
    const unitHeight = metrics.maxBarHeight / (BAR_COUNT + 1);
    const isFullySorted = state.sortedTail >= BAR_COUNT - 1;
    const compareIndex = state.sortedTail >= BAR_COUNT - 1
        ? -1
        : state.swapping
            ? state.swapIndex
            : state.activeCompareIndex;

    for (let index = 0; index < BAR_COUNT; index += 1) {
        const value = state.values[index];
        const x = getBarX(metrics, state, index);
        const lift = getBarLift(metrics, state, index);
        const height = value * unitHeight;
        const isSorted = isFullySorted || index >= BAR_COUNT - state.sortedTail;
        const isActive = compareIndex >= 0 && (index === compareIndex || index === compareIndex + 1);
        const fillColor = isSorted ? RETRO_COLORS.barSorted : isActive ? RETRO_COLORS.barActive : RETRO_COLORS.barFill;
        const shadeColor = isSorted ? RETRO_COLORS.barSortedShade : RETRO_COLORS.barShade;

        drawBar(ctx, x, metrics.barBaseY - lift, metrics.barWidth, height, fillColor, shadeColor);

        if (isActive) {
            ctx.strokeStyle = 'rgba(24, 57, 47, 0.8)';
            ctx.lineWidth = Math.max(1.5, metrics.barWidth * 0.08);
            ctx.strokeRect(x - metrics.barWidth / 2, metrics.barBaseY - lift - height, metrics.barWidth, height);
        }
    }
}

let algorithmState = null;

export function AnimationA(ctx, width, height, movement) {
    const state = ensureState(width, height);

    updateInteraction(state, movement);
    updateBubbleSort(state);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const metrics = getMetrics(ctx, width, height);

    drawBackground(ctx, width, height, metrics, state.frame, state.shuffleFlash);
    drawBars(ctx, metrics, state);
    drawTitle(ctx, metrics, state.frame);

    ctx.restore();
}

export function CleanA() {
    algorithmState = null;
}

export const descriptionA = [
    `대학에서는 알고리즘 공부를 좀 했습니다.
    새내기 때 알고리즘 동아리에 들어간 게 계기였는데, 덕분에 나름 특이한 경험도 많이 했습니다.
    동아리 학술부장도 해보고, 알고리즘 대회 출제도 해보고, 동아리 연합 세미나에서 수업도 해봤어요.
    4학년쯤 됐을 때는 코딩테스트 외주도 두 번 정도 뛰었어요.`,
    `인생 첫 코딩 공부였는데, 나름 적성에 맞았었던 것 같아요.
    덕분에 CS에도 재미를 붙여서, 전공 수업도 잘 따라갈 수 있었습니다.
    지금 생각하면 첫 CS 공부로 알고리즘을 택한 게 꽤 좋은 선택이었던 것 같아요.`,
    `물론 대학원을 가고, 또 취업을 한 이후에는 알고리즘 문제 풀이는 거의 안 합니다.
    그래서 이제는 알고리즘 문제를 거의 볼 일이 없겠구나 생각했습니다.
    그런데 이게 웬걸, 지금 다니는 회사에서 제가 코딩테스트를 담당하게 되었습니다.
    대학생 때의 알고리즘 공부가 회사에서 이런 식으로 쓰이게 될 줄은 상상도 못했어요.`
];

export const toolTipA = [
    '화면을 눌렀다 떼면 막대가 섞입니다.',
    '섞인 막대는 버블 정렬 알고리즘에 따라 하나씩 정렬됩니다.'
];
