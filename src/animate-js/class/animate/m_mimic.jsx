const WORD = 'MIMIC';
const LETTERS = WORD.split('');

const PALETTE = {
    backgroundTop: '#faefdc',
    backgroundBottom: '#efc996',
    ink: '#342117',
    outline: '#4a2b18',
    highlight: '#fff8ec',
    hint: 'rgba(52, 33, 23, 0.66)',
    guide: 'rgba(113, 71, 46, 0.14)',
    pathFill: 'rgba(196, 113, 66, 0.15)',
    pathStroke: 'rgba(138, 76, 43, 0.56)',
    pathActive: 'rgba(177, 72, 49, 0.74)',
    slimeShade: 'rgba(94, 45, 29, 0.18)',
    slimeGloss: 'rgba(255, 249, 239, 0.28)',
    shadow: 'rgba(75, 43, 25, 0.18)',
};

const LETTER_COLORS = [
    ['#b94d3a', '#f5bf8f'],
    ['#2a6288', '#a6d4e5'],
    ['#4c7c3c', '#cfe3ac'],
    ['#8d5c2e', '#f2cf99'],
    ['#814f98', '#d7bae9'],
];

const LETTER_VECTOR_METRICS = {
    M: { widthRatio: 1.02 },
    I: { widthRatio: 0.5 },
    C: { widthRatio: 0.86 },
    default: { widthRatio: 0.78 },
};

const wordLayoutCache = new Map();
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function crossProduct(origin, pointA, pointB) {
    return (pointA.x - origin.x) * (pointB.y - origin.y) - (pointA.y - origin.y) * (pointB.x - origin.x);
}

function getBounds(points) {
    if (!points.length) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    points.forEach((point) => {
        bounds.minX = Math.min(bounds.minX, point.x);
        bounds.minY = Math.min(bounds.minY, point.y);
        bounds.maxX = Math.max(bounds.maxX, point.x);
        bounds.maxY = Math.max(bounds.maxY, point.y);
    });
    bounds.width = bounds.maxX - bounds.minX;
    bounds.height = bounds.maxY - bounds.minY;
    return bounds;
}

function getCentroid(points) {
    if (!points.length) {
        return { x: 0, y: 0 };
    }

    const total = points.reduce((acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }), { x: 0, y: 0 });
    return { x: total.x / points.length, y: total.y / points.length };
}

function getPolygonArea(points) {
    if (points.length < 3) {
        return 0;
    }

    let area = 0;
    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        area += current.x * next.y - next.x * current.y;
    }
    return area / 2;
}

function getPolygonCentroid(points) {
    const area = getPolygonArea(points);

    if (Math.abs(area) < 1e-6) {
        return getCentroid(points);
    }

    let x = 0;
    let y = 0;

    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const factor = current.x * next.y - next.x * current.y;
        x += (current.x + next.x) * factor;
        y += (current.y + next.y) * factor;
    }

    return {
        x: x / (6 * area),
        y: y / (6 * area),
    };
}

function resamplePath(points, count) {
    if (points.length <= 1) {
        return points.slice();
    }

    const lengths = [0];
    for (let index = 1; index < points.length; index += 1) {
        lengths[index] = lengths[index - 1] + distance(points[index - 1], points[index]);
    }

    const totalLength = lengths[lengths.length - 1];
    if (totalLength === 0) {
        return Array.from({ length: count }, () => ({ ...points[0] }));
    }

    const result = [];
    for (let sampleIndex = 0; sampleIndex < count; sampleIndex += 1) {
        const target = count === 1 ? 0 : totalLength * (sampleIndex / (count - 1));
        let segment = 1;
        while (segment < lengths.length && lengths[segment] < target) {
            segment += 1;
        }

        const pointA = points[Math.max(0, segment - 1)];
        const pointB = points[Math.min(points.length - 1, segment)];
        const start = lengths[Math.max(0, segment - 1)];
        const length = Math.max(1e-6, lengths[Math.min(lengths.length - 1, segment)] - start);
        const ratio = clamp((target - start) / length, 0, 1);

        result.push({
            x: lerp(pointA.x, pointB.x, ratio),
            y: lerp(pointA.y, pointB.y, ratio),
        });
    }

    return result;
}

function simplifyStroke(points, minimumDistance) {
    if (points.length <= 1) {
        return points.slice();
    }

    const simplified = [points[0]];
    for (let index = 1; index < points.length; index += 1) {
        if (distance(points[index], simplified[simplified.length - 1]) >= minimumDistance) {
            simplified.push(points[index]);
        }
    }

    if (distance(points[points.length - 1], simplified[simplified.length - 1]) > 1) {
        simplified.push(points[points.length - 1]);
    }

    return simplified;
}

function segmentsIntersect(pointA, pointB, pointC, pointD) {
    const denominator = (pointA.x - pointB.x) * (pointC.y - pointD.y) - (pointA.y - pointB.y) * (pointC.x - pointD.x);

    if (Math.abs(denominator) < 1e-6) {
        return null;
    }

    const detA = pointA.x * pointB.y - pointA.y * pointB.x;
    const detB = pointC.x * pointD.y - pointC.y * pointD.x;
    const x = (detA * (pointC.x - pointD.x) - (pointA.x - pointB.x) * detB) / denominator;
    const y = (detA * (pointC.y - pointD.y) - (pointA.y - pointB.y) * detB) / denominator;

    const withinSegment = (point1, point2, valueX, valueY) => (
        valueX >= Math.min(point1.x, point2.x) - 1e-6 &&
        valueX <= Math.max(point1.x, point2.x) + 1e-6 &&
        valueY >= Math.min(point1.y, point2.y) - 1e-6 &&
        valueY <= Math.max(point1.y, point2.y) + 1e-6
    );

    if (
        !withinSegment(pointA, pointB, x, y) ||
        !withinSegment(pointC, pointD, x, y)
    ) {
        return null;
    }

    return { x, y };
}

function buildConvexHull(points) {
    const uniquePoints = [];

    points.forEach((point) => {
        const exists = uniquePoints.some((existing) => distance(existing, point) < 1e-3);
        if (!exists) {
            uniquePoints.push(point);
        }
    });

    if (uniquePoints.length <= 3) {
        return uniquePoints.slice();
    }

    const sorted = uniquePoints
        .slice()
        .sort((pointA, pointB) => (pointA.x === pointB.x ? pointA.y - pointB.y : pointA.x - pointB.x));
    const lower = [];
    const upper = [];

    sorted.forEach((point) => {
        while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
            lower.pop();
        }
        lower.push(point);
    });

    for (let index = sorted.length - 1; index >= 0; index -= 1) {
        const point = sorted[index];
        while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
            upper.pop();
        }
        upper.push(point);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

function extractSelfIntersectingLoop(points) {
    if (points.length < 4) {
        return null;
    }

    let latestLoop = null;

    for (let segmentIndex = 2; segmentIndex < points.length - 1; segmentIndex += 1) {
        const segmentStart = points[segmentIndex];
        const segmentEnd = points[segmentIndex + 1];

        for (let previousIndex = 0; previousIndex < segmentIndex - 1; previousIndex += 1) {
            const previousStart = points[previousIndex];
            const previousEnd = points[previousIndex + 1];
            const intersection = segmentsIntersect(previousStart, previousEnd, segmentStart, segmentEnd);

            if (!intersection) {
                continue;
            }

            const loop = [intersection];
            for (let index = previousIndex + 1; index <= segmentIndex; index += 1) {
                loop.push(points[index]);
            }

            latestLoop = loop;
        }
    }

    if (!latestLoop || latestLoop.length < 3) {
        return null;
    }

    const hull = buildConvexHull(latestLoop);
    return hull.length >= 3 ? hull : null;
}

function getScanlineSegments(points, y) {
    if (points.length < 3) {
        return [];
    }

    const intersections = [];

    for (let index = 0; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const crosses = (current.y <= y && next.y > y) || (next.y <= y && current.y > y);

        if (!crosses) {
            continue;
        }

        const ratio = (y - current.y) / ((next.y - current.y) || 1e-6);
        intersections.push(lerp(current.x, next.x, ratio));
    }

    intersections.sort((a, b) => a - b);

    const segments = [];
    for (let index = 0; index < intersections.length - 1; index += 2) {
        const start = intersections[index];
        const end = intersections[index + 1];
        if (end > start) {
            segments.push({ start, end, center: (start + end) / 2 });
        }
    }

    return segments;
}

function getVectorMetric(char, fontSize) {
    const metric = LETTER_VECTOR_METRICS[char] || LETTER_VECTOR_METRICS.default;
    return {
        width: fontSize * metric.widthRatio,
        ascent: fontSize * 0.74,
        descent: fontSize * 0.2,
    };
}

function appendRoundedRectPath(target, x, y, width, height, radius) {
    const right = x + width;
    const bottom = y + height;
    const clampedRadius = Math.min(radius, width / 2, height / 2);

    target.moveTo(x + clampedRadius, y);
    target.lineTo(right - clampedRadius, y);
    target.quadraticCurveTo(right, y, right, y + clampedRadius);
    target.lineTo(right, bottom - clampedRadius);
    target.quadraticCurveTo(right, bottom, right - clampedRadius, bottom);
    target.lineTo(x + clampedRadius, bottom);
    target.quadraticCurveTo(x, bottom, x, bottom - clampedRadius);
    target.lineTo(x, y + clampedRadius);
    target.quadraticCurveTo(x, y, x + clampedRadius, y);
    target.closePath();
}

function appendMPath(target, width, ascent, descent) {
    const left = -width / 2;
    const right = width / 2;
    const top = -ascent;
    const bottom = descent;
    const stem = width * 0.28;
    const outerValleyX = 0;
    const outerValleyY = top + (bottom - top) * 0.75;
    const innerValleyY = top + (bottom - top) * 0.35;
    const shoulderDrop = top + ascent * 0.54;
    const leftInnerTopX = left + stem;
    const rightInnerTopX = right - stem;

    target.moveTo(left, bottom);
    target.lineTo(left, top);
    target.lineTo(leftInnerTopX, top);
    target.lineTo(outerValleyX, innerValleyY);
    target.lineTo(rightInnerTopX, top);
    target.lineTo(right, top);
    target.lineTo(right, bottom);
    target.lineTo(rightInnerTopX, bottom);
    target.lineTo(rightInnerTopX, shoulderDrop);
    target.lineTo(outerValleyX, outerValleyY);
    target.lineTo(leftInnerTopX, shoulderDrop);
    target.lineTo(leftInnerTopX, bottom);
    target.closePath();
}

function appendIPath(target, width, ascent, descent) {
    const left = -width / 2;
    const right = width / 2;
    const top = -ascent;
    const bottom = descent;
    const serifHeight = (ascent + descent) * 0.2;
    const stemWidth = width * 0.48;
    const stemLeft = -stemWidth / 2;
    const stemRight = stemWidth / 2;
    const neckInset = width * 0.08;
    const topShoulderY = top + serifHeight;
    const bottomShoulderY = bottom - serifHeight;
    const neckCurve = serifHeight * 0.22;

    target.moveTo(left, top);
    target.lineTo(right, top);
    target.lineTo(right, topShoulderY);
    target.lineTo(stemRight + neckInset, topShoulderY);
    target.quadraticCurveTo(stemRight + neckInset * 0.8, topShoulderY + neckCurve * 0.35, stemRight, topShoulderY + neckCurve);
    target.lineTo(stemRight, bottomShoulderY - neckCurve);
    target.quadraticCurveTo(stemRight + neckInset * 0.8, bottomShoulderY - neckCurve * 0.35, stemRight + neckInset, bottomShoulderY);
    target.lineTo(right, bottomShoulderY);
    target.lineTo(right, bottom);
    target.lineTo(left, bottom);
    target.lineTo(left, bottomShoulderY);
    target.lineTo(stemLeft - neckInset, bottomShoulderY);
    target.quadraticCurveTo(stemLeft - neckInset * 0.8, bottomShoulderY - neckCurve * 0.35, stemLeft, bottomShoulderY - neckCurve);
    target.lineTo(stemLeft, topShoulderY + neckCurve);
    target.quadraticCurveTo(stemLeft - neckInset * 0.8, topShoulderY + neckCurve * 0.35, stemLeft - neckInset, topShoulderY);
    target.lineTo(left, topShoulderY);
    target.closePath();
}

function appendCPath(target, width, ascent, descent) {
    const centerY = (descent - ascent) / 2;
    const outerRadiusX = width / 2;
    const outerRadiusY = (ascent + descent) / 2;
    const stroke = width * 0.34;
    const innerRadiusX = outerRadiusX - stroke;
    const innerRadiusY = outerRadiusY - stroke * 0.9;
    const openAngle = Math.PI * 0.3;

    target.moveTo(
        Math.cos(-openAngle) * outerRadiusX,
        centerY + Math.sin(-openAngle) * outerRadiusY
    );
    target.ellipse(0, centerY, outerRadiusX, outerRadiusY, 0, -openAngle, openAngle, true);
    target.lineTo(
        Math.cos(openAngle) * innerRadiusX,
        centerY + Math.sin(openAngle) * innerRadiusY
    );
    target.ellipse(0, centerY, innerRadiusX, innerRadiusY, 0, openAngle, -openAngle, false);
    target.closePath();
}

function createLetterPath(char, width, ascent, descent) {
    const path = new Path2D();

    if (char === 'M') {
        appendMPath(path, width, ascent, descent);
    } else if (char === 'I') {
        appendIPath(path, width, ascent, descent);
    } else if (char === 'C') {
        appendCPath(path, width, ascent, descent);
    } else {
        appendRoundedRectPath(path, -width / 2, -ascent, width, ascent + descent, width * 0.18);
    }

    return path;
}

function getWordLayout(ctx, fontSize) {
    const roundedFontSize = Math.max(12, Math.round(fontSize));

    if (wordLayoutCache.has(roundedFontSize)) {
        return wordLayoutCache.get(roundedFontSize);
    }

    const letterGap = roundedFontSize * 0.03;
    const letterMetrics = LETTERS.map((char) => getVectorMetric(char, roundedFontSize));

    const wordWidth = letterMetrics.reduce((total, metric) => total + metric.width, 0) + letterGap * (LETTERS.length - 1);
    const layout = {
        fontSize: roundedFontSize,
        letterGap,
        letterMetrics,
        wordWidth,
    };

    wordLayoutCache.set(roundedFontSize, layout);
    return layout;
}

function createLetter(char, index) {
    return {
        char,
        index,
        x: 0,
        y: 0,
        homeX: 0,
        homeY: 0,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        scaleX: 1,
        scaleY: 1,
        targetScaleX: 1,
        targetScaleY: 1,
        rotation: 0,
        targetRotation: 0,
        shear: 0,
        targetShear: 0,
        pullX: 0,
        pullY: 0,
        morph: 0,
        smear: 0,
        stretch: 1,
        squish: 1,
        slimeLift: 0,
        pupilX: 0,
        pupilY: 0,
        blink: 0,
        mouthOpen: 0.24,
        phase: 0.7 + index * 0.63,
        initialized: false,
        width: 0,
        ascent: 0,
        descent: 0,
    };
}

function createState(width, height) {
    return {
        width,
        height,
        frame: 0,
        prevIsDown: false,
        letters: LETTERS.map((char, index) => createLetter(char, index)),
        activeStroke: [],
        previewStroke: [],
        storedStroke: [],
        shapeTargets: null,
        shapeClosed: false,
        shapeCentroid: { x: width / 2, y: height / 2 },
        wordBufferCanvas: null,
        wordBufferContext: null,
        wordBufferFontSize: 0,
    };
}

function ensureState(width, height) {
    if (!mimicState || mimicState.width !== width || mimicState.height !== height) {
        mimicState = createState(width, height);
    }

    return mimicState;
}

function getMetrics(ctx, width, height) {
    const scale = Math.min(width, height);
    const wordLayout = getWordLayout(ctx, clamp(scale * 0.225, 96, 210));
    const fontSize = wordLayout.fontSize;

    return {
        width,
        height,
        scale,
        centerX: width / 2,
        centerY: height / 2,
        fontSize,
        wordLayout,
        wordLeft: width / 2 - wordLayout.wordWidth / 2,
        baselineY: height * 0.57,
        safeMargin: fontSize * 0.34,
        strokePointGap: Math.max(8, scale * 0.012),
        noteSize: clamp(scale * 0.026, 18, 30),
    };
}

function syncHomeLayout(state, metrics) {
    let cursorX = metrics.wordLeft;

    state.letters.forEach((letter, index) => {
        const measurement = metrics.wordLayout.letterMetrics[index];
        letter.homeX = cursorX + measurement.width / 2;
        letter.homeY = metrics.baselineY;
        letter.width = measurement.width;
        letter.ascent = measurement.ascent;
        letter.descent = measurement.descent;

        if (!letter.initialized) {
            letter.initialized = true;
            letter.x = letter.homeX;
            letter.y = letter.homeY;
            letter.targetX = letter.homeX;
            letter.targetY = letter.homeY;
        }

        cursorX += measurement.width + metrics.wordLayout.letterGap;
    });
}

function clampPoint(point, metrics) {
    return {
        x: clamp(point.x, metrics.safeMargin, metrics.width - metrics.safeMargin),
        y: clamp(point.y, metrics.safeMargin, metrics.height - metrics.safeMargin),
    };
}

function isClosedStroke(points, metrics) {
    if (points.length < 6) {
        return false;
    }

    const bounds = getBounds(points);
    const closeDistance = Math.max(metrics.fontSize * 0.32, Math.min(bounds.width, bounds.height) * 0.34);
    return distance(points[0], points[points.length - 1]) <= closeDistance;
}

function buildOpenTargets(points, metrics) {
    let sampled = resamplePath(points, LETTERS.length);

    if (sampled.length > 1) {
        const start = sampled[0];
        const end = sampled[sampled.length - 1];
        const horizontal = Math.abs(end.x - start.x) >= Math.abs(end.y - start.y);

        if ((horizontal && start.x > end.x) || (!horizontal && start.y > end.y)) {
            sampled = sampled.reverse();
        }
    }

    return sampled.map((point, index) => {
        const previous = sampled[Math.max(0, index - 1)];
        const next = sampled[Math.min(sampled.length - 1, index + 1)];
        const tangent = Math.atan2(next.y - previous.y, next.x - previous.x);
        const span = Math.max(metrics.fontSize * 0.6, distance(previous, next));
        const stretch = clamp(span / (metrics.fontSize * 0.5), 1.02, 1.95);

        return {
            ...clampPoint(point, metrics),
            rotation: clamp(tangent * 0.55, -0.92, 0.92),
            shear: clamp(Math.sin(tangent) * 0.22, -0.28, 0.28),
            scaleX: stretch,
            scaleY: clamp(1.34 - (stretch - 1) * 0.34, 0.78, 1.12),
        };
    });
}

function pickEvenRows(rows, count) {
    if (rows.length <= count) {
        return rows.slice();
    }

    const result = [];
    const step = (rows.length - 1) / Math.max(1, count - 1);

    for (let index = 0; index < count; index += 1) {
        result.push(rows[Math.round(index * step)]);
    }

    return result;
}

function buildClosedRibbonTargets(points, metrics, bounds, centroid) {
    const verticalPadding = Math.max(metrics.fontSize * 0.16, bounds.height * 0.08);
    const rowStep = Math.max(metrics.fontSize * 0.18, bounds.height / 12);
    const candidateRows = [];

    for (let y = bounds.minY + verticalPadding; y <= bounds.maxY - verticalPadding; y += rowStep) {
        const segments = getScanlineSegments(points, y);
        if (!segments.length) {
            continue;
        }

        const dominant = segments.reduce((widest, current) => (
            (current.end - current.start) > (widest.end - widest.start) ? current : widest
        ));

        if ((dominant.end - dominant.start) < metrics.fontSize * 0.36) {
            continue;
        }

        candidateRows.push({ ...dominant, y });
    }

    if (candidateRows.length < LETTERS.length) {
        return null;
    }

    const rows = pickEvenRows(candidateRows, LETTERS.length);
    const averageGap = rows.length > 1
        ? (rows[rows.length - 1].y - rows[0].y) / (rows.length - 1)
        : metrics.fontSize * 0.4;

    return rows.map((row, index) => {
        const ratio = LETTERS.length === 1 ? 0.5 : index / (LETTERS.length - 1);
        const width = row.end - row.start;
        const sway = Math.sin(ratio * Math.PI * 1.2 - 0.35) * Math.min(width * 0.16, metrics.fontSize * 0.34);
        const x = clamp(
            row.center + sway + (centroid.x - row.center) * 0.16,
            row.start + metrics.fontSize * 0.1,
            row.end - metrics.fontSize * 0.1
        );
        const prev = rows[Math.max(0, index - 1)];
        const next = rows[Math.min(rows.length - 1, index + 1)];
        const tangent = Math.atan2(next.y - prev.y, next.center - prev.center);
        const localScaleX = clamp(width / Math.max(metrics.wordLayout.letterMetrics[index].width * 1.18, 1), 0.94, 2.45);
        const localScaleY = clamp(averageGap / Math.max(metrics.fontSize * 0.22, 1) + 0.26, 1.02, 2.28);

        return {
            x: clamp(x, metrics.safeMargin, metrics.width - metrics.safeMargin),
            y: clamp(row.y, metrics.safeMargin, metrics.height - metrics.safeMargin),
            rotation: clamp(tangent * 0.38, -0.42, 0.42),
            shear: clamp(Math.sin(tangent) * 0.16, -0.18, 0.18),
            scaleX: localScaleX,
            scaleY: localScaleY,
        };
    });
}

function buildClosedTargets(points, metrics) {
    const bounds = getBounds(points);
    const centroid = getPolygonCentroid(points);
    const ribbonTargets = buildClosedRibbonTargets(points, metrics, bounds, centroid);

    if (ribbonTargets) {
        return ribbonTargets;
    }

    const rowOffsets = [-0.18, -0.08, 0, 0.08, 0.18];

    let bestSpan = null;
    rowOffsets.forEach((offset) => {
        const y = clamp(centroid.y + bounds.height * offset, bounds.minY, bounds.maxY);
        const segments = getScanlineSegments(points, y);
        segments.forEach((segment) => {
            if (!bestSpan || (segment.end - segment.start) > (bestSpan.end - bestSpan.start)) {
                bestSpan = { ...segment, y };
            }
        });
    });

    if (!bestSpan) {
        const radiusX = Math.min(bounds.width * 0.18, metrics.fontSize * 0.74);
        const radiusY = Math.min(bounds.height * 0.14, metrics.fontSize * 0.42);

        return LETTERS.map((_, index) => {
            const offset = index - (LETTERS.length - 1) / 2;
            return {
                x: clamp(centroid.x + offset * radiusX * 0.56, metrics.safeMargin, metrics.width - metrics.safeMargin),
                y: clamp(centroid.y + Math.sin((index / Math.max(1, LETTERS.length - 1)) * Math.PI) * radiusY - radiusY * 0.26, metrics.safeMargin, metrics.height - metrics.safeMargin),
                rotation: offset * 0.05,
                shear: offset * 0.025,
                scaleX: 0.92,
                scaleY: 0.92,
            };
        });
    }

    const spanWidth = bestSpan.end - bestSpan.start;
    const spanScale = clamp(spanWidth / Math.max(metrics.wordLayout.wordWidth, 1), 0.72, 1.08);

    return LETTERS.map((_, index) => {
        const ratio = LETTERS.length === 1 ? 0.5 : index / (LETTERS.length - 1);
        const archLift = Math.sin(ratio * Math.PI) * Math.min(bounds.height * 0.08, metrics.fontSize * 0.18);
        const offset = ratio - 0.5;

        return {
            x: clamp(lerp(bestSpan.start, bestSpan.end, ratio), metrics.safeMargin, metrics.width - metrics.safeMargin),
            y: clamp(bestSpan.y - archLift, metrics.safeMargin, metrics.height - metrics.safeMargin),
            rotation: clamp(offset * 0.16, -0.18, 0.18),
            shear: clamp(offset * 0.08, -0.12, 0.12),
            scaleX: spanScale,
            scaleY: clamp(1.02 + Math.min(bounds.height / metrics.fontSize, 1.4) * 0.08, 0.92, 1.16),
        };
    });
}

function buildShapeTargets(points, metrics) {
    if (!points || points.length < 4) {
        return null;
    }

    const simplified = simplifyStroke(points, metrics.strokePointGap * 0.78);
    if (simplified.length < 4) {
        return null;
    }

    const intersectedLoop = extractSelfIntersectingLoop(simplified);
    if (intersectedLoop) {
        return {
            points: intersectedLoop,
            closed: true,
            centroid: getPolygonCentroid(intersectedLoop),
            targets: buildClosedTargets(intersectedLoop, metrics),
        };
    }

    const closed = isClosedStroke(simplified, metrics);
    const correctedPoints = closed ? buildConvexHull(simplified) : simplified;
    return {
        points: correctedPoints,
        closed,
        centroid: closed ? getPolygonCentroid(correctedPoints) : getCentroid(correctedPoints),
        targets: closed ? buildClosedTargets(correctedPoints, metrics) : buildOpenTargets(correctedPoints, metrics),
    };
}

function updateInteraction(state, movement, metrics) {
    const pointer = clampPoint(movement.mousePoint, metrics);

    if (!state.prevIsDown && movement.isDown) {
        if (movement.mouseButton === 'right') {
            state.activeStroke = [];
            state.previewStroke = [];
            state.storedStroke = [];
            state.shapeTargets = null;
            state.shapeClosed = false;
            state.shapeCentroid = { x: metrics.centerX, y: metrics.centerY };
        } else {
            state.activeStroke = [pointer];
            state.previewStroke = [];
            state.storedStroke = [];
            state.shapeTargets = null;
            state.shapeClosed = false;
        }
    }

    if (movement.isDown && movement.mouseButton !== 'right' && state.activeStroke.length) {
        if (distance(pointer, state.activeStroke[state.activeStroke.length - 1]) >= metrics.strokePointGap) {
            state.activeStroke.push(pointer);
        }

        const previewShape = buildShapeTargets(state.activeStroke, metrics);
        if (previewShape) {
            state.previewStroke = previewShape.points;
            state.shapeTargets = previewShape.targets;
            state.shapeClosed = previewShape.closed;
            state.shapeCentroid = previewShape.centroid;
        } else {
            state.previewStroke = [];
        }
    }

    if (state.prevIsDown && !movement.isDown && state.activeStroke.length) {
        const settledShape = buildShapeTargets(state.activeStroke, metrics);

        if (settledShape) {
            state.storedStroke = settledShape.points;
            state.previewStroke = [];
            state.shapeTargets = settledShape.targets;
            state.shapeClosed = settledShape.closed;
            state.shapeCentroid = settledShape.centroid;
        } else {
            state.previewStroke = [];
        }

        state.activeStroke = [];
    }

    state.prevIsDown = movement.isDown;
}

function updateLetters(state) {
    state.letters.forEach((letter, index) => {
        letter.targetX = letter.homeX;
        letter.targetY = letter.homeY;
        letter.targetScaleX = 1;
        letter.targetScaleY = 1;
        letter.targetRotation = 0;
        letter.targetShear = 0;

        letter.x = lerp(letter.x, letter.targetX, 0.18);
        letter.y = lerp(letter.y, letter.targetY, 0.18);
        letter.scaleX = lerp(letter.scaleX, letter.targetScaleX, 0.18);
        letter.scaleY = lerp(letter.scaleY, letter.targetScaleY, 0.18);
        letter.rotation = lerp(letter.rotation, letter.targetRotation, 0.16);
        letter.shear = lerp(letter.shear, letter.targetShear, 0.16);

        letter.pullX = lerp(letter.pullX, 0, 0.18);
        letter.pullY = lerp(letter.pullY, 0, 0.18);
        letter.morph = lerp(letter.morph, 0, 0.18);
        letter.smear = lerp(letter.smear, 0, 0.18);
        letter.stretch = lerp(letter.stretch, 1, 0.18);
        letter.squish = lerp(letter.squish, 1, 0.18);
        letter.slimeLift = lerp(letter.slimeLift, 0, 0.18);
        letter.pupilX = lerp(letter.pupilX, 0, 0.18);
        letter.pupilY = lerp(letter.pupilY, 0, 0.18);
        letter.blink = 0;
        letter.mouthOpen = lerp(letter.mouthOpen, 0.18, 0.18);
    });
}

function drawBackground(ctx, metrics) {
    const gradient = ctx.createLinearGradient(0, 0, 0, metrics.height);
    gradient.addColorStop(0, PALETTE.backgroundTop);
    gradient.addColorStop(1, PALETTE.backgroundBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, metrics.width, metrics.height);
}

function drawPath(points, ctx, closed) {
    if (points.length < 2) {
        return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + current.x) / 2, (previous.y + current.y) / 2);
    }

    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);

    if (closed) {
        ctx.closePath();
    }
}

function drawShapeGuide(ctx, state, metrics) {
    const activePath = state.activeStroke.length
        ? simplifyStroke(state.activeStroke, metrics.strokePointGap * 0.7)
        : [];
    const visibleShape = state.activeStroke.length && state.previewStroke.length
        ? state.previewStroke
        : state.storedStroke;

    if (activePath.length >= 2) {
        ctx.save();
        drawPath(activePath, ctx, false);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(5, metrics.fontSize * 0.045);
        ctx.strokeStyle = PALETTE.pathActive;
        ctx.stroke();
        ctx.restore();
    }

    if (visibleShape.length >= 3) {
        ctx.save();
        drawPath(visibleShape, ctx, true);
        ctx.fillStyle = PALETTE.pathFill;
        ctx.fill();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = Math.max(5, metrics.fontSize * 0.05);
        ctx.strokeStyle = PALETTE.pathStroke;
        ctx.stroke();
        ctx.restore();
    }
}

function drawLetterPath(ctx, letter, metrics, alpha = 1) {
    const path = createLetterPath(letter.char, letter.width, letter.ascent, letter.descent);
    const [primaryColor, secondaryColor] = LETTER_COLORS[letter.index % LETTER_COLORS.length];
    const fill = ctx.createLinearGradient(
        letter.x - letter.width * 0.5,
        letter.y - letter.ascent,
        letter.x + letter.width * 0.5,
        letter.y + letter.descent
    );
    fill.addColorStop(0, secondaryColor);
    fill.addColorStop(0.45, primaryColor);
    fill.addColorStop(1, '#7c3827');

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(letter.x, letter.y);
    ctx.rotate(letter.rotation);
    ctx.transform(1, 0, letter.shear, 1, 0, 0);
    ctx.scale(letter.scaleX, letter.scaleY);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fillStyle = fill;
    ctx.fill(path);
    ctx.lineWidth = Math.max(3, metrics.fontSize * 0.04);
    ctx.strokeStyle = PALETTE.outline;
    ctx.stroke(path);
    ctx.lineWidth = Math.max(1.2, metrics.fontSize * 0.012);
    ctx.strokeStyle = 'rgba(255, 248, 236, 0.5)';
    ctx.stroke(path);
    ctx.restore();
}

function drawLetterSet(ctx, state, metrics) {
    const orderedLetters = state.letters.slice().sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));

    orderedLetters.forEach((letter) => {
        drawLetterPath(ctx, letter, metrics);
    });
}

function ensureWordBuffer(state, metrics) {
    const fontSize = metrics.wordLayout.fontSize;
    const maxAscent = Math.max(...metrics.wordLayout.letterMetrics.map((metric) => metric.ascent));
    const maxDescent = Math.max(...metrics.wordLayout.letterMetrics.map((metric) => metric.descent));
    const padding = Math.ceil(fontSize * 0.24);
    const width = Math.ceil(metrics.wordLayout.wordWidth + padding * 2);
    const height = Math.ceil(maxAscent + maxDescent + padding * 2);

    if (!state.wordBufferCanvas) {
        state.wordBufferCanvas = document.createElement('canvas');
        state.wordBufferContext = state.wordBufferCanvas.getContext('2d');
    }

    if (
        state.wordBufferCanvas.width !== width ||
        state.wordBufferCanvas.height !== height ||
        state.wordBufferFontSize !== fontSize
    ) {
        state.wordBufferCanvas.width = width;
        state.wordBufferCanvas.height = height;
        state.wordBufferFontSize = fontSize;

        const bufferContext = state.wordBufferContext;
        const baselineY = padding + maxAscent;
        let cursorX = padding;

        bufferContext.clearRect(0, 0, width, height);
        metrics.wordLayout.letterMetrics.forEach((measurement, index) => {
            const previewLetter = {
                char: LETTERS[index],
                index,
                x: cursorX + measurement.width / 2,
                y: baselineY,
                width: measurement.width,
                ascent: measurement.ascent,
                descent: measurement.descent,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                shear: 0,
            };

            drawLetterPath(bufferContext, previewLetter, metrics);
            cursorX += measurement.width + metrics.wordLayout.letterGap;
        });
    }

    return state.wordBufferCanvas;
}

function drawWarpedWordInShape(ctx, state, metrics) {
    if (!state.shapeClosed || state.storedStroke.length < 3) {
        return false;
    }

    const polygon = state.storedStroke;
    const bounds = getBounds(polygon);
    if (bounds.width < 4 || bounds.height < 4) {
        return false;
    }

    const bufferCanvas = ensureWordBuffer(state, metrics);
    const startY = Math.floor(bounds.minY);
    const endY = Math.ceil(bounds.maxY);

    ctx.save();
    drawPath(polygon, ctx, true);
    ctx.clip();

    for (let y = startY; y <= endY; y += 1) {
        const segments = getScanlineSegments(polygon, y + 0.5);
        if (!segments.length) {
            continue;
        }

        const dominant = segments.reduce((widest, current) => (
            (current.end - current.start) > (widest.end - widest.start) ? current : widest
        ));
        const segmentWidth = dominant.end - dominant.start;

        if (segmentWidth <= 1) {
            continue;
        }

        const normalizedY = clamp((y - bounds.minY) / Math.max(bounds.height, 1), 0, 1);
        const sourceY = clamp(normalizedY * (bufferCanvas.height - 1), 0, bufferCanvas.height - 1);

        ctx.drawImage(
            bufferCanvas,
            0,
            sourceY,
            bufferCanvas.width,
            1,
            dominant.start,
            y,
            segmentWidth,
            1
        );
    }

    ctx.restore();
    return true;
}

let mimicState = null;

export function AnimationM(ctx, width, height, movement) {
    const state = ensureState(width, height);
    const metrics = getMetrics(ctx, width, height);

    state.frame += 1;
    syncHomeLayout(state, metrics);
    updateInteraction(state, movement, metrics);
    updateLetters(state);

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawBackground(ctx, metrics);
    drawShapeGuide(ctx, state, metrics);
    if (!drawWarpedWordInShape(ctx, state, metrics)) {
        drawLetterSet(ctx, state, metrics);
    }

    ctx.restore();
}

export function CleanM() {
    mimicState = null;
    wordLayoutCache.clear();
}

export const descriptionM = [
    '화면 중앙의 MIMIC은 단순한 제목이 아니라 눈과 입을 가진 점액 생물처럼 숨을 쉬는 타이포그래피다.',
    '선을 그리는 동안 다섯 글자는 사용자의 손을 따라 길게 늘어나고 찌그러지며, 각 문자는 시선을 움직이고 입 모양도 함께 바꾼다.',
    '도형을 닫으면 여러 개로 복제되지 않고, 하나의 MIMIC만 shape 안쪽으로 길게 퍼지고 눌리며 내부를 메우도록 변형된다.',
    '즉 이 페이지의 핵심은 텍스트 패턴 채우기가 아니라, 하나의 살아 있는 워드가 사용자가 만든 형태 자체로 찌그러지고 번지는 감각에 가깝다.',
];

export const toolTipM = [
    '왼쪽 버튼으로 선이나 도형을 그려 보세요.',
    '열린 선에서는 중앙 MIMIC이 선을 따라 늘어나고, 닫힌 도형에서는 같은 MIMIC 한 세트가 내부 전체로 퍼집니다.',
    '오른쪽 버튼을 누르면 현재 스케치와 변형 상태가 초기화됩니다.',
];
