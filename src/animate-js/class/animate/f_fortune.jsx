import { get_random } from "./util";

const WORD = "FORTUNE";
const COOKIE_TAPS_TO_BREAK = 3;
const FONT_FAMILY = "'Potta One', cursive";

const THEME = {
    ink: "#4c2417",
    cookie: "#d98b37",
    cookieDark: "#99511f",
    cookieLight: "#f6bc68",
    cookieEdge: "#7b3d1d",
    paper: "#fff8df",
    paperRule: "#d85d43",
    background: "#781d22",
};

const messages = [
    "A brave answer is already near.",
    "Today rewards one small risk.",
    "Your timing is better than you think.",
    "A quiet choice opens the loudest door.",
    "Keep the promise you made to yourself.",
    "Luck likes prepared hands.",
    "The next page is lighter than this one.",
    "Say yes to the useful surprise.",
    "Your pace is still progress.",
    "A kind word returns with interest.",
];

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - clamp(value, 0, 1), 3);
}

function randomRange(min, max) {
    return min + Math.random() * (max - min);
}

function createScatterProfile() {
    return {
        xJitterRatio: randomRange(-0.5, 0.5),
        yRatio: Math.random(),
        rotation: randomRange(-0.22, 0.22),
    };
}

function textureRatio(index, salt) {
    const raw = Math.sin((index + 1) * 37.719 + salt * 91.137) * 43758.5453;

    return raw - Math.floor(raw);
}

function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function pointInRect(point, rect) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

function setLetterFont(ctx, fontSize) {
    ctx.font = `900 ${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
}

function getMetrics(ctx, width, height) {
    let fontSize = Math.min(width * 0.3, height * 0.37);
    const maxWordWidth = Math.min(width * 1.2, height * 1.1);
    let gap = fontSize * 0.08;

    setLetterFont(ctx, fontSize);
    let letterWidths = WORD.split("").map((char) => ctx.measureText(char).width);
    let initialWordWidth = letterWidths.reduce((sum, letterWidth) => sum + letterWidth, 0) + gap * (WORD.length - 1);

    if (initialWordWidth > maxWordWidth) {
        fontSize *= maxWordWidth / initialWordWidth;
        gap = fontSize * 0.08;
        setLetterFont(ctx, fontSize);
        letterWidths = WORD.split("").map((char) => ctx.measureText(char).width);
        initialWordWidth = letterWidths.reduce((sum, letterWidth) => sum + letterWidth, 0) + gap * (WORD.length - 1);
    }

    const cookieWidth = Math.max(...letterWidths);
    const cookieHeight = fontSize;
    const scatterInsetX = Math.max(cookieWidth * 0.72, width * 0.08);
    const scatterTop = Math.max(cookieHeight * 0.95, height * 0.16);
    const scatterBottom = Math.max(scatterTop + cookieHeight, height - cookieHeight * 0.95);
    const scatterStep = (width - scatterInsetX * 2) / (WORD.length - 1);
    const scatterHeight = Math.max(cookieHeight, scatterBottom - scatterTop);
    const scatterJitterX = scatterStep * 0.48;
    const paperWidth = Math.min(width * 0.74, Math.max(cookieWidth * 4.8, width * 0.44));
    const paperHeight = Math.max(cookieHeight * 0.8, Math.min(height * 0.1, cookieWidth * 0.86));
    const cookiePositions = WORD.split("").map((char, index) => {
        const letterWidth = letterWidths[index];

        return {
            char,
            letterWidth,
            slotX: scatterInsetX + scatterStep * index,
        };
    });

    return {
        width,
        height,
        fontSize,
        cookieWidth,
        cookieHeight,
        gap,
        wordWidth: initialWordWidth,
        wordY: height / 2,
        paperWidth,
        paperHeight,
        paperTargetX: width / 2,
        paperTargetY: height / 2,
        scatterInsetX,
        scatterTop,
        scatterHeight,
        scatterJitterX,
        cookiePositions,
    };
}

function getPolygonCenter(points) {
    const total = points.reduce((sum, point) => ({
        x: sum.x + point.x,
        y: sum.y + point.y,
    }), { x: 0, y: 0 });

    return {
        x: total.x / points.length,
        y: total.y / points.length,
    };
}

function getPolygonBounds(points) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);

    return {
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
    };
}

function getConnectedCrackPath(cookie, width, height) {
    const seed = cookie.id + 1;
    const top = -height * 0.56;
    const bottom = height * 0.56;

    return [
        { x: Math.sin(seed * 1.7) * width * 0.05, y: top },
        { x: width * (0.08 + Math.sin(seed * 2.1) * 0.035), y: -height * 0.34 },
        { x: -width * (0.07 + Math.sin(seed * 2.9) * 0.035), y: -height * 0.14 },
        { x: width * (0.09 + Math.sin(seed * 3.7) * 0.035), y: height * 0.08 },
        { x: -width * (0.06 + Math.sin(seed * 4.3) * 0.035), y: height * 0.31 },
        { x: Math.sin(seed * 5.1) * width * 0.05, y: bottom },
    ];
}

function createShardPiece(metrics, cookie, position, polygon, index) {
    const center = getPolygonCenter(polygon);
    const bounds = getPolygonBounds(polygon);
    const direction = center.x < 0 ? -1 : 1;
    const spinDirection = index % 2 === 0 ? direction : -direction;

    return {
        id: cookie.id,
        char: cookie.char,
        letterWidth: position.letterWidth,
        letterHeight: position.letterHeight ?? metrics.cookieHeight,
        fontSize: position.fontSize ?? metrics.fontSize,
        x: position.x + center.x,
        y: position.y + center.y,
        originOffsetX: -center.x,
        originOffsetY: -center.y,
        clipPath: polygon.map((point) => ({
            x: point.x - center.x,
            y: point.y - center.y,
        })),
        boundsWidth: bounds.width,
        boundsHeight: bounds.height,
        vx: direction * randomRange(metrics.fontSize * 0.028, metrics.fontSize * 0.07) + center.x * 0.01,
        vy: randomRange(-metrics.fontSize * 0.095, -metrics.fontSize * 0.025) + center.y * 0.006,
        rotation: randomRange(-0.18, 0.18),
        vr: spinDirection * randomRange(0.025, 0.085),
        opacity: 1,
    };
}

function createShatterPieces(metrics, cookie, position) {
    const width = position.letterWidth;
    const height = position.letterHeight ?? metrics.cookieHeight;
    const fontSize = position.fontSize ?? metrics.fontSize;
    const padding = fontSize * 0.13;
    const left = -width / 2 - padding;
    const right = width / 2 + padding;
    const top = -height * 0.56;
    const bottom = height * 0.56;
    const crack = getConnectedCrackPath(cookie, width, height);

    const shardPolygons = [
        [
            { x: left, y: top },
            crack[0],
            crack[1],
            { x: left + width * 0.08, y: crack[1].y + height * 0.04 },
        ],
        [
            { x: left + width * 0.04, y: crack[1].y + height * 0.02 },
            crack[1],
            crack[2],
            crack[3],
            { x: left, y: crack[3].y + height * 0.08 },
        ],
        [
            { x: left, y: crack[3].y + height * 0.05 },
            crack[3],
            crack[4],
            crack[5],
            { x: left + width * 0.06, y: bottom },
        ],
        [
            crack[0],
            { x: right, y: top },
            { x: right - width * 0.05, y: crack[1].y + height * 0.02 },
            crack[1],
        ],
        [
            crack[1],
            { x: right, y: crack[1].y - height * 0.02 },
            { x: right - width * 0.06, y: crack[3].y + height * 0.08 },
            crack[3],
            crack[2],
        ],
        [
            crack[3],
            { x: right - width * 0.04, y: crack[3].y + height * 0.04 },
            { x: right, y: bottom },
            crack[5],
            crack[4],
        ],
    ];

    return shardPolygons.map((polygon, index) => createShardPiece(metrics, cookie, position, polygon, index));
}

function createCookie(index, char) {
    return {
        id: index,
        char,
        scatter: createScatterProfile(),
        status: "whole",
        tapCount: 0,
        pulse: 0,
        crackProgress: 0,
        message: get_random(messages),
        paper: null,
        pieces: [],
        returnProgress: 1,
        returnRotation: 0,
    };
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        prevIsDown: false,
        downPoint: null,
        cookies: WORD.split("").map((char, index) => createCookie(index, char)),
    };
}

let fortuneState = null;

function ensureState(width, height) {
    if (!fortuneState || fortuneState.width !== width || fortuneState.height !== height) {
        fortuneState = createState(width, height);
    }

    return fortuneState;
}

function getCookiePoint(cookie, metrics) {
    const position = getCookieHomePosition(cookie, metrics);

    return { x: position.x, y: position.y };
}

function getCookieScale() {
    return 1;
}

function getCookieHomePosition(cookie, metrics) {
    const position = metrics.cookiePositions[cookie.id];
    if (!cookie.scatter) {
        cookie.scatter = createScatterProfile();
    }
    const scatter = cookie.scatter;

    return {
        ...position,
        x: clamp(
            position.slotX + scatter.xJitterRatio * metrics.scatterJitterX,
            metrics.scatterInsetX,
            metrics.width - metrics.scatterInsetX
        ),
        y: metrics.scatterTop + scatter.yRatio * metrics.scatterHeight,
        scatterRotation: scatter.rotation,
    };
}

function getCookieRotation(cookie, metrics) {
    const position = getCookieHomePosition(cookie, metrics);

    return position.scatterRotation;
}

function getPaperRect(cookie, metrics) {
    if (!cookie.paper) {
        return null;
    }

    const progress = easeOutCubic(cookie.paper.scale);
    const width = lerp(metrics.cookieWidth * 0.2, metrics.paperWidth, progress);
    const height = lerp(metrics.cookieHeight * 0.22, metrics.paperHeight, progress);

    return {
        x: cookie.paper.x - width / 2,
        y: cookie.paper.y - height / 2,
        width,
        height,
    };
}

function isPointInCookie(point, cookie, metrics) {
    const center = getCookiePoint(cookie, metrics);
    const position = getCookieHomePosition(cookie, metrics);
    const scale = getCookieScale(cookie, metrics);
    const dx = (point.x - center.x) / (position.letterWidth * scale * 0.62);
    const dy = (point.y - center.y) / (metrics.cookieHeight * scale * 0.62);

    return dx * dx + dy * dy <= 1;
}

function beginBreak(cookie, metrics) {
    const homePosition = getCookieHomePosition(cookie, metrics);
    const center = getCookiePoint(cookie, metrics);
    const scale = getCookieScale(cookie, metrics);
    const position = {
        ...homePosition,
        letterWidth: homePosition.letterWidth * scale,
        letterHeight: metrics.cookieHeight * scale,
        fontSize: metrics.fontSize * scale,
        x: center.x,
        y: center.y,
        scale,
    };

    cookie.status = "breaking";
    cookie.crackProgress = 0;
    cookie.pieces = createShatterPieces(metrics, cookie, position);
    cookie.paper = {
        x: position.x,
        y: position.y + metrics.cookieHeight * 0.1,
        vx: 0,
        vy: 0,
        rotation: randomRange(-0.12, 0.12),
        vr: 0,
        scale: 0,
        opacity: 0,
        fading: false,
        dismissFrame: 0,
        swayPhase: randomRange(0, Math.PI * 2),
        swaySpeed: randomRange(0.08, 0.13),
        swayAmount: randomRange(metrics.fontSize * 0.012, metrics.fontSize * 0.026),
    };
}

function beginReturn(cookie, metrics) {
    cookie.scatter = createScatterProfile();
    cookie.status = "returning";
    cookie.tapCount = 0;
    cookie.pulse = 0;
    cookie.crackProgress = 0;
    cookie.pieces = [];
    cookie.returnProgress = 0;
    cookie.returnRotation = randomRange(-0.18, 0.18);

    if (cookie.paper) {
        cookie.paper.fading = true;
        cookie.paper.dismissFrame = 0;
        cookie.paper.vx = randomRange(-metrics.fontSize * 0.012, metrics.fontSize * 0.012);
        cookie.paper.vy = randomRange(metrics.fontSize * 0.012, metrics.fontSize * 0.026);
        cookie.paper.vr = randomRange(-0.014, 0.014);
    }
}

function returnOtherOpenCookies(state, metrics, currentCookieId) {
    for (const cookie of state.cookies) {
        if (
            cookie.id !== currentCookieId &&
            cookie.paper &&
            !cookie.paper.fading &&
            cookie.status !== "whole" &&
            cookie.status !== "returning"
        ) {
            beginReturn(cookie, metrics);
        }
    }
}

function completeReturn(cookie) {
    cookie.status = "whole";
    cookie.tapCount = 0;
    cookie.pulse = 0;
    cookie.crackProgress = 0;
    cookie.returnProgress = 1;
    cookie.paper = null;
    cookie.pieces = [];
    cookie.message = get_random(messages);
}

function handleTap(state, metrics, point) {
    for (let index = state.cookies.length - 1; index >= 0; index -= 1) {
        const cookie = state.cookies[index];
        const paperRect = getPaperRect(cookie, metrics);

        if (
            paperRect &&
            cookie.status !== "returning" &&
            cookie.paper.opacity > 0.7 &&
            pointInRect(point, paperRect)
        ) {
            beginReturn(cookie, metrics);
            return;
        }
    }

    for (let index = state.cookies.length - 1; index >= 0; index -= 1) {
        const cookie = state.cookies[index];

        if (cookie.status === "whole" && isPointInCookie(point, cookie, metrics)) {
            cookie.tapCount += 1;
            cookie.pulse = 1;

            if (cookie.tapCount >= COOKIE_TAPS_TO_BREAK) {
                returnOtherOpenCookies(state, metrics, cookie.id);
                beginBreak(cookie, metrics);
            }

            return;
        }
    }
}

function updateInteraction(state, metrics, movement) {
    const point = movement.mousePoint;

    if (movement.isDown && !state.prevIsDown) {
        state.downPoint = { x: point.x, y: point.y };
        handleTap(state, metrics, point);
    }

    if (!movement.isDown && state.prevIsDown) {
        state.downPoint = null;
    }

    state.prevIsDown = movement.isDown;
}

function updatePaper(cookie, metrics) {
    if (!cookie.paper) {
        return;
    }

    const paper = cookie.paper;

    if (paper.fading) {
        paper.dismissFrame += 1;
        paper.vy += metrics.fontSize * 0.0018;
        paper.vx *= 0.96;
        paper.x += paper.vx;
        paper.x += Math.sin(paper.dismissFrame * paper.swaySpeed + paper.swayPhase) * paper.swayAmount;
        paper.y += paper.vy;
        paper.rotation += paper.vr + Math.sin(paper.dismissFrame * 0.09 + paper.swayPhase) * 0.004;
        paper.scale = Math.max(0.82, paper.scale - 0.003);
        paper.opacity = Math.max(0, paper.opacity - 0.018);

        if (paper.y > metrics.height + metrics.paperHeight || paper.opacity <= 0.02) {
            paper.opacity = 0;
        }
        return;
    }

    paper.opacity = Math.min(1, paper.opacity + 0.055);
    paper.scale = Math.min(1, paper.scale + 0.045);
    paper.vx += (metrics.paperTargetX - paper.x) * 0.018;
    paper.vy += (metrics.paperTargetY - paper.y) * 0.018;
    paper.vx *= 0.84;
    paper.vy *= 0.84;
    paper.x += paper.vx;
    paper.y += paper.vy;
    paper.rotation *= 0.92;

    if (paper.scale > 0.96 && distance(paper, { x: metrics.paperTargetX, y: metrics.paperTargetY }) < metrics.cookieWidth * 0.06) {
        cookie.status = "open";
    }
}

function updateCookie(cookie, metrics) {
    cookie.pulse *= 0.82;

    if (cookie.status === "breaking" || cookie.status === "open") {
        cookie.crackProgress = Math.min(1, cookie.crackProgress + 0.05);

        for (const piece of cookie.pieces) {
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.vy += metrics.cookieHeight * 0.013;
            piece.rotation += piece.vr;
            piece.opacity = clamp(1 - (piece.y - metrics.wordY) / (metrics.height * 0.75), 0, 1);
        }

        updatePaper(cookie, metrics);
    }

    if (cookie.status === "returning") {
        cookie.returnProgress = Math.min(1, cookie.returnProgress + 0.055);
        cookie.returnRotation *= 0.9;
        updatePaper(cookie, metrics);

        if (cookie.returnProgress >= 1 && (!cookie.paper || cookie.paper.opacity <= 0)) {
            completeReturn(cookie);
        }
    }
}

function updateState(state, metrics, movement) {
    state.frame += 1;
    updateInteraction(state, metrics, movement);

    for (const cookie of state.cookies) {
        updateCookie(cookie, metrics);
    }
}

function drawBackground(ctx, width, height) {
    ctx.fillStyle = THEME.background;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(
        width * 0.42,
        height * 0.34,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.78
    );

    glow.addColorStop(0, "rgba(145, 43, 48, 0.42)");
    glow.addColorStop(0.62, "rgba(101, 22, 27, 0.08)");
    glow.addColorStop(1, "rgba(45, 8, 13, 0.42)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const minSize = Math.min(width, height);
    const fiberCount = Math.round(clamp(width * height / 5200, 80, 230));
    const dustCount = Math.round(clamp(width * height / 3800, 120, 420));

    ctx.save();
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "screen";

    for (let index = 0; index < fiberCount; index += 1) {
        const x = textureRatio(index, 1) * width;
        const y = textureRatio(index, 2) * height;
        const length = lerp(minSize * 0.012, minSize * 0.052, textureRatio(index, 3));
        const angle = lerp(-0.62, -0.24, textureRatio(index, 4));
        const alpha = lerp(0.008, 0.026, textureRatio(index, 5));

        ctx.strokeStyle = `rgba(255, 188, 164, ${alpha})`;
        ctx.lineWidth = lerp(0.45, 1.15, textureRatio(index, 6));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    for (let index = 0; index < dustCount; index += 1) {
        const x = textureRatio(index, 7) * width;
        const y = textureRatio(index, 8) * height;
        const radius = lerp(0.35, 1.2, textureRatio(index, 9));
        const alpha = lerp(0.008, 0.028, textureRatio(index, 10));

        ctx.fillStyle = `rgba(255, 211, 186, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalCompositeOperation = "multiply";

    for (let index = 0; index < fiberCount; index += 1) {
        const x = textureRatio(index, 11) * width;
        const y = textureRatio(index, 12) * height;
        const length = lerp(minSize * 0.01, minSize * 0.044, textureRatio(index, 13));
        const angle = lerp(-0.48, -0.18, textureRatio(index, 14));
        const alpha = lerp(0.01, 0.034, textureRatio(index, 15));

        ctx.strokeStyle = `rgba(43, 5, 9, ${alpha})`;
        ctx.lineWidth = lerp(0.5, 1.35, textureRatio(index, 16));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
    }

    ctx.restore();
}

function createLetterCookieGradient(ctx, metrics) {
    const gradient = ctx.createLinearGradient(
        -metrics.cookieWidth * 0.45,
        -metrics.cookieHeight * 0.6,
        metrics.cookieWidth * 0.45,
        metrics.cookieHeight * 0.58
    );

    gradient.addColorStop(0, THEME.cookieLight);
    gradient.addColorStop(0.48, THEME.cookie);
    gradient.addColorStop(1, THEME.cookieDark);

    return gradient;
}

function drawLetterTexture(ctx, metrics, cookie, width, height) {
    const dotCount = 9;

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";

    for (let index = 0; index < dotCount; index += 1) {
        const seed = (cookie.id + 1) * (index + 3);
        const x = (Math.sin(seed * 12.9898) * 0.5 + 0.5) * width - width / 2;
        const y = (Math.sin(seed * 78.233) * 0.5 + 0.5) * height - height / 2;
        const radius = metrics.fontSize * (0.012 + (index % 3) * 0.004);

        ctx.fillStyle = index % 2 === 0
            ? "rgba(112, 54, 22, 0.16)"
            : "rgba(255, 229, 155, 0.24)";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawCracks(ctx, metrics, cookie, width, height) {
    const tapCount = cookie.tapCount || 0;

    if (tapCount <= 0 || tapCount >= COOKIE_TAPS_TO_BREAK) {
        return;
    }

    const crack = getConnectedCrackPath(cookie, width, height);
    const visiblePointCount = Math.min(crack.length, 2 + tapCount * 2);

    ctx.strokeStyle = `rgba(82, 37, 18, ${0.35 + tapCount * 0.18})`;
    ctx.lineWidth = Math.max(1, metrics.fontSize * 0.025);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(crack[0].x, crack[0].y);
    for (let index = 1; index < visiblePointCount; index += 1) {
        ctx.lineTo(crack[index].x, crack[index].y);
    }
    ctx.stroke();

    if (tapCount > 1) {
        const branchBase = crack[2];

        ctx.beginPath();
        ctx.moveTo(branchBase.x, branchBase.y);
        ctx.lineTo(branchBase.x - width * 0.12, branchBase.y + height * 0.08);
        ctx.stroke();
    }
}

function drawCookieLetterGlyph(ctx, metrics, cookie, width, height) {
    const padding = metrics.fontSize * 0.22;
    const buffer = document.createElement("canvas");
    buffer.width = Math.ceil(width + padding * 2);
    buffer.height = Math.ceil(height + padding * 2);

    const letterCtx = buffer.getContext("2d");
    letterCtx.translate(buffer.width / 2, buffer.height / 2);

    setLetterFont(letterCtx, metrics.fontSize);
    letterCtx.lineJoin = "round";
    letterCtx.lineWidth = Math.max(2, metrics.fontSize * 0.09);
    letterCtx.strokeStyle = THEME.cookieEdge;
    letterCtx.strokeText(cookie.char, 0, 0);

    letterCtx.fillStyle = createLetterCookieGradient(letterCtx, metrics);
    letterCtx.fillText(cookie.char, 0, 0);
    drawLetterTexture(letterCtx, metrics, cookie, width, height);

    letterCtx.globalCompositeOperation = "source-atop";
    letterCtx.lineWidth = Math.max(1, metrics.fontSize * 0.018);
    letterCtx.strokeStyle = "rgba(255, 232, 166, 0.55)";
    letterCtx.beginPath();
    letterCtx.moveTo(-width * 0.22, -height * 0.2);
    letterCtx.quadraticCurveTo(0, -height * 0.34, width * 0.22, -height * 0.12);
    letterCtx.stroke();

    drawCracks(letterCtx, metrics, cookie, width, height);

    ctx.drawImage(buffer, -buffer.width / 2, -buffer.height / 2);
}

function drawWholeCookie(ctx, metrics, cookie, x, y, options = {}) {
    const pulse = cookie.pulse || 0;
    const position = metrics.cookiePositions[cookie.id];
    const width = position.letterWidth * (1 + pulse * 0.08);
    const height = metrics.cookieHeight * (1 - pulse * 0.025);
    const shake = cookie.tapCount > 0 ? Math.sin(options.frame * 0.65 + cookie.id) * pulse * metrics.fontSize * 0.035 : 0;
    const renderScale = options.scale ?? getCookieScale(cookie, metrics);

    ctx.save();
    ctx.translate(x + shake, y);
    ctx.rotate(options.rotation || 0);
    ctx.scale(renderScale, renderScale);

    ctx.globalAlpha = options.alpha ?? 1;
    drawCookieLetterGlyph(ctx, metrics, cookie, width, height);

    ctx.restore();
}

function drawCookiePiece(ctx, metrics, piece) {
    const width = piece.letterWidth;
    const height = piece.letterHeight ?? metrics.cookieHeight;
    const renderMetrics = {
        ...metrics,
        fontSize: piece.fontSize ?? metrics.fontSize,
        cookieHeight: height,
        cookieWidth: Math.max(metrics.cookieWidth, width),
    };

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.globalAlpha = piece.opacity;

    ctx.save();
    ctx.beginPath();
    for (let index = 0; index < piece.clipPath.length; index += 1) {
        const point = piece.clipPath[index];

        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    }
    ctx.closePath();
    ctx.clip();

    ctx.translate(piece.originOffsetX, piece.originOffsetY);
    drawCookieLetterGlyph(ctx, renderMetrics, piece, width, height);
    ctx.restore();

    ctx.restore();
}

function drawPaper(ctx, metrics, cookie) {
    if (!cookie.paper || cookie.paper.opacity <= 0) {
        return;
    }

    const paper = cookie.paper;
    const progress = easeOutCubic(paper.scale);
    const width = lerp(metrics.cookieWidth * 0.2, metrics.paperWidth, progress);
    const height = lerp(metrics.cookieHeight * 0.22, metrics.paperHeight, progress);
    const fold = Math.max(4, width * 0.025);
    const fontSize = clamp(height * 0.28, 12, metrics.cookieWidth * 0.24);

    ctx.save();
    ctx.globalAlpha = paper.opacity;
    ctx.translate(paper.x, paper.y);
    ctx.rotate(paper.rotation);

    ctx.fillStyle = THEME.paper;
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.lineTo(width / 2, -height / 2 + fold * 0.3);
    ctx.lineTo(width / 2 - fold * 0.4, height / 2);
    ctx.lineTo(-width / 2 + fold * 0.35, height / 2 - fold * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(114, 66, 36, 0.35)";
    ctx.lineWidth = Math.max(1, height * 0.025);
    ctx.stroke();

    ctx.strokeStyle = THEME.paperRule;
    ctx.lineWidth = Math.max(1, height * 0.018);
    ctx.beginPath();
    ctx.moveTo(-width * 0.42, -height * 0.23);
    ctx.lineTo(width * 0.42, -height * 0.23);
    ctx.stroke();

    ctx.fillStyle = THEME.ink;
    ctx.font = `600 ${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cookie.message, 0, height * 0.1, width * 0.86);

    ctx.restore();
}

function drawState(ctx, metrics, state) {
    for (const cookie of state.cookies) {
        if (cookie.status === "whole") {
            const position = getCookiePoint(cookie, metrics);
            drawWholeCookie(ctx, metrics, cookie, position.x, position.y, {
                frame: state.frame,
                rotation: getCookieRotation(cookie, metrics),
            });
        } else if (cookie.status === "returning") {
            const position = getCookieHomePosition(cookie, metrics);
            const progress = easeOutCubic(cookie.returnProgress);

            drawWholeCookie(ctx, metrics, cookie, position.x, position.y, {
                frame: state.frame,
                rotation: position.scatterRotation + cookie.returnRotation * (1 - progress),
                scale: lerp(0.42, 1, progress),
                alpha: progress,
            });
        } else {
            for (const piece of cookie.pieces) {
                drawCookiePiece(ctx, metrics, piece);
            }
        }
    }

    for (const cookie of state.cookies) {
        if (cookie.paper && cookie.status !== "whole") {
            drawPaper(ctx, metrics, cookie);
        }
    }
}

export function AnimationF(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height);

    updateState(state, metrics, movement);

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawBackground(ctx, width, height);
    drawState(ctx, metrics, state);

    ctx.restore();
}

export function CleanF() {
    fortuneState = null;
}

export const descriptionF = [
    `운이 좋게 잘 풀린 일이 꽤 많습니다.`,
    `대입 때는 수능 성적이 정말 잘 나왔어요. 개인 최고 성적이었습니다.
    덕분에 수시를 모두 광탈해도 정시로 좋은 대학을 갈 수 있었습니다.
    심지어 제대로 정시를 준비하던 것도 아니었어요. 
    그냥 6모 성적이 좀 좋길래 정시도 노려본 것이 잘 풀린 거죠.`,
    `심지어 전공도 적성에 맞았습니다.
    무려 고3 중반쯤에 디자인과에서 컴공과로 지망을 바꿨는데도 말이죠.
    엄청 심사숙고해서 진로를 바꾼 것도 아니었는데 적성에 맞는 전공을 찾은 건 정말 행운이었어요.`,
    `전공이 적성에 잘 맞다보니 자연스레 학점도 잘 나왔고, 좋은 학점 덕분에 대학원 입시도 쉽게 통과했습니다.
    진행하던 졸업 프로젝트를 좋게 봐주신 덕분에 연구실 컨택도 잘 되었고, 결과적으로 원하는 연구실에 진학할 수 있었죠.`,
    `이렇다 보니, 가끔은 지금의 제 모습이 정말 제 노력의 결과물이 맞는지 의심될 때도 있습니다.
    "운이 따라줄 때 그 기회를 잡는 것도 능력인 거니까..." 라면서 합리화하고 있어요.`
];

export const toolTipF = [
    '"FORTUNE" 모양의 쿠키를 여러 번 터치하면 쿠키가 깨지고, 운세가 나타납니다!',
    '말 그대로 포춘 쿠키인 거죠.'
];
