const WORD = 'Stubborn';
const FONT_FAMILY = 'Caesar Dressing, "Times New Roman", serif';
const THEME = {
    backgroundTop: '#171413',
    backgroundBottom: '#241d1b',
    backgroundGlow: 'rgba(255, 249, 240, 0.06)',
    backgroundGrain: 'rgba(255, 245, 233, 0.035)',
    clayTop: '#fbf7f0',
    clayMid: '#e9e1d4',
    clayBottom: '#cac0b1',
    clayStroke: '#887e72',
    clayTrail: 'rgba(242, 234, 222, 0.08)',
    clayTrailDark: 'rgba(205, 194, 178, 0.06)',
    clayHighlight: 'rgba(255, 255, 255, 0.26)',
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function resist(value, limit) {
    const magnitude = Math.abs(value);
    if (magnitude === 0) {
        return 0;
    }

    return Math.sign(value) * limit * (1 - Math.exp(-magnitude / Math.max(limit * 0.72, 1)));
}

function stepSpring(position, velocity, target, stiffness, damping) {
    const nextVelocity = (velocity + (target - position) * stiffness) * damping;

    return {
        position: position + nextVelocity,
        velocity: nextVelocity,
    };
}

function pointInRect(point, rect) {
    return point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height;
}

function getMetrics(ctx, width, height) {
    const scale = Math.min(width, height);
    const fontSize = clamp(scale * 0.22, 82, 198);
    const tracking = fontSize * 0.022;
    const baselineY = height / 2 + fontSize * 0.28;

    ctx.font = `700 italic ${fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const letters = [];
    let totalWidth = 0;

    for (let index = 0; index < WORD.length; index += 1) {
        const char = WORD[index];
        const measurement = ctx.measureText(char);
        const widthValue = measurement.width;
        const ascent = measurement.actualBoundingBoxAscent || fontSize * 0.74;
        const descent = measurement.actualBoundingBoxDescent || fontSize * 0.22;

        letters.push({
            id: index,
            char,
            width: widthValue,
            ascent,
            descent,
            height: ascent + descent,
        });

        totalWidth += widthValue;
        if (index < WORD.length - 1) {
            totalWidth += tracking;
        }
    }

    const leftX = width / 2 - totalWidth / 2;
    let cursorX = leftX;

    for (let index = 0; index < letters.length; index += 1) {
        const letter = letters[index];
        const centerY = baselineY + (letter.descent - letter.ascent) / 2;

        letter.homeX = cursorX;
        letter.homeBaselineY = baselineY;
        letter.homeCenterX = cursorX + letter.width / 2;
        letter.homeCenterY = centerY;
        letter.baselineFromCenter = (letter.ascent - letter.descent) / 2;
        cursorX += letter.width + tracking;
    }

    return {
        width,
        height,
        scale,
        centerX: width / 2,
        centerY: height / 2,
        baselineY,
        fontSize,
        tracking,
        wordWidth: totalWidth,
        wordHeight: fontSize * 1.28,
        wordBounds: {
            left: leftX - fontSize * 0.12,
            right: leftX + totalWidth + fontSize * 0.12,
            top: baselineY - fontSize * 1.02,
            bottom: baselineY + fontSize * 0.26,
        },
        letters,
        localPullLimit: fontSize * 1.55,
        groupPullLimit: scale * 0.22,
    };
}

function createLetterState(metricLetter) {
    return {
        id: metricLetter.id,
        char: metricLetter.char,
        width: metricLetter.width,
        ascent: metricLetter.ascent,
        descent: metricLetter.descent,
        height: metricLetter.height,
        homeX: metricLetter.homeX,
        homeBaselineY: metricLetter.homeBaselineY,
        homeCenterX: metricLetter.homeCenterX,
        homeCenterY: metricLetter.homeCenterY,
        baselineFromCenter: metricLetter.baselineFromCenter,
        pullX: 0,
        pullY: 0,
        velocityX: 0,
        velocityY: 0,
    };
}

function createState(metrics) {
    return {
        width: metrics.width,
        height: metrics.height,
        frame: 0,
        prevIsDown: false,
        mode: 'idle',
        activeLetterId: null,
        dragStartX: 0,
        dragStartY: 0,
        grabOffsetX: 0,
        grabOffsetY: 0,
        groupPullX: 0,
        groupPullY: 0,
        groupVelocityX: 0,
        groupVelocityY: 0,
        backgroundNormalX: 0,
        backgroundNormalY: -1,
        letters: metrics.letters.map(createLetterState),
    };
}

function ensureState(metrics) {
    if (!stubbornState || stubbornState.width !== metrics.width || stubbornState.height !== metrics.height) {
        stubbornState = createState(metrics);
    }

    return stubbornState;
}

function getBackgroundAmount(state) {
    return state.groupPullX * state.backgroundNormalX + state.groupPullY * state.backgroundNormalY;
}

function getWordTransform(state, metrics) {
    const amount = getBackgroundAmount(state);
    const normalized = clamp(amount / Math.max(metrics.groupPullLimit, 1), -1, 1);
    const halfWidth = Math.max((metrics.wordBounds.right - metrics.wordBounds.left) / 2, 1);
    const halfHeight = Math.max((metrics.wordBounds.bottom - metrics.wordBounds.top) / 2, 1);
    const supportDistance =
        Math.abs(state.backgroundNormalX) * halfWidth +
        Math.abs(state.backgroundNormalY) * halfHeight;

    if (Math.abs(normalized) < 0.0001) {
        return {
            active: false,
            anchorX: metrics.centerX,
            anchorY: metrics.centerY,
            angle: 0,
            axisScale: 1,
            crossScale: 1,
        };
    }

    const magnitude = Math.abs(normalized);
    const axisScale = normalized >= 0
        ? 1 + magnitude * 0.3
        : Math.max(0.82, 1 - magnitude * 0.24);
    const crossScale = normalized >= 0
        ? Math.max(0.93, 1 - magnitude * 0.05)
        : 1 + magnitude * 0.06;

    return {
        active: true,
        anchorX: metrics.centerX - state.backgroundNormalX * supportDistance,
        anchorY: metrics.centerY - state.backgroundNormalY * supportDistance,
        angle: Math.atan2(state.backgroundNormalY, state.backgroundNormalX),
        axisScale,
        crossScale,
    };
}

function transformPointWithWord(point, wordTransform) {
    if (!wordTransform.active) {
        return point;
    }

    const relativeX = point.x - wordTransform.anchorX;
    const relativeY = point.y - wordTransform.anchorY;
    const cos = Math.cos(wordTransform.angle);
    const sin = Math.sin(wordTransform.angle);
    const localX = relativeX * cos + relativeY * sin;
    const localY = -relativeX * sin + relativeY * cos;
    const scaledX = localX * wordTransform.axisScale;
    const scaledY = localY * wordTransform.crossScale;

    return {
        x: wordTransform.anchorX + scaledX * cos - scaledY * sin,
        y: wordTransform.anchorY + scaledX * sin + scaledY * cos,
    };
}

function applyWordTransform(ctx, wordTransform) {
    if (!wordTransform.active) {
        return;
    }

    ctx.translate(wordTransform.anchorX, wordTransform.anchorY);
    ctx.rotate(wordTransform.angle);
    ctx.scale(wordTransform.axisScale, wordTransform.crossScale);
    ctx.rotate(-wordTransform.angle);
    ctx.translate(-wordTransform.anchorX, -wordTransform.anchorY);
}

function getBackgroundHandle(metrics, point) {
    const dx = point.x - metrics.centerX;
    const dy = point.y - metrics.centerY;
    const length = Math.hypot(dx, dy);

    if (length < 0.0001) {
        return {
            normalX: 0,
            normalY: -1,
        };
    }

    return {
        normalX: dx / length,
        normalY: dy / length,
    };
}

function getLetterDragTarget(state, metrics, letter) {
    if (state.mode !== 'letter' || state.activeLetterId === null) {
        return { x: 0, y: 0 };
    }

    const activeLetter = state.letters.find((item) => item.id === state.activeLetterId);
    if (!activeLetter) {
        return { x: 0, y: 0 };
    }

    const distance = Math.abs(letter.id - activeLetter.id);
    const share = Math.exp(-distance * 0.58);
    const side = letter.id === activeLetter.id ? 0 : (letter.id < activeLetter.id ? -1 : 1);
    const dragX = resist(state.dragStartX - state.grabOffsetX - activeLetter.homeCenterX, metrics.localPullLimit);
    const dragY = resist(state.dragStartY - state.grabOffsetY - activeLetter.homeCenterY, metrics.localPullLimit * 0.86);

    return {
        x: dragX * share + side * Math.abs(dragY) * share * 0.12,
        y: dragY * share - distance * Math.abs(dragX) * 0.012,
    };
}

function getBackgroundInfluence(state, metrics, letter) {
    return {
        offsetX: 0,
        offsetY: 0,
        deformX: 0,
        deformY: 0,
        stretchAmount: 0,
    };
}

function transformVectorWithWord(vectorX, vectorY, wordTransform) {
    if (!wordTransform.active) {
        return { x: vectorX, y: vectorY };
    }

    const cos = Math.cos(wordTransform.angle);
    const sin = Math.sin(wordTransform.angle);
    const localX = vectorX * cos + vectorY * sin;
    const localY = -vectorX * sin + vectorY * cos;
    const scaledX = localX * wordTransform.axisScale;
    const scaledY = localY * wordTransform.crossScale;

    return {
        x: scaledX * cos - scaledY * sin,
        y: scaledX * sin + scaledY * cos,
    };
}

function getNeighborInfluence(state, letter) {
    if (state.mode !== 'letter' || state.activeLetterId === null) {
        return { x: 0, y: 0 };
    }

    const activeLetter = state.letters.find((item) => item.id === state.activeLetterId);
    if (!activeLetter || activeLetter.id === letter.id) {
        return { x: 0, y: 0 };
    }

    const distance = Math.abs(activeLetter.id - letter.id);
    const share = Math.exp(-distance * 0.78) * 0.34;

    return {
        x: activeLetter.pullX * share,
        y: activeLetter.pullY * share,
    };
}

function getLetterInfluence(state, metrics, letter) {
    const background = getBackgroundInfluence(state, metrics, letter);
    const neighbor = getNeighborInfluence(state, letter);
    const local = {
        x: letter.pullX,
        y: letter.pullY,
    };

    const offsetX = background.offsetX + neighbor.x * 0.16 + local.x * 0.42;
    const offsetY = background.offsetY + neighbor.y * 0.16 + local.y * 0.42;
    const deformX = background.deformX + neighbor.x * 0.28 + local.x;
    const deformY = background.deformY + neighbor.y * 0.28 + local.y;
    const stretchAmount = background.stretchAmount + Math.hypot(local.x + neighbor.x * 0.32, local.y + neighbor.y * 0.32);
    const magnitude = Math.hypot(deformX, deformY);

    return {
        centerX: letter.homeCenterX + offsetX,
        centerY: letter.homeCenterY + offsetY,
        offsetX,
        offsetY,
        deformX,
        deformY,
        stretchAmount,
        magnitude,
    };
}

function getLetterRect(state, metrics, letter) {
    const influence = getLetterInfluence(state, metrics, letter);
    const stretch = clamp(Math.abs(influence.stretchAmount) / Math.max(metrics.fontSize * 1.55, 1), 0, 0.38);
    const wordTransform = getWordTransform(state, metrics);
    const center = transformPointWithWord(
        {
            x: influence.centerX,
            y: influence.centerY,
        },
        wordTransform
    );
    const width = letter.width * (1.08 + stretch * 0.24) + Math.abs(influence.deformX) * 0.42;
    const height = letter.height * (1.08 + stretch * 0.3) + Math.abs(influence.deformY) * 0.34;
    const xAxis = transformVectorWithWord(width / 2, 0, wordTransform);
    const yAxis = transformVectorWithWord(0, height / 2, wordTransform);
    const halfWidth = Math.abs(xAxis.x) + Math.abs(yAxis.x);
    const halfHeight = Math.abs(xAxis.y) + Math.abs(yAxis.y);

    return {
        id: letter.id,
        centerX: center.x,
        centerY: center.y,
        x: center.x - halfWidth,
        y: center.y - halfHeight,
        width: halfWidth * 2,
        height: halfHeight * 2,
    };
}

function getLetterAtPoint(state, metrics, point) {
    for (let index = state.letters.length - 1; index >= 0; index -= 1) {
        const letter = state.letters[index];
        if (pointInRect(point, getLetterRect(state, metrics, letter))) {
            return letter;
        }
    }

    return null;
}

function updateInteraction(state, metrics, movement) {
    state.frame += 1;
    const pointer = movement.mousePoint;

    if (!state.prevIsDown && movement.isDown) {
        const hitLetter = getLetterAtPoint(state, metrics, pointer);
        state.dragStartX = pointer.x;
        state.dragStartY = pointer.y;

        if (hitLetter) {
            const hitRect = getLetterRect(state, metrics, hitLetter);
            state.mode = 'letter';
            state.activeLetterId = hitLetter.id;
            state.grabOffsetX = pointer.x - hitRect.centerX;
            state.grabOffsetY = pointer.y - hitRect.centerY;
            state.dragStartX = pointer.x;
            state.dragStartY = pointer.y;
        } else {
            const handle = getBackgroundHandle(metrics, pointer);
            state.mode = 'background';
            state.activeLetterId = null;
            state.grabOffsetX = 0;
            state.grabOffsetY = 0;
            state.backgroundNormalX = handle.normalX;
            state.backgroundNormalY = handle.normalY;
        }
    }

    if (state.prevIsDown && !movement.isDown) {
        state.mode = 'idle';
        state.activeLetterId = null;
    }

    if (movement.isDown && state.mode === 'letter' && state.activeLetterId !== null) {
        state.dragStartX = pointer.x;
        state.dragStartY = pointer.y;
    }

    const backgroundDeltaX = pointer.x - state.dragStartX;
    const backgroundDeltaY = pointer.y - state.dragStartY;
    const backgroundDragAmount = movement.isDown && state.mode === 'background'
        ? resist(
            backgroundDeltaX * state.backgroundNormalX + backgroundDeltaY * state.backgroundNormalY,
            metrics.groupPullLimit
        )
        : 0;
    const groupTargetX = state.backgroundNormalX * backgroundDragAmount;
    const groupTargetY = state.backgroundNormalY * backgroundDragAmount;
    const groupSpringX = stepSpring(state.groupPullX, state.groupVelocityX, groupTargetX, 0.1, 0.82);
    const groupSpringY = stepSpring(state.groupPullY, state.groupVelocityY, groupTargetY, 0.1, 0.82);

    state.groupPullX = groupSpringX.position;
    state.groupVelocityX = groupSpringX.velocity;
    state.groupPullY = groupSpringY.position;
    state.groupVelocityY = groupSpringY.velocity;

    for (const letter of state.letters) {
        const letterDragTarget = getLetterDragTarget(state, metrics, letter);
        let targetX = letterDragTarget.x;
        let targetY = letterDragTarget.y;
        let stiffness = 0.12;
        let damping = 0.8;

        if (state.mode === 'letter' && state.activeLetterId !== null) {
            stiffness = 0.145;
            damping = 0.79;
        }

        const nextSpringX = stepSpring(letter.pullX, letter.velocityX, targetX, stiffness, damping);
        const nextSpringY = stepSpring(letter.pullY, letter.velocityY, targetY, stiffness, damping);

        letter.pullX = nextSpringX.position;
        letter.velocityX = nextSpringX.velocity;
        letter.pullY = nextSpringY.position;
        letter.velocityY = nextSpringY.velocity;
    }

    state.prevIsDown = movement.isDown;
}

function drawBackground(ctx, metrics) {
    const gradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    gradient.addColorStop(0, THEME.backgroundTop);
    gradient.addColorStop(1, THEME.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, metrics.width, metrics.height);

    const glow = ctx.createRadialGradient(
        metrics.centerX,
        metrics.centerY,
        metrics.fontSize * 0.2,
        metrics.centerX,
        metrics.centerY,
        Math.max(metrics.width, metrics.height) * 0.62
    );
    glow.addColorStop(0, THEME.backgroundGlow);
    glow.addColorStop(1, 'rgba(255, 249, 240, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, metrics.width, metrics.height);
}

function applyGlyphTransform(ctx, centerX, centerY, deformX, deformY, stretchAmount, stretchScale) {
    const magnitude = Math.hypot(deformX, deformY);
    const angle = magnitude > 0.001 ? Math.atan2(deformY, deformX) : 0;
    const signedStretch = clamp(stretchAmount / stretchScale, -0.24, 0.36);
    const stretch = Math.abs(signedStretch);
    const dirX = magnitude > 0.001 ? deformX / magnitude : 0;
    const dirY = magnitude > 0.001 ? deformY / magnitude : 0;
    const axisScale = signedStretch >= 0
        ? 1 + stretch
        : Math.max(0.72, 1 - stretch * 0.95);
    const crossScale = signedStretch >= 0
        ? 1 - Math.min(stretch * 0.28, 0.14)
        : 1 + Math.min(stretch * 0.2, 0.08);
    const shear = signedStretch >= 0 ? stretch * 0.1 : stretch * 0.045;

    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.transform(1, dirY * shear, dirX * shear, 1, 0, 0);
    ctx.scale(axisScale, crossScale);
    ctx.rotate(-angle);
}

function drawGlyphTrail(ctx, metrics, letter, influence) {
    const trailMagnitude = Math.max(
        Math.hypot(influence.offsetX, influence.offsetY) * 1.3,
        Math.max(0, influence.stretchAmount)
    );
    if (trailMagnitude < metrics.fontSize * 0.08) {
        return;
    }

    const count = clamp(Math.round(trailMagnitude / Math.max(metrics.fontSize * 0.08, 1)), 4, 11);
    const startX = letter.homeCenterX + influence.offsetX * 0.18;
    const startY = letter.homeCenterY + influence.offsetY * 0.18;

    for (let index = 0; index < count; index += 1) {
        const t = count === 1 ? 1 : index / (count - 1);
        const eased = t * t * (3 - 2 * t);
        const centerX = lerp(startX, influence.centerX, eased);
        const centerY = lerp(startY, influence.centerY, eased);
        const alpha = lerp(0.2, 0.05, eased);

        ctx.save();
        ctx.globalAlpha = alpha;
        applyGlyphTransform(
            ctx,
            centerX,
            centerY,
            influence.deformX * (0.38 + eased * 0.62),
            influence.deformY * (0.38 + eased * 0.62),
            influence.stretchAmount * (0.38 + eased * 0.62),
            metrics.fontSize * 2.6
        );
        ctx.font = `700 italic ${metrics.fontSize}px ${FONT_FAMILY}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = index < count / 2 ? THEME.clayTrailDark : THEME.clayTrail;
        ctx.fillText(letter.char, -letter.width / 2, letter.baselineFromCenter);
        ctx.restore();
    }
}

function drawGlyphBody(ctx, metrics, letter, influence) {
    ctx.save();
    applyGlyphTransform(
        ctx,
        influence.centerX,
        influence.centerY,
        influence.deformX,
        influence.deformY,
        influence.stretchAmount,
        metrics.fontSize * 2.2
    );

    ctx.font = `700 italic ${metrics.fontSize}px ${FONT_FAMILY}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const fillGradient = ctx.createLinearGradient(0, -letter.ascent, 0, letter.descent);
    fillGradient.addColorStop(0, THEME.clayTop);
    fillGradient.addColorStop(0.48, THEME.clayMid);
    fillGradient.addColorStop(1, THEME.clayBottom);

    ctx.lineWidth = Math.max(2, metrics.fontSize * 0.022);
    ctx.strokeStyle = THEME.clayStroke;
    ctx.fillStyle = fillGradient;
    ctx.strokeText(letter.char, -letter.width / 2, letter.baselineFromCenter);
    ctx.fillText(letter.char, -letter.width / 2, letter.baselineFromCenter);

    ctx.fillStyle = THEME.clayHighlight;
    ctx.fillText(letter.char, -letter.width / 2 - metrics.fontSize * 0.014, letter.baselineFromCenter - metrics.fontSize * 0.026);
    ctx.restore();
}

function drawWord(ctx, metrics, state) {
    const wordTransform = getWordTransform(state, metrics);
    const orderedLetters = [...state.letters].sort((left, right) => {
        if (state.activeLetterId !== null && left.id === state.activeLetterId) {
            return 1;
        }

        if (state.activeLetterId !== null && right.id === state.activeLetterId) {
            return -1;
        }

        return left.id - right.id;
    });

    ctx.save();
    applyWordTransform(ctx, wordTransform);

    if (!wordTransform.active) {
        for (const letter of orderedLetters) {
            const influence = getLetterInfluence(state, metrics, letter);
            drawGlyphTrail(ctx, metrics, letter, influence);
        }
    }

    for (const letter of orderedLetters) {
        const influence = getLetterInfluence(state, metrics, letter);
        drawGlyphBody(ctx, metrics, letter, influence);
    }

    ctx.restore();
}

let stubbornState = null;

export function AnimationS(ctx, width, height, movement) {
    const metrics = getMetrics(ctx, width, height);
    const state = ensureState(metrics);

    updateInteraction(state, metrics, movement);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    drawBackground(ctx, metrics);
    drawWord(ctx, metrics, state);

    ctx.restore();
}

export function CleanS() {
    stubbornState = null;
}

export const descriptionS = [
    `한 번 마음먹은 일은 쉽게 바꾸지 않는 편입니다. 무작정 버틴다기보다, 한번 납득한 방향은 끝까지 밀어붙이는 쪽에 가까워요. 그래서 누군가 보기엔 고집처럼 보일 때도 있지만, 제 안에서는 쉽게 흔들리지 않는 중심에 더 가깝습니다.`,
    `이 인터랙션은 그런 감각을 점토 같은 타이포그래피로 옮긴 장면입니다. 글자를 직접 잡아당기면 늘어나긴 하지만 바로 따라오지 않고, 묵직하게 저항하다가 뒤늦게 끌려옵니다. 손을 놓으면 결국 원래 자리로 다시 돌아오고요.`,
    `배경을 끌면 이번에는 특정 글자 하나가 아니라 단어 전체가 버티면서 눌리고 늘어납니다. 방향은 따라가지만 형태는 완전히 무너지지 않고 끝까지 중심을 지키려는, '쉽게 안 바뀌는 단단함'을 보여주고 싶었습니다.`,
];

export const toolTipS = [
    `글자를 직접 잡아당기면 해당 글자가 점토처럼 늘어나면서도 저항감 있게 따라옵니다.`,
    `배경을 드래그하면 "Stubborn" 전체가 같은 방향으로 눌리거나 늘어나고, 손을 놓으면 다시 제자리로 돌아옵니다.`,
];
