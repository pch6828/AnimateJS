const ALGORITHM_TEXT = 'ALGORITHM';
const BAR_COUNT = ALGORITHM_TEXT.length;
const FONT_FAMILY = '"VT323", monospace';
const SORT_SPEED = 0.1;
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
        sortedTail: 0,
        swapping: false,
        swapProgress: 0,
        swapIndex: -1,
        prevIsDown: false,
        shuffleFlash: 1,
        settleFrames: 0,
    };
}

function resetState(state) {
    state.values = createShuffledValues();
    state.compareIndex = 0;
    state.sortedTail = 0;
    state.swapping = false;
    state.swapProgress = 0;
    state.swapIndex = -1;
    state.shuffleFlash = 1;
    state.settleFrames = 0;
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
        }

        return;
    }

    if (state.sortedTail >= BAR_COUNT - 1) {
        state.settleFrames += 1;
        return;
    }

    const lastComparableIndex = BAR_COUNT - 1 - state.sortedTail;

    if (state.compareIndex >= lastComparableIndex) {
        state.sortedTail += 1;
        state.compareIndex = 0;
        return;
    }

    if (state.values[state.compareIndex] > state.values[state.compareIndex + 1]) {
        state.swapping = true;
        state.swapIndex = state.compareIndex;
        state.swapProgress = 0;
        return;
    }

    state.compareIndex += 1;
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
            : state.compareIndex;

    for (let index = 0; index < BAR_COUNT; index += 1) {
        const value = state.values[index];
        const x = getBarX(metrics, state, index);
        const height = value * unitHeight;
        const isSorted = isFullySorted || index >= BAR_COUNT - state.sortedTail;
        const isActive = compareIndex >= 0 && (index === compareIndex || index === compareIndex + 1);
        const fillColor = isSorted ? RETRO_COLORS.barSorted : isActive ? RETRO_COLORS.barActive : RETRO_COLORS.barFill;
        const shadeColor = isSorted ? RETRO_COLORS.barSortedShade : RETRO_COLORS.barShade;

        drawBar(ctx, x, metrics.barBaseY, metrics.barWidth, height, fillColor, shadeColor);

        if (isActive) {
            ctx.strokeStyle = 'rgba(24, 57, 47, 0.8)';
            ctx.lineWidth = Math.max(1.5, metrics.barWidth * 0.08);
            ctx.strokeRect(x - metrics.barWidth / 2, metrics.barBaseY - height, metrics.barWidth, height);
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
    `I enjoy the moment when a scrambled structure slowly reveals its rule.
    Bubble sort may be simple, but watching each local comparison accumulate into order still feels satisfying.`,
    `This scene places a bar above every letter in ALGORITHM, starts from a shuffled order,
    and lets the bars settle into place one swap at a time.`
];

export const toolTipA = [
    'Click once to reshuffle the bars.',
    'The bars sort themselves again with bubble sort.'
];
