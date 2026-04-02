const FRONT_TEXT = 'DESIGNER';
const BACK_TEXT = 'Developer';
const FONT_FAMILY = '"Limelight", "Times New Roman", serif';
const DEVELOPER_FONT_FAMILY = '"VT323", Consolas, monospace';
const SLICE_COUNT = 10;
const DRAG_RATIO = 1;
const THEME = {
    backgroundTop: '#f4dfc8',
    backgroundBottom: '#d5b288',
    halo: 'rgba(255, 247, 234, 0.88)',
    frameFill: 'rgba(83, 50, 31, 0.08)',
    frameStroke: 'rgba(75, 42, 24, 0.36)',
    frameInner: 'rgba(255, 246, 231, 0.55)',
    guide: 'rgba(67, 41, 27, 0.38)',
    frontPanel: '#f4df72',
    frontStripe: 'rgba(179, 52, 44, 0.58)',
    frontRule: '#4a7ad9',
    frontFill: '#3f2a1f',
    frontAccent: '#8f5c42',
    backPanel: '#050505',
    backFill: '#7dff7a',
    sliceEdge: 'rgba(38, 23, 15, 0.14)',
    shadow: 'rgba(39, 22, 12, 0.18)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function easeInOut(value) {
    return value < 0.5
        ? 2 * value * value
        : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

function approach(current, target, factor) {
    return current + (target - current) * factor;
}

function createScratchCanvas(width, height, ctx) {
    if (typeof OffscreenCanvas !== 'undefined') {
        return new OffscreenCanvas(width, height);
    }

    const canvas = ctx.canvas.ownerDocument.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        progress: 0,
        targetProgress: 0,
        prevIsDown: false,
        prevPointerX: null,
        velocity: 0,
        dragGlow: 0,
        frontBuffer: null,
        backBuffer: null,
        bufferWidth: 0,
        bufferHeight: 0,
    };
}

function ensureState(width, height) {
    if (!designerState || designerState.width !== width || designerState.height !== height) {
        designerState = createState(width, height);
    }

    return designerState;
}

function getMetrics(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const fontSize = clamp(Math.min(width * 0.14, height * 0.24), 68, 220);
    const letterSpacing = fontSize * 0.08;
    const panelWidth = width;
    const panelHeight = height;
    const panelX = 0;
    const panelY = 0;
    const sliceWidth = panelWidth / SLICE_COUNT;
    const sliceGap = 0;

    ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    return {
        centerX,
        centerY,
        fontSize,
        letterSpacing,
        panelWidth,
        panelHeight,
        panelX,
        panelY,
        sliceWidth,
        sliceGap,
        titleY: centerY,
    };
}

function ensureBuffers(state, metrics, ctx) {
    const width = Math.max(1, Math.round(metrics.panelWidth));
    const height = Math.max(1, Math.round(metrics.panelHeight));

    if (
        state.frontBuffer &&
        state.backBuffer &&
        state.bufferWidth === width &&
        state.bufferHeight === height
    ) {
        return;
    }

    state.frontBuffer = createScratchCanvas(width, height, ctx);
    state.backBuffer = createScratchCanvas(width, height, ctx);
    state.bufferWidth = width;
    state.bufferHeight = height;

    drawWordBuffer(state.frontBuffer, width, height, {
        text: FRONT_TEXT,
        fillColor: THEME.frontFill,
        accentColor: THEME.frontAccent,
        fontFamily: FONT_FAMILY,
        backgroundColor: THEME.frontPanel,
    }, metrics);
    drawWordBuffer(state.backBuffer, width, height, {
        text: BACK_TEXT,
        fillColor: THEME.backFill,
        accentColor: null,
        fontFamily: DEVELOPER_FONT_FAMILY,
        backgroundColor: THEME.backPanel,
    }, metrics);
}

function drawWordBuffer(canvas, width, height, style, metrics) {
    const bufferCtx = canvas.getContext('2d');

    bufferCtx.clearRect(0, 0, width, height);
    if (style.backgroundColor) {
        bufferCtx.fillStyle = style.backgroundColor;
        bufferCtx.fillRect(0, 0, width, height);
    }

    if (style.text === FRONT_TEXT) {
        const stripeGap = Math.max(16, metrics.fontSize * 0.2);
        bufferCtx.strokeStyle = THEME.frontStripe;
        bufferCtx.lineWidth = Math.max(1.2, metrics.fontSize * 0.018);

        for (let y = stripeGap * 0.7; y < height; y += stripeGap) {
            bufferCtx.beginPath();
            bufferCtx.moveTo(0, y);
            bufferCtx.lineTo(width, y);
            bufferCtx.stroke();
        }

        bufferCtx.fillStyle = THEME.frontRule;
        bufferCtx.fillRect(width * 0.08, 0, Math.max(3, width * 0.012), height);
    }

    bufferCtx.save();
    bufferCtx.translate(width / 2, height / 2);
    bufferCtx.textAlign = 'center';
    bufferCtx.textBaseline = 'middle';
    bufferCtx.font = `400 ${metrics.fontSize}px ${style.fontFamily}`;

    const glow = bufferCtx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
    glow.addColorStop(0, style.text === FRONT_TEXT ? 'rgba(255, 245, 201, 0.38)' : style.backgroundColor ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 248, 237, 0.65)');
    glow.addColorStop(0.5, 'rgba(255, 248, 237, 0)');
    glow.addColorStop(1, style.text === FRONT_TEXT ? 'rgba(255, 234, 173, 0.18)' : style.backgroundColor ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 248, 237, 0.3)');
    bufferCtx.fillStyle = glow;
    bufferCtx.fillRect(-width / 2, -height / 2, width, height);

    bufferCtx.lineWidth = Math.max(1.5, metrics.fontSize * 0.02);
    bufferCtx.strokeStyle = style.text === FRONT_TEXT
        ? 'rgba(255, 248, 223, 0.72)'
        : style.backgroundColor
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(255, 245, 233, 0.55)';
    bufferCtx.strokeText(style.text, 0, metrics.fontSize * 0.02);

    if (style.accentColor) {
        bufferCtx.fillStyle = style.accentColor;
        bufferCtx.fillText(style.text, metrics.fontSize * 0.022, metrics.fontSize * 0.034);
    }

    bufferCtx.fillStyle = style.fillColor;
    bufferCtx.fillText(style.text, 0, 0);

    bufferCtx.fillStyle = style.text === FRONT_TEXT
        ? 'rgba(255, 248, 221, 0.18)'
        : style.backgroundColor
            ? 'rgba(255, 255, 255, 0.04)'
            : 'rgba(255, 255, 255, 0.12)';
    bufferCtx.fillRect(-width / 2, -height / 2, width * 0.24, height);
    bufferCtx.restore();
}

function updateInteraction(state, movement, width) {
    state.frame += 1;

    if (!state.prevIsDown && movement.isDown) {
        state.prevPointerX = movement.mousePoint.x;
    } else if (!movement.isDown) {
        state.prevPointerX = null;
    }

    if (movement.isDown && state.prevPointerX !== null) {
        const deltaX = movement.mousePoint.x - state.prevPointerX;
        const normalizedDelta = deltaX / Math.max(width, 1);
        const isDraggingPastFront = state.targetProgress <= 0 && normalizedDelta < 0;
        const isDraggingPastBack = state.targetProgress >= 1 && normalizedDelta > 0;
        const isBlockedAtEdge = isDraggingPastFront || isDraggingPastBack;

        if (isBlockedAtEdge) {
            state.velocity = approach(state.velocity, 0, 0.6);
            state.dragGlow *= 0.9;
        } else {
            state.targetProgress = clamp(state.targetProgress + normalizedDelta / DRAG_RATIO, 0, 1);
            state.velocity = approach(state.velocity, normalizedDelta, 0.45);
            state.dragGlow = approach(state.dragGlow, Math.min(1, Math.abs(normalizedDelta) * 28), 0.18);
        }

        state.prevPointerX = movement.mousePoint.x;
    } else {
        state.velocity *= 0.86;
        state.dragGlow *= 0.92;
    }

    state.progress = approach(state.progress, state.targetProgress, movement.isDown ? 0.22 : 0.12);
    state.prevIsDown = movement.isDown;
}

function drawBackground(ctx, width, height, metrics, state) {
    const halo = ctx.createRadialGradient(
        metrics.centerX,
        metrics.centerY - metrics.fontSize * 0.18,
        metrics.fontSize * 0.25,
        metrics.centerX,
        metrics.centerY,
        Math.max(width, height) * 0.72
    );
    halo.addColorStop(0, THEME.halo);
    halo.addColorStop(1, 'rgba(255, 247, 234, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let index = 1; index < SLICE_COUNT; index += 1) {
        const x = metrics.panelX + metrics.sliceWidth * index;
        ctx.beginPath();
        ctx.moveTo(x, metrics.panelY);
        ctx.lineTo(x, metrics.panelY + metrics.panelHeight);
        ctx.stroke();
    }
}

function drawSliceShadow(ctx, x, y, width, height, amount, color) {
    if (amount <= 0) {
        return;
    }

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawFlipSlices(ctx, metrics, state) {
    ensureBuffers(state, metrics, ctx);

    ctx.save();

    for (let index = 0; index < SLICE_COUNT; index += 1) {
        const sliceStart = index / SLICE_COUNT;
        const staggerWindow = 0.28;
        const reveal = clamp((state.progress - sliceStart * staggerWindow) / (1 - staggerWindow), 0, 1);
        const easedReveal = easeInOut(reveal);
        const angle = easedReveal * Math.PI;
        const scaleX = Math.max(0.02, Math.abs(Math.cos(angle)));
        const depth = Math.sin(angle);
        const centerX = metrics.panelX + metrics.sliceWidth * index + metrics.sliceWidth / 2;
        const sliceX = metrics.sliceWidth * index;
        const sourceCanvas = angle < Math.PI / 2 ? state.frontBuffer : state.backBuffer;
        const sway = (index - (SLICE_COUNT - 1) / 2) * metrics.fontSize * state.velocity * 0.28;
        const liftedY = metrics.panelY - depth * metrics.fontSize * 0.03;
        const renderedWidth = Math.max(metrics.sliceWidth * scaleX - metrics.sliceGap, 1.5);

        ctx.fillStyle = `rgba(45, 28, 18, ${0.04 + depth * 0.1})`;
        ctx.fillRect(
            centerX - renderedWidth / 2 + metrics.fontSize * 0.02,
            metrics.panelY + metrics.panelHeight + metrics.fontSize * 0.05,
            renderedWidth,
            metrics.fontSize * 0.08
        );

        ctx.save();
        ctx.translate(centerX + sway, liftedY);
        ctx.beginPath();
        ctx.rect(-renderedWidth / 2, 0, renderedWidth, metrics.panelHeight);
        ctx.clip();

        ctx.drawImage(
            sourceCanvas,
            sliceX,
            0,
            metrics.sliceWidth,
            metrics.panelHeight,
            -renderedWidth / 2,
            0,
            renderedWidth,
            metrics.panelHeight
        );

        drawSliceShadow(
            ctx,
            -renderedWidth / 2,
            0,
            renderedWidth,
            metrics.panelHeight,
            depth,
            `rgba(23, 15, 11, ${depth * 0.32})`
        );

        ctx.strokeStyle = THEME.sliceEdge;
        ctx.lineWidth = 1;
        ctx.strokeRect(-renderedWidth / 2, 0, renderedWidth, metrics.panelHeight);
        ctx.restore();
    }

    ctx.restore();
}

let designerState = null;

export function AnimationD(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height);

    updateInteraction(state, movement, width);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, width, height, metrics, state);
    drawFlipSlices(ctx, metrics, state);
    ctx.restore();
}

export function CleanD() {
    designerState = null;
}

export const descriptionD = [
    `제가 처음부터 CS 전공을 희망한 것은 아니었습니다.
    CS 전공을 택한 건 놀랍게도 고3이라는 늦은 시기였어요.
    그 전까지는 디자인과를 희망했습니다.
    이 이야기를 하면 다들 의외라고, 천생 공돌이인 줄 알았다고 하더라구요.`,
    `디자인과 지망에 특별한 이유가 있던 건 아니었어요.
    어릴 때부터 그림 그리기나 만들기를 좋아했다 보니, 그걸 직업으로 할 수 있는 "디자이너"를 동경했죠.
    지금 생각하면 참 단순했죠. 미술에 엄청난 재능이 있던 것도 아니었는데 말이에요.`,
    `CS로 전공을 틀게 된 계기도 굉장히 단순했습니다.
    고3 때 웹 개발 동아리에서 디자인을 맡았는데, 활동하다 보니 코딩에도 손을 대게 됐거든요.
    근데 의외로 재미있더라구요. 그래서 원서 지원하기 몇 달 전에 진로를 틀었어요.
    적성에 맞는지도 제대로 판단하지 않은 도박이었지만, 결과론적으로는 잘한 선택이었어요.`,
    `지금 보면 제가 하고 싶었던 건 "내 생각을 구체화하는 것"이었나 봐요. 
    디자인이든 개발이든, 결국 추상적인 아이디어를 구체적인 형태로 만들어나가는 일이니까요.`
];

export const toolTipD = [
    '화면을 오른쪽으로 드래그하면 화면이 뒤집힙니다. 다시 왼쪽으로 화면을 드래그하면 원래대로 돌아옵니다.'
];
