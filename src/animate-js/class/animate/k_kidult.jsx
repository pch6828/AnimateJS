const WORD = 'KIDULT';
const LETTER_PATTERNS = {
    K: [
        '1001',
        '1010',
        '1100',
        '1010',
        '1001',
    ],
    I: [
        '111',
        '010',
        '010',
        '010',
        '111',
    ],
    D: [
        '1110',
        '1001',
        '1001',
        '1001',
        '1110',
    ],
    U: [
        '1001',
        '1001',
        '1001',
        '1001',
        '1111',
    ],
    L: [
        '1000',
        '1000',
        '1000',
        '1000',
        '1111',
    ],
    T: [
        '11111',
        '00100',
        '00100',
        '00100',
        '00100',
    ],
};
const BRICK_PALETTE = [
    { body: '#d84a3f', edge: '#a32c24', stud: '#f37a71', shine: 'rgba(255, 223, 210, 0.55)' },
    { body: '#f0c419', edge: '#b98f08', stud: '#ffe27a', shine: 'rgba(255, 248, 198, 0.55)' },
    { body: '#2585d1', edge: '#14548a', stud: '#6cb7f4', shine: 'rgba(220, 243, 255, 0.5)' },
    { body: '#33a56a', edge: '#1c6d43', stud: '#7dd6a1', shine: 'rgba(222, 255, 234, 0.45)' },
    { body: '#f28c28', edge: '#b45d10', stud: '#ffbc73', shine: 'rgba(255, 233, 205, 0.45)' },
    { body: '#7a59c4', edge: '#51338f', stud: '#b59ae9', shine: 'rgba(235, 228, 255, 0.4)' },
];
const SCENE_COLORS = {
    backgroundTop: '#cfe8f7',
    backgroundBottom: '#8fb8d8',
    vignette: 'rgba(14, 41, 66, 0.12)',
    plateBody: '#7cb260',
    plateEdge: '#4f7940',
    plateShadow: 'rgba(53, 75, 42, 0.26)',
    plateStud: '#9ed07d',
    plateStudEdge: '#5e8f4a',
    plateGlow: 'rgba(244, 252, 255, 0.28)',
    targetFill: 'rgba(28, 68, 32, 0.12)',
    targetStroke: 'rgba(35, 84, 40, 0.28)',
    snapFill: 'rgba(255, 255, 255, 0.34)',
    snapStroke: 'rgba(255, 255, 255, 0.7)',
};
const PLATE_MARGIN_X = 4;
const PLATE_MARGIN_Y = 4;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createWordLayout() {
    const bricks = [];
    let cursorX = 0;
    let letterIndex = 0;
    let rowCount = 0;

    for (const letter of WORD) {
        const pattern = LETTER_PATTERNS[letter];
        const letterWidth = pattern[0].length;
        rowCount = Math.max(rowCount, pattern.length);

        for (let row = 0; row < pattern.length; row += 1) {
            for (let col = 0; col < letterWidth; col += 1) {
                if (pattern[row][col] !== '1') {
                    continue;
                }

                bricks.push({
                    wordCol: cursorX + col,
                    wordRow: row,
                    letterIndex,
                });
            }
        }

        cursorX += letterWidth + 1;
        letterIndex += 1;
    }

    return {
        bricks,
        cols: cursorX - 1,
        rows: rowCount,
    };
}

const WORD_LAYOUT = createWordLayout();

function createBrickState(layoutItem, index) {
    return {
        id: index,
        paletteIndex: layoutItem.letterIndex % BRICK_PALETTE.length,
        homeCol: PLATE_MARGIN_X + layoutItem.wordCol,
        homeRow: PLATE_MARGIN_Y + layoutItem.wordRow,
        col: PLATE_MARGIN_X + layoutItem.wordCol,
        row: PLATE_MARGIN_Y + layoutItem.wordRow,
        dragX: 0,
        dragY: 0,
        isDragging: false,
        bobSeed: Math.random() * Math.PI * 2,
    };
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        prevIsDown: false,
        selectedBrickId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        dropCell: null,
        bricks: WORD_LAYOUT.bricks.map(createBrickState),
    };
}

function ensureState(width, height) {
    if (!kidultState || kidultState.width !== width || kidultState.height !== height) {
        kidultState = createState(width, height);
    }

    return kidultState;
}

function getMetrics(width, height) {
    const plateBlockCols = WORD_LAYOUT.cols + PLATE_MARGIN_X * 2;
    const plateBlockRows = WORD_LAYOUT.rows + PLATE_MARGIN_Y * 2;
    const plateStudCols = plateBlockCols * 2;
    const plateStudRows = plateBlockRows * 2;
    const studPitch = Math.min(width * 0.84 / plateStudCols, height * 0.68 / plateStudRows);
    const brickSize = studPitch * 2;
    const plateWidth = plateStudCols * studPitch;
    const plateHeight = plateStudRows * studPitch;

    return {
        plateBlockCols,
        plateBlockRows,
        plateStudCols,
        plateStudRows,
        studPitch,
        brickSize,
        plateWidth,
        plateHeight,
        plateX: width / 2,
        plateY: height / 2 + plateHeight * 0.06,
        plateRadius: studPitch * 1.05,
        studRadius: studPitch * 0.28,
        plateRotation: -0.05,
    };
}

function toBoardSpace(point, metrics) {
    const dx = point.x - metrics.plateX;
    const dy = point.y - metrics.plateY;
    const cos = Math.cos(-metrics.plateRotation);
    const sin = Math.sin(-metrics.plateRotation);

    return {
        x: dx * cos - dy * sin,
        y: dx * sin + dy * cos,
    };
}

function getBrickRect(brick, metrics, frame) {
    const x = -metrics.plateWidth / 2 + brick.col * metrics.brickSize;
    const y = -metrics.plateHeight / 2 + brick.row * metrics.brickSize;
    const bobY = brick.isDragging ? 0 : Math.sin(frame * 0.05 + brick.bobSeed) * metrics.studPitch * 0.05;

    return {
        x: brick.isDragging ? brick.dragX : x,
        y: brick.isDragging ? brick.dragY : y + bobY,
        width: metrics.brickSize,
        height: metrics.brickSize,
    };
}

function isPointInRect(point, rect) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}

function findBrickAtPoint(state, point, metrics) {
    for (let index = state.bricks.length - 1; index >= 0; index -= 1) {
        const brick = state.bricks[index];
        const rect = getBrickRect(brick, metrics, state.frame);

        if (isPointInRect(point, rect)) {
            return { brick, rect };
        }
    }

    return null;
}

function isCellOccupied(state, col, row, ignoreBrickId = null) {
    return state.bricks.some((brick) => (
        brick.id !== ignoreBrickId &&
        !brick.isDragging &&
        brick.col === col &&
        brick.row === row
    ));
}

function getDropCell(point, metrics) {
    const col = Math.round((point.x + metrics.plateWidth / 2) / metrics.brickSize);
    const row = Math.round((point.y + metrics.plateHeight / 2) / metrics.brickSize);

    const clampedCol = clamp(col, 0, metrics.plateBlockCols - 1);
    const clampedRow = clamp(row, 0, metrics.plateBlockRows - 1);
    const x = -metrics.plateWidth / 2 + clampedCol * metrics.brickSize;
    const y = -metrics.plateHeight / 2 + clampedRow * metrics.brickSize;

    return {
        col: clampedCol,
        row: clampedRow,
        x,
        y,
    };
}

function isPointNearPlate(point, metrics) {
    return (
        point.x >= -metrics.plateWidth / 2 - metrics.brickSize * 0.4 &&
        point.x <= metrics.plateWidth / 2 + metrics.brickSize * 0.4 &&
        point.y >= -metrics.plateHeight / 2 - metrics.brickSize * 0.4 &&
        point.y <= metrics.plateHeight / 2 + metrics.brickSize * 0.4
    );
}

function updateInteraction(state, movement, metrics) {
    state.frame += 1;
    const pointer = movement.mousePoint;
    const boardPoint = toBoardSpace(pointer, metrics);

    if (!state.prevIsDown && movement.isDown) {
        const hit = findBrickAtPoint(state, boardPoint, metrics);
        if (hit) {
            state.selectedBrickId = hit.brick.id;
            state.dragOffsetX = boardPoint.x - hit.rect.x;
            state.dragOffsetY = boardPoint.y - hit.rect.y;
            hit.brick.isDragging = true;
            hit.brick.dragX = hit.rect.x;
            hit.brick.dragY = hit.rect.y;

            const brickIndex = state.bricks.findIndex((brick) => brick.id === hit.brick.id);
            const [selectedBrick] = state.bricks.splice(brickIndex, 1);
            state.bricks.push(selectedBrick);
        }
    }

    if (movement.isDown && state.selectedBrickId !== null) {
        const brick = state.bricks.find((item) => item.id === state.selectedBrickId);
        brick.dragX = boardPoint.x - state.dragOffsetX;
        brick.dragY = boardPoint.y - state.dragOffsetY;

        if (isPointNearPlate(boardPoint, metrics)) {
            const dropCell = getDropCell(
                {
                    x: brick.dragX + metrics.brickSize / 2,
                    y: brick.dragY + metrics.brickSize / 2,
                },
                metrics
            );

            if (!isCellOccupied(state, dropCell.col, dropCell.row, brick.id)) {
                state.dropCell = dropCell;
            } else {
                state.dropCell = null;
            }
        } else {
            state.dropCell = null;
        }
    }

    if (state.prevIsDown && !movement.isDown && state.selectedBrickId !== null) {
        const brick = state.bricks.find((item) => item.id === state.selectedBrickId);

        if (state.dropCell) {
            brick.col = state.dropCell.col;
            brick.row = state.dropCell.row;
        }

        brick.isDragging = false;
        state.selectedBrickId = null;
        state.dropCell = null;
    }

    state.prevIsDown = movement.isDown;
}

function drawBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, SCENE_COLORS.backgroundTop);
    gradient.addColorStop(1, SCENE_COLORS.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.18,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.72
    );
    vignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
    vignette.addColorStop(1, SCENE_COLORS.vignette);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
}

function drawBasePlate(ctx, metrics, frame) {
    ctx.fillStyle = SCENE_COLORS.plateShadow;
    ctx.beginPath();
    ctx.roundRect(
        -metrics.plateWidth / 2 + metrics.studPitch * 0.18,
        -metrics.plateHeight / 2 + metrics.studPitch * 0.24,
        metrics.plateWidth,
        metrics.plateHeight,
        metrics.plateRadius
    );
    ctx.fill();

    ctx.fillStyle = SCENE_COLORS.plateBody;
    ctx.beginPath();
    ctx.roundRect(
        -metrics.plateWidth / 2,
        -metrics.plateHeight / 2,
        metrics.plateWidth,
        metrics.plateHeight,
        metrics.plateRadius
    );
    ctx.fill();

    const glow = ctx.createLinearGradient(
        -metrics.plateWidth / 2,
        -metrics.plateHeight / 2,
        metrics.plateWidth / 2,
        metrics.plateHeight / 2
    );
    glow.addColorStop(0, SCENE_COLORS.plateGlow);
    glow.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.roundRect(
        -metrics.plateWidth / 2,
        -metrics.plateHeight / 2,
        metrics.plateWidth,
        metrics.plateHeight,
        metrics.plateRadius
    );
    ctx.fill();

    for (let row = 0; row < metrics.plateStudRows; row += 1) {
        for (let col = 0; col < metrics.plateStudCols; col += 1) {
            const x = -metrics.plateWidth / 2 + metrics.studPitch * (col + 0.5);
            const y = -metrics.plateHeight / 2 + metrics.studPitch * (row + 0.5);
            const pulse = Math.sin(frame * 0.025 + row * 0.35 + col * 0.28) * metrics.studPitch * 0.015;

            ctx.fillStyle = SCENE_COLORS.plateStud;
            ctx.beginPath();
            ctx.arc(x, y, metrics.studRadius + pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = SCENE_COLORS.plateStudEdge;
            ctx.lineWidth = Math.max(1, metrics.studPitch * 0.08);
            ctx.beginPath();
            ctx.arc(x, y, metrics.studRadius + pulse, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawHomeTargets(ctx, state, metrics) {
    for (const brick of state.bricks) {
        const isOccupied = state.bricks.some((candidate) => (
            candidate.id !== brick.id &&
            !candidate.isDragging &&
            candidate.col === brick.homeCol &&
            candidate.row === brick.homeRow
        )) || (!brick.isDragging && brick.col === brick.homeCol && brick.row === brick.homeRow);

        if (isOccupied) {
            continue;
        }

        const x = -metrics.plateWidth / 2 + brick.homeCol * metrics.brickSize;
        const y = -metrics.plateHeight / 2 + brick.homeRow * metrics.brickSize;

        ctx.fillStyle = SCENE_COLORS.targetFill;
        ctx.strokeStyle = SCENE_COLORS.targetStroke;
        ctx.lineWidth = Math.max(1.5, metrics.studPitch * 0.12);
        ctx.beginPath();
        ctx.roundRect(x, y, metrics.brickSize, metrics.brickSize, metrics.brickSize * 0.16);
        ctx.fill();
        ctx.stroke();
    }
}

function drawSnapPreview(ctx, state, metrics) {
    if (!state.dropCell) {
        return;
    }

    ctx.fillStyle = SCENE_COLORS.snapFill;
    ctx.strokeStyle = SCENE_COLORS.snapStroke;
    ctx.lineWidth = Math.max(2, metrics.studPitch * 0.16);
    ctx.beginPath();
    ctx.roundRect(
        state.dropCell.x,
        state.dropCell.y,
        metrics.brickSize,
        metrics.brickSize,
        metrics.brickSize * 0.16
    );
    ctx.fill();
    ctx.stroke();
}

function drawBrick(ctx, brick, metrics, frame) {
    const palette = BRICK_PALETTE[brick.paletteIndex];
    const rect = getBrickRect(brick, metrics, frame);
    const size = rect.width;
    const studOffset = size * 0.28;
    const studRadius = size * 0.12;

    ctx.fillStyle = brick.isDragging ? 'rgba(42, 31, 18, 0.26)' : 'rgba(42, 31, 18, 0.18)';
    ctx.beginPath();
    ctx.roundRect(rect.x + size * 0.08, rect.y + size * 0.1, size, size, size * 0.16);
    ctx.fill();

    ctx.fillStyle = palette.edge;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, size, size, size * 0.16);
    ctx.fill();

    const faceGradient = ctx.createLinearGradient(rect.x, rect.y, rect.x + size, rect.y + size);
    faceGradient.addColorStop(0, palette.stud);
    faceGradient.addColorStop(0.32, palette.body);
    faceGradient.addColorStop(1, palette.edge);
    ctx.fillStyle = faceGradient;
    ctx.beginPath();
    ctx.roundRect(rect.x + size * 0.06, rect.y + size * 0.05, size * 0.88, size * 0.88, size * 0.14);
    ctx.fill();

    const studPositions = [
        [rect.x + studOffset, rect.y + studOffset],
        [rect.x + size - studOffset, rect.y + studOffset],
        [rect.x + studOffset, rect.y + size - studOffset],
        [rect.x + size - studOffset, rect.y + size - studOffset],
    ];

    for (let index = 0; index < studPositions.length; index += 1) {
        const [studX, studY] = studPositions[index];
        const pulse = Math.sin(frame * 0.06 + brick.id * 0.45 + index) * size * 0.006;

        ctx.fillStyle = palette.stud;
        ctx.beginPath();
        ctx.arc(studX, studY, studRadius + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = palette.edge;
        ctx.lineWidth = Math.max(1, size * 0.035);
        ctx.beginPath();
        ctx.arc(studX, studY, studRadius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = palette.shine;
        ctx.beginPath();
        ctx.arc(studX - studRadius * 0.22, studY - studRadius * 0.25, studRadius * 0.34, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = brick.isDragging ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.roundRect(rect.x + size * 0.12, rect.y + size * 0.1, size * 0.24, size * 0.7, size * 0.1);
    ctx.fill();
}

let kidultState = null;

export function AnimationK(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(width, height);

    updateInteraction(state, movement, metrics);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, width, height);

    ctx.save();
    ctx.translate(metrics.plateX, metrics.plateY);
    ctx.rotate(metrics.plateRotation);

    drawBasePlate(ctx, metrics, state.frame);
    drawHomeTargets(ctx, state, metrics);
    drawSnapPreview(ctx, state, metrics);

    for (const brick of state.bricks) {
        drawBrick(ctx, brick, metrics, state.frame);
    }

    ctx.restore();
    ctx.restore();
}

export function CleanK() {
    kidultState = null;
}

export const descriptionK = [
    `어릴 때 좋아하던 장난감을 지금도 좋아합니다.
특히 레고처럼 손으로 직접 만지고 옮기고 다시 끼우는 놀이는
가만히 보기만 하는 취미보다 더 오래 기억에 남는 편입니다.`,
    `이번 장면은 더 큰 레고 판 위에 2x2 블록만으로 KIDULT 글자를 올려 둔 구성입니다.
위에서 내려다보는 시선은 유지하되,
완성된 화면을 감상하는 것보다 직접 블록을 만지는 재미에 더 무게를 두었습니다.`,
    `각 블록은 마우스나 터치로 집어서 다른 위치에 다시 끼울 수 있습니다.
원래 글자 자리는 옅은 가이드로 남겨 두어서,
흩어 놓고 놀다가도 다시 KIDULT 형태로 맞춰 볼 수 있게 만들었습니다.`,
];

export const toolTipK = [
    '2x2 레고 블록을 직접 잡아서 레고 판의 다른 칸에 끼울 수 있습니다.',
    '빈 자리에 보이는 옅은 가이드는 원래 KIDULT 글자가 놓이던 위치입니다.',
    '이번 버전은 더 큰 레고 판과 차가운 블루 배경으로 장난감 테이블 같은 느낌을 만들었습니다.',
];
