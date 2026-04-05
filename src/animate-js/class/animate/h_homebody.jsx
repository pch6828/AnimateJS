const FONT_FAMILY = '"Oregano", "Times New Roman", serif';
const BODY_TEXT = 'body';
const BODY_LETTERS = ['b', 'o', 'd', 'y'];
const PALETTE = {
    background: '#191970',
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
    const baselineY = centerY + fontSize * 0.2;
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
    const houseGap = fontSize * 0.18;
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
    const doorRect = {
        x: houseX + houseWidth * 0.38,
        y: houseY + houseHeight * 0.56,
        width: houseWidth * 0.24,
        height: houseHeight * 0.44,
    };
    const doorPassageRect = {
        x: doorRect.x - fontSize * 0.12,
        y: interiorRect.y + interiorRect.height * 0.35,
        width: doorRect.width + fontSize * 0.24,
        height: houseHeight + fontSize * 0.55 - (interiorRect.y + interiorRect.height * 0.35),
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
    const bodyBaselineY = baselineY;
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
        doorRect,
        doorPassageRect,
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
    const expandedDoorPassage = expandRect(metrics.doorPassageRect, padding * 0.1);

    if (
        pointInRect(point, expandedHouseRect) &&
        !pointInRect(point, expandedInteriorRect) &&
        !pointInRect(point, expandedDoorPassage)
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
    const doorwayOutside = {
        x: metrics.doorRect.x + metrics.doorRect.width / 2,
        y: metrics.houseRect.y + metrics.houseRect.height + metrics.routeStep * 1.2,
    };
    const doorwayInside = {
        x: metrics.doorRect.x + metrics.doorRect.width / 2,
        y: metrics.doorRect.y + metrics.doorRect.height * 0.48,
    };

    return [
        { x: startPoint.x, y: doorwayOutside.y },
        doorwayOutside,
        doorwayInside,
        { x: goalPoint.x, y: doorwayInside.y },
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
    letter.speed = metrics.routeStep * 0.22;
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

    letter.speed = Math.min(metrics.routeStep * 0.82, letter.speed + metrics.routeStep * 0.065);

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

function appendHouseShellPath(ctx, metrics) {
    ctx.roundRect(
        metrics.houseRect.x,
        metrics.houseRect.y,
        metrics.houseRect.width,
        metrics.houseRect.height,
        metrics.fontSize * 0.16
    );
    ctx.moveTo(metrics.roofLeft.x, metrics.roofLeft.y);
    ctx.lineTo(metrics.roofPeak.x, metrics.roofPeak.y);
    ctx.lineTo(metrics.roofRight.x, metrics.roofRight.y);
    ctx.closePath();
    ctx.roundRect(
        metrics.chimneyRect.x,
        metrics.chimneyRect.y,
        metrics.chimneyRect.width,
        metrics.chimneyRect.height,
        metrics.fontSize * 0.04
    );
}

function drawHouse(ctx, metrics) {
    ctx.lineWidth = metrics.strokeWidth;
    ctx.lineJoin = 'round';
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

    ctx.fillStyle = PALETTE.windowFill;
    ctx.beginPath();
    ctx.roundRect(
        metrics.interiorRect.x + metrics.interiorRect.width * 0.06,
        metrics.interiorRect.y + metrics.interiorRect.height * 0.18,
        metrics.interiorRect.width * 0.18,
        metrics.interiorRect.height * 0.2,
        metrics.fontSize * 0.04
    );
    ctx.fill();

    ctx.beginPath();
    ctx.roundRect(
        metrics.interiorRect.x + metrics.interiorRect.width * 0.76,
        metrics.interiorRect.y + metrics.interiorRect.height * 0.18,
        metrics.interiorRect.width * 0.18,
        metrics.interiorRect.height * 0.2,
        metrics.fontSize * 0.04
    );
    ctx.fill();
}

function drawScene(ctx, metrics, state) {
    ctx.clearRect(0, 0, metrics.width, metrics.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, metrics.width, metrics.height);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `400 ${metrics.fontSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = PALETTE.homeText;
    ctx.fillText('Home', metrics.leftX, metrics.baselineY);

    drawHouse(ctx, metrics);

    ctx.save();
    ctx.beginPath();
    appendHouseShellPath(ctx, metrics);
    ctx.clip();
    ctx.fillStyle = PALETTE.background;
    for (const letter of state.letters) {
        ctx.fillText(letter.char, letter.x, letter.y);
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, metrics.width, metrics.height);
    appendHouseShellPath(ctx, metrics);
    ctx.clip('evenodd');
    ctx.fillStyle = PALETTE.bodyText;
    for (const letter of state.letters) {
        ctx.fillText(letter.char, letter.x, letter.y);
    }
    ctx.restore();
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
