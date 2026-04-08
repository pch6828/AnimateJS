const FONT_FAMILY = '"Barriecito", "Times New Roman", serif';
const BODY_TEXT = 'body';
const BODY_LETTERS = ['b', 'o', 'd', 'y'];
const PALETTE = {
    backgroundTop: '#29456f',
    backgroundBottom: '#1f3557',
    backgroundLight: 'rgba(255, 246, 214, 0.05)',
    backgroundDark: 'rgba(10, 18, 34, 0.1)',
    homeText: '#f6e8b4',
    houseFillTop: '#fbefcf',
    houseFillBottom: '#e3bf7b',
    houseStroke: '#fff0cd',
    houseShadow: 'rgba(35, 15, 59, 0.34)',
    roofStroke: '#fff0cc',
    bodyText: '#f4c94b',
    windowFill: 'rgba(255, 247, 214, 0.42)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function approach(current, target, delta) {
    if (current < target) {
        return Math.min(current + delta, target);
    }

    return Math.max(current - delta, target);
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

function pointInRect(point, rect) {
    return point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height;
}

function expandRect(rect, amount) {
    return {
        x: rect.x - amount,
        y: rect.y - amount,
        width: rect.width + amount * 2,
        height: rect.height + amount * 2,
    };
}

function manhattanDistance(a, b) {
    return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}

function getAnchorFromLetter(letter) {
    return {
        x: letter.x + letter.width / 2,
        y: letter.y - letter.height * 0.44,
    };
}

function setLetterFromAnchor(letter, anchor, width, height) {
    letter.x = clamp(anchor.x - letter.width / 2, 0, Math.max(0, width - letter.width));
    letter.y = clamp(anchor.y + letter.height * 0.44, letter.height, height);
}

function buildHomePositions(ctx, startX, baselineY) {
    const positions = [];
    let cursorX = startX;

    for (const letter of BODY_LETTERS) {
        const width = ctx.measureText(letter).width;
        positions.push({
            x: cursorX,
            y: baselineY,
            width,
        });
        cursorX += width;
    }

    return positions;
}

function getMetrics(ctx, width, height) {
    const scale = Math.min(width, height);
    const fontSize = clamp(scale * 0.18, 66, 180);
    const centerX = width / 2;
    const centerY = height / 2;
    const baselineY = centerY + fontSize * 0.5;
    const bodyBottomY = baselineY + fontSize * 0.12;
    const roofRise = fontSize * 1.06;
    const houseHeight = fontSize * 1.1;
    const wallInset = fontSize * 0.16;
    const strokeWidth = fontSize * 0.16;
    const routeStep = clamp(scale * 0.05, 18, 28);

    ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const homeWidth = ctx.measureText('Home').width;
    const bodyWidth = ctx.measureText(BODY_TEXT).width;
    const houseGap = fontSize * 0.04;
    const totalWidth = homeWidth + houseGap + bodyWidth;
    const leftX = centerX - totalWidth / 2;
    const houseX = leftX + homeWidth + houseGap;
    const houseWidth = Math.max(bodyWidth + fontSize * 0.24, fontSize * 2.05);
    const houseY = bodyBottomY - houseHeight;
    const roofPeak = {
        x: houseX + houseWidth / 2,
        y: houseY - roofRise,
    };
    const roofLeft = {
        x: houseX - fontSize * 0.12,
        y: houseY + fontSize * 0.04,
    };
    const roofRight = {
        x: houseX + houseWidth + fontSize * 0.12,
        y: houseY + fontSize * 0.04,
    };
    const houseRect = {
        x: houseX,
        y: houseY,
        width: houseWidth,
        height: houseHeight,
    };
    const interiorRect = {
        x: houseX + wallInset,
        y: houseY + wallInset * 1.05,
        width: houseWidth - wallInset * 2,
        height: houseHeight - wallInset * 1.9,
    };
    const bottomPassageRect = {
        x: interiorRect.x + fontSize * 0.06,
        y: houseY + houseHeight - fontSize * 0.12,
        width: interiorRect.width - fontSize * 0.12,
        height: fontSize * 0.42,
    };
    const chimneyRect = {
        x: houseX + houseWidth * 0.73,
        y: roofPeak.y + fontSize * 0.1,
        width: houseWidth * 0.11,
        height: roofRise * 0.55,
    };
    const homeRect = {
        x: leftX - fontSize * 0.06,
        y: baselineY - fontSize,
        width: homeWidth + fontSize * 0.12,
        height: fontSize * 1.18,
    };
    const bodyStartX = interiorRect.x + (interiorRect.width - bodyWidth) / 2;
    const bodyBaselineY = baselineY - fontSize * 0.08;
    const homePositions = buildHomePositions(ctx, bodyStartX, bodyBaselineY);

    return {
        width,
        height,
        centerX,
        centerY,
        fontSize,
        baselineY,
        leftX,
        homeWidth,
        bodyWidth,
        houseRect,
        interiorRect,
        bottomPassageRect,
        chimneyRect,
        roofPeak,
        roofLeft,
        roofRight,
        strokeWidth,
        routeStep,
        homeRect,
        homePositions,
    };
}

function createLetterState(char, index, homePosition, fontSize) {
    return {
        id: index,
        char,
        width: homePosition.width,
        height: fontSize,
        x: homePosition.x,
        y: homePosition.y,
        homeX: homePosition.x,
        homeY: homePosition.y,
        isDragging: false,
        pointerOffsetX: 0,
        pointerOffsetY: 0,
        prevPointerX: null,
        prevPointerY: null,
        route: [],
        routeIndex: 0,
        speed: 0,
    };
}

function createState(metrics) {
    return {
        width: metrics.width,
        height: metrics.height,
        frame: 0,
        prevIsDown: false,
        activeLetterId: null,
        maskBuffer: null,
        letterBuffer: null,
        bufferWidth: 0,
        bufferHeight: 0,
        letters: metrics.homePositions.map((position, index) => (
            createLetterState(BODY_LETTERS[index], index, position, metrics.fontSize)
        )),
    };
}

function ensureState(metrics) {
    if (!homebodyState || homebodyState.width !== metrics.width || homebodyState.height !== metrics.height) {
        homebodyState = createState(metrics);
    }

    return homebodyState;
}

function ensureBuffers(state, metrics, ctx) {
    const width = Math.max(1, Math.round(metrics.width));
    const height = Math.max(1, Math.round(metrics.height));

    if (
        state.maskBuffer &&
        state.letterBuffer &&
        state.bufferWidth === width &&
        state.bufferHeight === height
    ) {
        return;
    }

    state.maskBuffer = createScratchCanvas(width, height, ctx);
    state.letterBuffer = createScratchCanvas(width, height, ctx);
    state.bufferWidth = width;
    state.bufferHeight = height;
}

function getLetterHitBox(letter) {
    return {
        x: letter.x,
        y: letter.y - letter.height,
        width: letter.width,
        height: letter.height * 1.06,
    };
}

function getLetterAtPoint(state, point) {
    for (let index = state.letters.length - 1; index >= 0; index -= 1) {
        const letter = state.letters[index];
        if (pointInRect(point, getLetterHitBox(letter))) {
            return letter;
        }
    }

    return null;
}

function bringLetterToFront(state, letterId) {
    const currentIndex = state.letters.findIndex((letter) => letter.id === letterId);
    if (currentIndex === -1 || currentIndex === state.letters.length - 1) {
        return;
    }

    const [letter] = state.letters.splice(currentIndex, 1);
    state.letters.push(letter);
}

function isBlockedPoint(point, metrics, padding) {
    const expandedHomeRect = expandRect(metrics.homeRect, padding);
    if (pointInRect(point, expandedHomeRect)) {
        return true;
    }

    const expandedHouseRect = expandRect(metrics.houseRect, padding);
    const expandedInteriorRect = expandRect(metrics.interiorRect, -padding * 0.35);
    const expandedBottomPassage = expandRect(metrics.bottomPassageRect, padding * 0.1);

    if (
        pointInRect(point, expandedHouseRect) &&
        !pointInRect(point, expandedInteriorRect) &&
        !pointInRect(point, expandedBottomPassage)
    ) {
        return true;
    }

    if (pointInRect(point, expandRect(metrics.chimneyRect, padding * 0.7))) {
        return true;
    }

    const roofRect = {
        x: metrics.roofLeft.x - padding,
        y: metrics.roofPeak.y - padding,
        width: metrics.roofRight.x - metrics.roofLeft.x + padding * 2,
        height: metrics.houseRect.y - metrics.roofPeak.y + metrics.strokeWidth + padding,
    };

    return pointInRect(point, roofRect);
}

function toCell(point, step, cols, rows) {
    return {
        col: clamp(Math.floor(point.x / step), 0, cols - 1),
        row: clamp(Math.floor(point.y / step), 0, rows - 1),
    };
}

function toPoint(cell, step) {
    return {
        x: cell.col * step + step / 2,
        y: cell.row * step + step / 2,
    };
}

function getFallbackRoute(startPoint, goalPoint, metrics) {
    const entryX = clamp(
        goalPoint.x,
        metrics.bottomPassageRect.x + metrics.routeStep * 0.4,
        metrics.bottomPassageRect.x + metrics.bottomPassageRect.width - metrics.routeStep * 0.4
    );
    const bottomOutside = {
        x: entryX,
        y: metrics.houseRect.y + metrics.houseRect.height + metrics.routeStep * 0.95,
    };
    const bottomInside = {
        x: entryX,
        y: metrics.houseRect.y + metrics.houseRect.height - metrics.routeStep * 0.38,
    };

    return [
        { x: startPoint.x, y: bottomOutside.y },
        bottomOutside,
        bottomInside,
        { x: goalPoint.x, y: bottomInside.y },
        goalPoint,
    ];
}

function buildRoute(startPoint, goalPoint, metrics, letter) {
    const step = metrics.routeStep;
    const cols = Math.max(1, Math.ceil(metrics.width / step));
    const rows = Math.max(1, Math.ceil(metrics.height / step));
    const start = toCell(startPoint, step, cols, rows);
    const goal = toCell(goalPoint, step, cols, rows);
    const open = [start];
    const padding = Math.max(letter.width * 0.42, letter.height * 0.28);
    const keyOf = (cell) => `${cell.col},${cell.row}`;
    const cameFrom = new Map();
    const gScore = new Map([[keyOf(start), 0]]);
    const fScore = new Map([[keyOf(start), manhattanDistance(start, goal)]]);
    const blockedCache = new Map();
    const directions = [
        { col: 1, row: 0 },
        { col: -1, row: 0 },
        { col: 0, row: 1 },
        { col: 0, row: -1 },
    ];

    const isBlockedCell = (cell) => {
        const key = keyOf(cell);
        if (blockedCache.has(key)) {
            return blockedCache.get(key);
        }

        const point = toPoint(cell, step);
        const blocked = isBlockedPoint(point, metrics, padding) && key !== keyOf(goal);
        blockedCache.set(key, blocked);
        return blocked;
    };

    while (open.length > 0) {
        let currentIndex = 0;
        let current = open[0];
        let currentScore = fScore.get(keyOf(current)) ?? Infinity;

        for (let index = 1; index < open.length; index += 1) {
            const candidate = open[index];
            const candidateScore = fScore.get(keyOf(candidate)) ?? Infinity;

            if (candidateScore < currentScore) {
                currentIndex = index;
                current = candidate;
                currentScore = candidateScore;
            }
        }

        if (current.col === goal.col && current.row === goal.row) {
            const route = [];
            let routeKey = keyOf(current);
            let routeCell = current;

            while (cameFrom.has(routeKey)) {
                route.unshift(toPoint(routeCell, step));
                routeCell = cameFrom.get(routeKey);
                routeKey = keyOf(routeCell);
            }

            route.push(goalPoint);
            return route;
        }

        open.splice(currentIndex, 1);

        for (const direction of directions) {
            const next = {
                col: current.col + direction.col,
                row: current.row + direction.row,
            };

            if (next.col < 0 || next.col >= cols || next.row < 0 || next.row >= rows || isBlockedCell(next)) {
                continue;
            }

            const nextKey = keyOf(next);
            const tentativeG = (gScore.get(keyOf(current)) ?? Infinity) + 1;

            if (tentativeG >= (gScore.get(nextKey) ?? Infinity)) {
                continue;
            }

            cameFrom.set(nextKey, current);
            gScore.set(nextKey, tentativeG);
            fScore.set(nextKey, tentativeG + manhattanDistance(next, goal));

            if (!open.some((cell) => cell.col === next.col && cell.row === next.row)) {
                open.push(next);
            }
        }
    }

    return getFallbackRoute(startPoint, goalPoint, metrics);
}

function beginDrag(state, letter, pointer) {
    state.activeLetterId = letter.id;
    bringLetterToFront(state, letter.id);
    letter.isDragging = true;
    letter.pointerOffsetX = pointer.x - letter.x;
    letter.pointerOffsetY = pointer.y - letter.y;
    letter.prevPointerX = pointer.x;
    letter.prevPointerY = pointer.y;
    letter.route = [];
    letter.routeIndex = 0;
    letter.speed = 0;
}

function updateDraggedLetter(letter, pointer, width, height) {
    letter.x = clamp(pointer.x - letter.pointerOffsetX, 0, Math.max(0, width - letter.width));
    letter.y = clamp(pointer.y - letter.pointerOffsetY, letter.height, height);
    letter.prevPointerX = pointer.x;
    letter.prevPointerY = pointer.y;
}

function releaseLetter(letter, metrics) {
    const startPoint = getAnchorFromLetter(letter);
    const goalPoint = {
        x: letter.homeX + letter.width / 2,
        y: letter.homeY - letter.height * 0.44,
    };
    const route = buildRoute(startPoint, goalPoint, metrics, letter);

    letter.isDragging = false;
    letter.pointerOffsetX = 0;
    letter.pointerOffsetY = 0;
    letter.prevPointerX = null;
    letter.prevPointerY = null;
    letter.route = route;
    letter.routeIndex = 0;
    letter.speed = metrics.routeStep * 0.16;
}

function moveLetterHome(letter, metrics) {
    if (letter.routeIndex >= letter.route.length) {
        letter.route = [];
        letter.routeIndex = 0;
        letter.speed = 0;
        setLetterFromAnchor(letter, {
            x: letter.homeX + letter.width / 2,
            y: letter.homeY - letter.height * 0.44,
        }, metrics.width, metrics.height);
        return;
    }

    const anchor = getAnchorFromLetter(letter);
    const target = letter.route[letter.routeIndex];
    const dx = target.x - anchor.x;
    const dy = target.y - anchor.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    letter.speed = Math.min(metrics.routeStep * 0.62, letter.speed + metrics.routeStep * 0.045);

    if (distance <= letter.speed) {
        setLetterFromAnchor(letter, target, metrics.width, metrics.height);
        letter.routeIndex += 1;
        return;
    }

    const nextAnchor = { x: anchor.x, y: anchor.y };
    if (Math.abs(dx) > 0) {
        nextAnchor.x = approach(anchor.x, target.x, letter.speed);
    } else {
        nextAnchor.y = approach(anchor.y, target.y, letter.speed);
    }

    setLetterFromAnchor(letter, nextAnchor, metrics.width, metrics.height);
}

function updateInteraction(state, metrics, movement) {
    state.frame += 1;
    const pointer = movement.mousePoint;

    if (!state.prevIsDown && movement.isDown) {
        const selectedLetter = getLetterAtPoint(state, pointer);
        if (selectedLetter) {
            beginDrag(state, selectedLetter, pointer);
        }
    }

    if (movement.isDown && state.activeLetterId !== null) {
        const activeLetter = state.letters.find((letter) => letter.id === state.activeLetterId);
        if (activeLetter) {
            updateDraggedLetter(activeLetter, pointer, metrics.width, metrics.height);
        }
    }

    if (state.prevIsDown && !movement.isDown && state.activeLetterId !== null) {
        const activeLetter = state.letters.find((letter) => letter.id === state.activeLetterId);
        if (activeLetter) {
            releaseLetter(activeLetter, metrics);
        }
        state.activeLetterId = null;
    }

    for (const letter of state.letters) {
        if (!letter.isDragging && letter.route.length > 0) {
            moveLetterHome(letter, metrics);
        }
    }

    state.prevIsDown = movement.isDown;
}

function appendWonkyRectPath(ctx, rect, wobbleX, wobbleY) {
    ctx.moveTo(rect.x + wobbleX * 0.4, rect.y + wobbleY * 0.12);
    ctx.lineTo(rect.x + rect.width * 0.32, rect.y - wobbleY * 0.22);
    ctx.lineTo(rect.x + rect.width * 0.68, rect.y + wobbleY * 0.18);
    ctx.lineTo(rect.x + rect.width - wobbleX * 0.62, rect.y - wobbleY * 0.18);
    ctx.lineTo(rect.x + rect.width + wobbleX * 0.14, rect.y + rect.height * 0.28);
    ctx.lineTo(rect.x + rect.width - wobbleX * 0.12, rect.y + rect.height * 0.72);
    ctx.lineTo(rect.x + rect.width + wobbleX * 0.22, rect.y + rect.height - wobbleY * 0.34);
    ctx.lineTo(rect.x + rect.width * 0.62, rect.y + rect.height + wobbleY * 0.24);
    ctx.lineTo(rect.x + rect.width * 0.26, rect.y + rect.height - wobbleY * 0.2);
    ctx.lineTo(rect.x - wobbleX * 0.28, rect.y + rect.height + wobbleY * 0.32);
    ctx.lineTo(rect.x + wobbleX * 0.16, rect.y + rect.height * 0.56);
    ctx.closePath();
}

function appendWallPath(ctx, metrics) {
    appendWonkyRectPath(
        ctx,
        metrics.houseRect,
        metrics.fontSize * 0.07,
        metrics.fontSize * 0.05
    );
}

function appendHouseShellPath(ctx, metrics) {
    const chimneyWobbleX = metrics.fontSize * 0.03;
    const chimneyWobbleY = metrics.fontSize * 0.025;

    appendWallPath(ctx, metrics);
    ctx.moveTo(metrics.roofLeft.x - metrics.fontSize * 0.035, metrics.roofLeft.y + metrics.fontSize * 0.012);
    ctx.lineTo(metrics.roofPeak.x - metrics.fontSize * 0.008, metrics.roofPeak.y + metrics.fontSize * 0.005);
    ctx.lineTo(metrics.roofPeak.x + metrics.fontSize * 0.01, metrics.roofPeak.y - metrics.fontSize * 0.021);
    ctx.lineTo(metrics.roofRight.x + metrics.fontSize * 0.032, metrics.roofRight.y + metrics.fontSize * 0.002);
    ctx.closePath();
    appendWonkyRectPath(ctx, metrics.chimneyRect, chimneyWobbleX, chimneyWobbleY);
}

function drawHouse(ctx, metrics) {
    ctx.lineWidth = metrics.strokeWidth;
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'round';
    ctx.shadowColor = PALETTE.houseShadow;
    ctx.shadowBlur = metrics.fontSize * 0.1;
    ctx.shadowOffsetY = metrics.fontSize * 0.03;

    ctx.beginPath();
    appendHouseShellPath(ctx, metrics);
    ctx.fillStyle = PALETTE.houseFillTop;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = PALETTE.houseStroke;
    ctx.stroke();
}

function renderHouseMask(state, metrics) {
    const maskCtx = state.maskBuffer.getContext('2d');

    maskCtx.clearRect(0, 0, metrics.width, metrics.height);
    maskCtx.lineWidth = metrics.strokeWidth;
    maskCtx.lineJoin = 'miter';
    maskCtx.lineCap = 'round';
    maskCtx.fillStyle = '#ffffff';
    maskCtx.strokeStyle = '#ffffff';
    maskCtx.beginPath();
    appendHouseShellPath(maskCtx, metrics);
    maskCtx.fill();
    maskCtx.stroke();
}

function renderLetterMaskLayer(state, metrics, fillStyle, compositeOperation) {
    const letterCtx = state.letterBuffer.getContext('2d');

    letterCtx.clearRect(0, 0, metrics.width, metrics.height);
    letterCtx.textAlign = 'left';
    letterCtx.textBaseline = 'alphabetic';
    letterCtx.font = `400 ${metrics.fontSize}px ${FONT_FAMILY}`;
    letterCtx.fillStyle = fillStyle;
    for (const letter of state.letters) {
        letterCtx.fillText(letter.char, letter.x, letter.y);
    }

    letterCtx.globalCompositeOperation = compositeOperation;
    letterCtx.drawImage(state.maskBuffer, 0, 0);
    letterCtx.globalCompositeOperation = 'source-over';
}

function drawBackground(ctx, metrics) {
    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    backgroundGradient.addColorStop(0, PALETTE.backgroundTop);
    backgroundGradient.addColorStop(1, PALETTE.backgroundBottom);
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    const glow = ctx.createRadialGradient(
        metrics.centerX,
        metrics.centerY * 0.92,
        metrics.fontSize * 0.4,
        metrics.centerX,
        metrics.centerY,
        Math.max(metrics.width, metrics.height) * 0.78
    );
    glow.addColorStop(0, PALETTE.backgroundLight);
    glow.addColorStop(1, 'rgba(255, 246, 214, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    ctx.strokeStyle = PALETTE.backgroundLight;
    ctx.lineWidth = 1;
    const stripeGap = Math.max(16, metrics.fontSize * 0.12);
    for (let y = stripeGap * 0.5; y < metrics.height; y += stripeGap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(metrics.width, y);
        ctx.stroke();
    }

    ctx.fillStyle = PALETTE.backgroundLight;
    const dotGap = Math.max(24, metrics.fontSize * 0.22);
    for (let row = 0; row <= Math.ceil(metrics.height / dotGap); row += 1) {
        for (let col = 0; col <= Math.ceil(metrics.width / dotGap); col += 1) {
            const x = col * dotGap + ((row % 2) * dotGap * 0.35);
            const y = row * dotGap;
            const radius = Math.max(0.7, metrics.fontSize * 0.008 + ((row + col) % 3) * metrics.fontSize * 0.002);

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

}

function drawScene(ctx, metrics, state) {
    ctx.clearRect(0, 0, metrics.width, metrics.height);
    ctx.globalCompositeOperation = 'source-over';
    drawBackground(ctx, metrics);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `400 ${metrics.fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = PALETTE.homeText;
    ctx.fillText('Home', metrics.leftX, metrics.baselineY);

    ensureBuffers(state, metrics, ctx);
    renderHouseMask(state, metrics);
    drawHouse(ctx, metrics);

    renderLetterMaskLayer(state, metrics, PALETTE.backgroundBottom, 'destination-in');
    ctx.drawImage(state.letterBuffer, 0, 0);

    renderLetterMaskLayer(state, metrics, PALETTE.bodyText, 'destination-out');
    ctx.drawImage(state.letterBuffer, 0, 0);
}

let homebodyState = null;

export function AnimationH(ctx, width, height, movement) {
    const metrics = getMetrics(ctx, width, height);
    const state = ensureState(metrics);

    updateInteraction(state, metrics, movement);
    drawScene(ctx, metrics, state);
}

export function CleanH() {
    homebodyState = null;
}

export const descriptionH = [
    `제가 꽤 전형적인 집돌이 성향이라, 집에 있다는 감각 자체를 단어와 아이콘으로 묶어 보여 주고 싶었습니다.
    그래서 'Homebody'를 그대로 쓰기보다, 'body'가 실제 집 안에 들어가 있는 장면으로 구성했습니다.`,
    `겉으로는 멀쩡히 밖에 나가 있는 것 같아도 조금만 시간이 지나면 다시 집으로 들어가고 싶어지는 편입니다.
    이번 인터랙션에서는 그 감각을 글자를 직접 끌어내고, 놓으면 황급히 제자리로 돌아오는 움직임으로 풀었습니다.`,
    `복귀 동선도 일부러 직선이 아니라 상하좌우로만 움직이게 만들었습니다.
    덕분에 글자들이 집과 'Home' 글씨를 피해 돌아 들어가며, 약간 허둥대는 듯한 리듬이 생깁니다.`
];

export const toolTipH = [
    '집 안의 body 글자를 하나씩 밖으로 끌어내 보세요.',
    '손을 놓으면 글자가 Home과 집 외곽을 피해, 상하좌우로만 급하게 돌아갑니다.'
];
