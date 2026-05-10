const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMatrix;
uniform mat4 uModel;
uniform float uLightAmount;

varying float vLight;

void main() {
    vec3 normal = normalize((uModel * vec4(aNormal, 0.0)).xyz);
    vec3 light = normalize(vec3(-0.35, -0.72, 0.6));
    float lit = 0.36 + max(dot(normal, light), 0.0) * 0.64;
    vLight = mix(1.0, lit, uLightAmount);
    gl_Position = uMatrix * vec4(aPosition, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;

uniform vec3 uColor;

varying float vLight;

void main() {
    gl_FragColor = vec4(uColor * vLight, 1.0);
}
`;

const THEME = {
    background: [0.78, 0.9, 0.98, 1],
    backgroundDot: [0.88, 0.96, 1],
    gold: [0.94, 0.68, 0.22],
    hat: [0.21, 0.38, 0.7],
    blanket: [0.16, 0.34, 0.68],
    dot: [0.96, 0.93, 0.86],
    fur: [0.96, 0.93, 0.86],
};

const ANNOYED_MOTION_FRAMES = 76;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(message || 'Unable to compile WebGL shader.');
    }

    return shader;
}

function createProgram(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const message = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(message || 'Unable to link WebGL program.');
    }

    return program;
}

function identity() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

function multiply(left, right) {
    const result = new Array(16).fill(0);

    for (let column = 0; column < 4; column += 1) {
        for (let row = 0; row < 4; row += 1) {
            result[column * 4 + row] =
                left[0 * 4 + row] * right[column * 4 + 0] +
                left[1 * 4 + row] * right[column * 4 + 1] +
                left[2 * 4 + row] * right[column * 4 + 2] +
                left[3 * 4 + row] * right[column * 4 + 3];
        }
    }

    return result;
}

function translate(x, y, z) {
    const matrix = identity();
    matrix[12] = x;
    matrix[13] = y;
    matrix[14] = z;
    return matrix;
}

function rotateX(angle) {
    const matrix = identity();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    matrix[5] = cos;
    matrix[6] = sin;
    matrix[9] = -sin;
    matrix[10] = cos;
    return matrix;
}

function rotateY(angle) {
    const matrix = identity();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    matrix[0] = cos;
    matrix[2] = -sin;
    matrix[8] = sin;
    matrix[10] = cos;
    return matrix;
}

function rotateZ(angle) {
    const matrix = identity();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    matrix[0] = cos;
    matrix[1] = sin;
    matrix[4] = -sin;
    matrix[5] = cos;
    return matrix;
}

function transformLocalPoint(matrix, point) {
    return [
        matrix[0] * point[0] + matrix[4] * point[1] + matrix[8] * point[2] + matrix[12],
        matrix[1] * point[0] + matrix[5] * point[1] + matrix[9] * point[2] + matrix[13],
        matrix[2] * point[0] + matrix[6] * point[1] + matrix[10] * point[2] + matrix[14],
    ];
}

function ortho(left, right, bottom, top, near, far) {
    const matrix = identity();

    matrix[0] = 2 / (right - left);
    matrix[5] = 2 / (top - bottom);
    matrix[10] = -2 / (far - near);
    matrix[12] = -(right + left) / (right - left);
    matrix[13] = -(top + bottom) / (top - bottom);
    matrix[14] = -(far + near) / (far - near);
    return matrix;
}

function createRenderer(gl) {
    const program = createProgram(gl);

    return {
        gl,
        program,
        aPosition: gl.getAttribLocation(program, 'aPosition'),
        aNormal: gl.getAttribLocation(program, 'aNormal'),
        uMatrix: gl.getUniformLocation(program, 'uMatrix'),
        uModel: gl.getUniformLocation(program, 'uModel'),
        uLightAmount: gl.getUniformLocation(program, 'uLightAmount'),
        uColor: gl.getUniformLocation(program, 'uColor'),
    };
}

function ensureRenderer(gl) {
    if (!zzzRenderer || zzzRenderer.gl !== gl) {
        zzzRenderer = createRenderer(gl);
    }

    return zzzRenderer;
}

function createState() {
    return {
        blanketPull: 0,
        targetBlanketPull: 0,
        wakeProgress: 0,
        targetWakeProgress: 0,
        isAwake: false,
        autoSleepFrames: 0,
        zzzTouchCount: 0,
        zzzTouchCooldown: 0,
        annoyedFrames: 0,
        zzzTapCandidate: false,
        pointerStartX: 0,
        pointerStartY: 0,
        isDraggingBlanket: false,
        dragStartY: 0,
        dragStartPull: 0,
        wasDown: false,
    };
}

function ensureState() {
    if (!zzzState) {
        zzzState = createState();
    }

    return zzzState;
}

function approach(current, target, amount) {
    return current + (target - current) * amount;
}

function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
}

function getMaxBlanketPull(metrics) {
    return metrics.size * 0.62;
}

function updateInteractionTimers(state) {
    if (state.zzzTouchCooldown > 0) {
        state.zzzTouchCooldown -= 1;
    } else {
        state.zzzTouchCount = 0;
    }

    if (state.annoyedFrames > 0) {
        state.annoyedFrames -= 1;
    }
}

function updateAutoSleep(state) {
    if (!state.isAwake || state.isDraggingBlanket) {
        return;
    }

    if (state.autoSleepFrames > 0) {
        state.autoSleepFrames -= 1;
        return;
    }

    state.targetBlanketPull = 0;
    state.targetWakeProgress = 0;

    if (state.blanketPull < 1 && state.wakeProgress < 0.01) {
        state.isAwake = false;
    }
}

function triggerZzzTouch(state) {
    state.zzzTouchCount += 1;
    state.zzzTouchCooldown = 64;

    if (state.zzzTouchCount >= 3 && !state.isAwake) {
        state.isAwake = true;
        state.autoSleepFrames = ANNOYED_MOTION_FRAMES + 12;
        state.annoyedFrames = ANNOYED_MOTION_FRAMES;
        state.targetWakeProgress = 1;
        state.zzzTouchCount = 0;
        state.zzzTouchCooldown = 0;
    }
}

function updateInteraction(state, movement, metrics) {
    updateInteractionTimers(state);

    if (!movement) {
        updateAutoSleep(state);
        state.blanketPull = approach(state.blanketPull, state.targetBlanketPull, 0.18);
        state.wakeProgress = approach(state.wakeProgress, state.targetWakeProgress, 0.16);
        return;
    }

    const pointer = movement.mousePoint;
    const maxPull = getMaxBlanketPull(metrics);

    if (!state.wasDown && movement.isDown) {
        const bounds = getBlanketScreenBounds(metrics, state.blanketPull);
        state.pointerStartX = pointer.x;
        state.pointerStartY = pointer.y;
        state.zzzTapCandidate = isPointInZzz(metrics, state, pointer);

        if (
            pointer.x >= bounds.left &&
            pointer.x <= bounds.right &&
            pointer.y >= bounds.top &&
            pointer.y <= bounds.bottom
        ) {
            state.isDraggingBlanket = true;
            state.dragStartY = pointer.y;
            state.dragStartPull = state.targetBlanketPull;
        }
    }

    if (movement.isDown && state.isDraggingBlanket) {
        const deltaY = pointer.y - state.dragStartY;
        state.targetBlanketPull = clamp(state.dragStartPull + deltaY, 0, maxPull);
        const pullRatio = state.targetBlanketPull / Math.max(maxPull, 1);

        state.targetWakeProgress = smoothstep((pullRatio - 0.92) / 0.08);
    }

    if (state.wasDown && !movement.isDown) {
        if (state.zzzTapCandidate) {
            const tapDistance = Math.hypot(
                pointer.x - state.pointerStartX,
                pointer.y - state.pointerStartY
            );

            if (tapDistance <= metrics.size * 0.16) {
                triggerZzzTouch(state);
            }
        }

        if (state.isDraggingBlanket) {
            const pullRatio = state.targetBlanketPull / Math.max(maxPull, 1);

            if (!state.isAwake && pullRatio >= 0.96) {
                state.isAwake = true;
                state.autoSleepFrames = 42;
                state.targetBlanketPull = maxPull;
                state.targetWakeProgress = 1;
            } else {
                state.targetBlanketPull = 0;
                state.targetWakeProgress = 0;
            }
        }

        state.isDraggingBlanket = false;
        state.zzzTapCandidate = false;
    }

    updateAutoSleep(state);

    state.blanketPull = approach(
        state.blanketPull,
        state.targetBlanketPull,
        state.isDraggingBlanket ? 0.42 : 0.18
    );
    state.wakeProgress = approach(
        state.wakeProgress,
        state.targetWakeProgress,
        state.isDraggingBlanket ? 0.35 : 0.16
    );
    state.wasDown = movement.isDown;
}

function getMetrics(width, height) {
    const size = clamp(Math.min(width, height) * 0.34, 104, 220);
    const gap = size * 0.04;
    const sharedDepth = size * 0.24;
    const letters = [
        { size, x: 0 },
        { size: size * 0.72, x: 0 },
        { size: size * 0.72, x: 0 },
    ];
    let cursorX = 0;

    for (const letter of letters) {
        letter.width = letter.size * 0.55;
        letter.height = letter.size;
        letter.thickness = letter.size * 0.24;
        letter.depth = sharedDepth;
        letter.x = cursorX;
        letter.baselineY = 0;
        cursorX += letter.width + gap;
    }

    const totalWidth = cursorX - gap;
    const maxHeight = Math.max(...letters.map((letter) => letter.height));

    for (const letter of letters) {
        letter.x -= totalWidth / 2;
        letter.baselineY += maxHeight / 2;
    }

    return {
        width,
        height,
        size,
        letters,
        projection: ortho(-width / 2, width / 2, height / 2, -height / 2, -1200, 1200),
        group: multiply(
            translate(height * 0.06, -height * 0.06, 0),
            multiply(
                rotateX(Math.PI / 4),
                rotateZ(Math.PI / 4)
            )
        ),
    };
}

function getWakeProgress(state) {
    return state.wakeProgress;
}

function getAnnoyanceProgress(state) {
    if (state.annoyedFrames <= 0) {
        return 0;
    }

    const elapsed = ANNOYED_MOTION_FRAMES - state.annoyedFrames;
    return Math.sin(elapsed / ANNOYED_MOTION_FRAMES * Math.PI);
}

function getAnnoyancePhase(state) {
    return (ANNOYED_MOTION_FRAMES - state.annoyedFrames) * 0.72;
}

function getSleepyGroup(metrics, wakeProgress, annoyanceProgress = 0, annoyancePhase = 0) {
    const annoyedX = Math.sin(annoyancePhase) * metrics.size * 0.035 * annoyanceProgress;
    const annoyedTilt = Math.sin(annoyancePhase * 1.35) * 0.07 * annoyanceProgress;

    return multiply(
        translate(
            metrics.height * 0.06 + annoyedX,
            -metrics.height * 0.06 - metrics.size * 0.32 * wakeProgress,
            metrics.size * 0.12 * wakeProgress
        ),
        multiply(
            rotateX(Math.PI / 4),
            multiply(
                rotateZ(Math.PI / 4 + annoyedTilt),
                rotateX(-Math.PI / 2.5 * wakeProgress)
            )
        )
    );
}

function getZzzScreenBounds(metrics, wakeProgress) {
    const characterGroup = getSleepyGroup(metrics, wakeProgress);
    const corners = [];

    for (const letter of metrics.letters) {
        for (const x of [letter.x, letter.x + letter.width]) {
            for (const y of [letter.baselineY - letter.height, letter.baselineY]) {
                for (const z of [-letter.depth / 2, letter.depth / 2]) {
                    const point = transformLocalPoint(characterGroup, [x, y, z]);
                    corners.push({
                        x: point[0] + metrics.width / 2,
                        y: point[1] + metrics.height / 2,
                    });
                }
            }
        }
    }

    const padding = metrics.size * 0.2;

    return {
        left: Math.min(...corners.map((corner) => corner.x)) - padding,
        right: Math.max(...corners.map((corner) => corner.x)) + padding,
        top: Math.min(...corners.map((corner) => corner.y)) - padding,
        bottom: Math.max(...corners.map((corner) => corner.y)) + padding,
    };
}

function isPointInZzz(metrics, state, point) {
    const bounds = getZzzScreenBounds(metrics, getWakeProgress(state));

    return (
        point.x >= bounds.left &&
        point.x <= bounds.right &&
        point.y >= bounds.top &&
        point.y <= bounds.bottom
    );
}

function getZOutline(letter) {
    const { x, baselineY, width, height, thickness, depth } = letter;
    const top = baselineY - height;
    const bottom = baselineY;
    const diagonalThickness = thickness * 0.62;
    const diagonalInset = thickness * 1.2;

    return {
        depth,
        points: [
            [x, top],
            [x + width, top],
            [x + width, top + thickness],
            [x + diagonalInset, bottom - diagonalThickness],
            [x + width, bottom - thickness],
            [x + width, bottom],
            [x, bottom],
            [x, bottom - thickness],
            [x + width - diagonalInset, top + diagonalThickness],
            [x, top + thickness],
        ],
    };
}

function subtract2d(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function normalize3d(vector) {
    const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
    return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function cross3d(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    ];
}

function getPolygonArea(points) {
    let area = 0;

    for (let index = 0; index < points.length; index += 1) {
        const nextIndex = (index + 1) % points.length;
        area += points[index][0] * points[nextIndex][1] - points[nextIndex][0] * points[index][1];
    }

    return area / 2;
}

function isConvex(prev, current, next, orientation) {
    const cross =
        (current[0] - prev[0]) * (next[1] - current[1]) -
        (current[1] - prev[1]) * (next[0] - current[0]);

    return orientation > 0 ? cross > 0 : cross < 0;
}

function isPointInTriangle(point, a, b, c) {
    const area = (p1, p2, p3) => (
        (p1[0] - p3[0]) * (p2[1] - p3[1]) -
        (p2[0] - p3[0]) * (p1[1] - p3[1])
    );
    const d1 = area(point, a, b);
    const d2 = area(point, b, c);
    const d3 = area(point, c, a);
    const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;

    return !(hasNegative && hasPositive);
}

function triangulatePolygon(points) {
    const remaining = points.map((_, index) => index);
    const triangles = [];
    const orientation = getPolygonArea(points) >= 0 ? 1 : -1;
    let guard = points.length * points.length;

    while (remaining.length > 3 && guard > 0) {
        let earIndex = -1;

        for (let index = 0; index < remaining.length; index += 1) {
            const prevIndex = remaining[(index - 1 + remaining.length) % remaining.length];
            const currentIndex = remaining[index];
            const nextIndex = remaining[(index + 1) % remaining.length];
            const prev = points[prevIndex];
            const current = points[currentIndex];
            const next = points[nextIndex];

            if (!isConvex(prev, current, next, orientation)) {
                continue;
            }

            const containsPoint = remaining.some((candidateIndex) => (
                candidateIndex !== prevIndex &&
                candidateIndex !== currentIndex &&
                candidateIndex !== nextIndex &&
                isPointInTriangle(points[candidateIndex], prev, current, next)
            ));

            if (!containsPoint) {
                triangles.push([prevIndex, currentIndex, nextIndex]);
                earIndex = index;
                break;
            }
        }

        if (earIndex === -1) {
            break;
        }

        remaining.splice(earIndex, 1);
        guard -= 1;
    }

    if (remaining.length === 3) {
        triangles.push([remaining[0], remaining[1], remaining[2]]);
    }

    return triangles;
}

function pushVertex(data, point, z, normal) {
    data.push(point[0], point[1], z, normal[0], normal[1], normal[2]);
}

function pushTriangle(data, a, b, c, z, normal) {
    pushVertex(data, a, z, normal);
    pushVertex(data, b, z, normal);
    pushVertex(data, c, z, normal);
}

function pushQuad(data, frontA, frontB, backA, backB, normal) {
    data.push(...frontA, ...normal);
    data.push(...frontB, ...normal);
    data.push(...backB, ...normal);
    data.push(...frontA, ...normal);
    data.push(...backB, ...normal);
    data.push(...backA, ...normal);
}

function pushMeshVertex(data, x, y, z, normal) {
    data.push(x, y, z, normal[0], normal[1], normal[2]);
}

function createConeMesh(radius, height, segments = 28) {
    const data = [];
    const tip = [0, -height, 0];
    const center = [0, 0, 0];

    for (let index = 0; index < segments; index += 1) {
        const angleA = index / segments * Math.PI * 2;
        const angleB = (index + 1) / segments * Math.PI * 2;
        const a = [Math.cos(angleA) * radius, 0, Math.sin(angleA) * radius];
        const b = [Math.cos(angleB) * radius, 0, Math.sin(angleB) * radius];
        const sideNormal = normalize3d([
            (a[0] + b[0]) / 2,
            radius / Math.max(height, 1),
            (a[2] + b[2]) / 2,
        ]);

        pushMeshVertex(data, tip[0], tip[1], tip[2], sideNormal);
        pushMeshVertex(data, a[0], a[1], a[2], sideNormal);
        pushMeshVertex(data, b[0], b[1], b[2], sideNormal);

        pushMeshVertex(data, center[0], center[1], center[2], [0, 1, 0]);
        pushMeshVertex(data, b[0], b[1], b[2], [0, 1, 0]);
        pushMeshVertex(data, a[0], a[1], a[2], [0, 1, 0]);
    }

    return new Float32Array(data);
}

function createSphereMesh(radius, rows = 10, columns = 16) {
    const data = [];

    for (let row = 0; row < rows; row += 1) {
        const vA = row / rows;
        const vB = (row + 1) / rows;
        const thetaA = vA * Math.PI;
        const thetaB = vB * Math.PI;

        for (let column = 0; column < columns; column += 1) {
            const uA = column / columns;
            const uB = (column + 1) / columns;
            const phiA = uA * Math.PI * 2;
            const phiB = uB * Math.PI * 2;
            const points = [
                sphericalPoint(radius, thetaA, phiA),
                sphericalPoint(radius, thetaB, phiA),
                sphericalPoint(radius, thetaB, phiB),
                sphericalPoint(radius, thetaA, phiB),
            ];

            for (const point of [points[0], points[1], points[2], points[0], points[2], points[3]]) {
                pushMeshVertex(data, point[0], point[1], point[2], normalize3d(point));
            }
        }
    }

    return new Float32Array(data);
}

function sphericalPoint(radius, theta, phi) {
    const sinTheta = Math.sin(theta);

    return [
        Math.cos(phi) * sinTheta * radius,
        Math.cos(theta) * radius,
        Math.sin(phi) * sinTheta * radius,
    ];
}

function pushDiskMesh(data, center, normal, radius, segments = 22) {
    const unitNormal = normalize3d(normal);
    const tangentHint = Math.abs(unitNormal[1]) < 0.92 ? [0, 1, 0] : [1, 0, 0];
    const tangent = normalize3d(cross3d(tangentHint, unitNormal));
    const bitangent = normalize3d(cross3d(unitNormal, tangent));

    for (let index = 0; index < segments; index += 1) {
        const angleA = index / segments * Math.PI * 2;
        const angleB = (index + 1) / segments * Math.PI * 2;
        const a = [
            center[0] + Math.cos(angleA) * tangent[0] * radius + Math.sin(angleA) * bitangent[0] * radius,
            center[1] + Math.cos(angleA) * tangent[1] * radius + Math.sin(angleA) * bitangent[1] * radius,
            center[2] + Math.cos(angleA) * tangent[2] * radius + Math.sin(angleA) * bitangent[2] * radius,
        ];
        const b = [
            center[0] + Math.cos(angleB) * tangent[0] * radius + Math.sin(angleB) * bitangent[0] * radius,
            center[1] + Math.cos(angleB) * tangent[1] * radius + Math.sin(angleB) * bitangent[1] * radius,
            center[2] + Math.cos(angleB) * tangent[2] * radius + Math.sin(angleB) * bitangent[2] * radius,
        ];

        pushMeshVertex(data, center[0], center[1], center[2], unitNormal);
        pushMeshVertex(data, a[0], a[1], a[2], unitNormal);
        pushMeshVertex(data, b[0], b[1], b[2], unitNormal);
    }
}

function createBackgroundDotMesh(width, height) {
    const data = [];
    const base = Math.min(width, height);
    const dots = [
        [-0.42, -0.34, 0.18],
        [-0.12, -0.46, 0.12],
        [0.28, -0.36, 0.16],
        [0.52, -0.08, 0.2],
        [-0.5, 0.18, 0.14],
        [-0.18, 0.1, 0.19],
        [0.18, 0.24, 0.13],
        [0.46, 0.42, 0.17],
    ];

    for (const [x, y, scale] of dots) {
        pushDiskMesh(
            data,
            [x * width, y * height, -1100],
            [0, 0, 1],
            base * scale,
            36
        );
    }

    return new Float32Array(data);
}

function createConeSurfaceVertex(radius, height, y, angle, offset) {
    const localRadius = radius * (1 + y / height);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const normal = normalize3d([cos, radius / Math.max(height, 1), sin]);

    return {
        position: [
            cos * localRadius + normal[0] * offset,
            y + normal[1] * offset,
            sin * localRadius + normal[2] * offset,
        ],
        normal,
    };
}

function pushConeDotMesh(data, coneRadius, height, centerY, centerAngle, dotRadius, offset) {
    const radialSegments = 4;
    const angleSegments = 18;
    const minY = -height + dotRadius * 0.8;
    const maxY = -dotRadius * 0.8;
    const createVertex = (ringIndex, angleIndex) => {
        const distance = dotRadius * ringIndex / radialSegments;
        const theta = angleIndex / angleSegments * Math.PI * 2;
        const y = clamp(centerY + Math.sin(theta) * distance, minY, maxY);
        const localRadius = Math.max(coneRadius * (1 + y / height), coneRadius * 0.08);
        const angle = centerAngle + Math.cos(theta) * distance / localRadius;

        return createConeSurfaceVertex(coneRadius, height, y, angle, offset);
    };

    for (let angleIndex = 0; angleIndex < angleSegments; angleIndex += 1) {
        pushSmoothMeshVertex(data, createVertex(0, 0));
        pushSmoothMeshVertex(data, createVertex(1, angleIndex));
        pushSmoothMeshVertex(data, createVertex(1, angleIndex + 1));
    }

    for (let ringIndex = 1; ringIndex < radialSegments; ringIndex += 1) {
        for (let angleIndex = 0; angleIndex < angleSegments; angleIndex += 1) {
            pushSmoothMeshQuad(
                data,
                createVertex(ringIndex, angleIndex),
                createVertex(ringIndex + 1, angleIndex),
                createVertex(ringIndex, angleIndex + 1),
                createVertex(ringIndex + 1, angleIndex + 1)
            );
        }
    }
}

function createHatDotMesh(radius, height) {
    const data = [];
    const dotOffset = radius * 0.026;
    const dots = [
        { y: -height * 0.16, angle: 0.18, scale: 0.95 },
        { y: -height * 0.26, angle: 2.35, scale: 0.8 },
        { y: -height * 0.34, angle: 4.25, scale: 0.9 },
        { y: -height * 0.46, angle: 1.1, scale: 0.82 },
        { y: -height * 0.57, angle: 3.45, scale: 0.7 },
        { y: -height * 0.69, angle: 5.2, scale: 0.58 },
    ];

    for (const dot of dots) {
        const localRadius = radius * (1 + dot.y / height);
        const dotRadius = Math.min(radius * 0.14 * dot.scale, localRadius * 0.38);

        pushConeDotMesh(data, radius, height, dot.y, dot.angle, dotRadius, dotOffset);
    }

    return new Float32Array(data);
}

function pushMeshQuad(data, a, b, c, d, normal) {
    data.push(...a, ...normal);
    data.push(...b, ...normal);
    data.push(...d, ...normal);
    data.push(...a, ...normal);
    data.push(...d, ...normal);
    data.push(...c, ...normal);
}

function pushSmoothMeshVertex(data, vertex) {
    data.push(...vertex.position, ...vertex.normal);
}

function pushSmoothMeshQuad(data, a, b, c, d) {
    pushSmoothMeshVertex(data, a);
    pushSmoothMeshVertex(data, b);
    pushSmoothMeshVertex(data, d);
    pushSmoothMeshVertex(data, a);
    pushSmoothMeshVertex(data, d);
    pushSmoothMeshVertex(data, c);
}

function createRoundedBoxVertex(center, normal, radius) {
    const unitNormal = normalize3d(normal);

    return {
        position: [
            center[0] + unitNormal[0] * radius,
            center[1] + unitNormal[1] * radius,
            center[2] + unitNormal[2] * radius,
        ],
        normal: unitNormal,
    };
}

function pushRoundedBoxFace(data, half, inner, axis, sign) {
    const axes = [0, 1, 2].filter((candidate) => candidate !== axis);
    const uAxis = axes[0];
    const vAxis = axes[1];
    const normal = [0, 0, 0];
    const corners = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
    ].map(([uSign, vSign]) => {
        const position = [0, 0, 0];

        position[axis] = sign * half[axis];
        position[uAxis] = uSign * inner[uAxis];
        position[vAxis] = vSign * inner[vAxis];
        return position;
    });

    normal[axis] = sign;
    pushMeshQuad(data, corners[0], corners[1], corners[2], corners[3], normal);
}

function pushRoundedBoxEdge(data, inner, radius, axis, signA, signB, arcSegments, lengthSegments) {
    const axes = [0, 1, 2].filter((candidate) => candidate !== axis);
    const aAxis = axes[0];
    const bAxis = axes[1];
    const createVertex = (lengthIndex, arcIndex) => {
        const lengthT = lengthIndex / lengthSegments;
        const angle = arcIndex / arcSegments * Math.PI / 2;
        const center = [0, 0, 0];
        const normal = [0, 0, 0];

        center[axis] = -inner[axis] + inner[axis] * 2 * lengthT;
        center[aAxis] = signA * inner[aAxis];
        center[bAxis] = signB * inner[bAxis];
        normal[aAxis] = signA * Math.cos(angle);
        normal[bAxis] = signB * Math.sin(angle);
        return createRoundedBoxVertex(center, normal, radius);
    };

    for (let lengthIndex = 0; lengthIndex < lengthSegments; lengthIndex += 1) {
        for (let arcIndex = 0; arcIndex < arcSegments; arcIndex += 1) {
            pushSmoothMeshQuad(
                data,
                createVertex(lengthIndex, arcIndex),
                createVertex(lengthIndex + 1, arcIndex),
                createVertex(lengthIndex, arcIndex + 1),
                createVertex(lengthIndex + 1, arcIndex + 1)
            );
        }
    }
}

function pushRoundedBoxCorner(data, inner, radius, signX, signY, signZ, segments) {
    const center = [
        signX * inner[0],
        signY * inner[1],
        signZ * inner[2],
    ];
    const createVertex = (thetaIndex, phiIndex) => {
        const theta = thetaIndex / segments * Math.PI / 2;
        const phi = phiIndex / segments * Math.PI / 2;
        const sinTheta = Math.sin(theta);

        return createRoundedBoxVertex(
            center,
            [
                signX * sinTheta * Math.cos(phi),
                signY * Math.cos(theta),
                signZ * sinTheta * Math.sin(phi),
            ],
            radius
        );
    };

    for (let thetaIndex = 0; thetaIndex < segments; thetaIndex += 1) {
        for (let phiIndex = 0; phiIndex < segments; phiIndex += 1) {
            const a = createVertex(thetaIndex, phiIndex);
            const b = createVertex(thetaIndex + 1, phiIndex);
            const c = createVertex(thetaIndex, phiIndex + 1);
            const d = createVertex(thetaIndex + 1, phiIndex + 1);

            if (thetaIndex === 0) {
                pushSmoothMeshVertex(data, a);
                pushSmoothMeshVertex(data, b);
                pushSmoothMeshVertex(data, d);
            } else {
                pushSmoothMeshQuad(data, a, b, c, d);
            }
        }
    }
}

function getBlanketRadius(width, height, depth) {
    return Math.min(width * 0.06, height * 0.14, depth * 0.28);
}

function createBlanketMesh(width, height, depth, segments = 8, radiusOverride = null) {
    const data = [];
    const half = [width / 2, height / 2, depth / 2];
    const radius = radiusOverride ?? getBlanketRadius(width, height, depth);
    const inner = half.map((value) => Math.max(value - radius, 0));
    const lengthSegments = 1;

    for (let axis = 0; axis < 3; axis += 1) {
        pushRoundedBoxFace(data, half, inner, axis, -1);
        pushRoundedBoxFace(data, half, inner, axis, 1);
    }

    for (let axis = 0; axis < 3; axis += 1) {
        for (const signA of [-1, 1]) {
            for (const signB of [-1, 1]) {
                pushRoundedBoxEdge(data, inner, radius, axis, signA, signB, segments, lengthSegments);
            }
        }
    }

    for (const signX of [-1, 1]) {
        for (const signY of [-1, 1]) {
            for (const signZ of [-1, 1]) {
                pushRoundedBoxCorner(data, inner, radius, signX, signY, signZ, segments);
            }
        }
    }

    return new Float32Array(data);
}

function createBlanketDotMesh(width, height, depth) {
    const data = [];
    const dotRadius = Math.min(width * 0.038, height * 0.055, depth * 0.15);
    const dotOffset = Math.min(width, height, depth) * 0.012;
    const frontDots = [
        [-0.36, -0.3, 0.96],
        [-0.08, -0.25, 0.78],
        [0.22, -0.31, 0.9],
        [0.43, -0.21, 0.72],
        [-0.44, -0.02, 0.74],
        [-0.18, 0.04, 0.92],
        [0.1, -0.03, 0.78],
        [0.36, 0.06, 0.88],
        [-0.31, 0.27, 0.82],
        [-0.02, 0.25, 0.72],
        [0.26, 0.29, 0.95],
    ];
    const topDots = [
        [-0.35, -0.19, 0.75],
        [-0.08, 0.12, 0.88],
        [0.18, -0.13, 0.72],
        [0.42, 0.14, 0.8],
    ];

    for (const [x, y, scale] of frontDots) {
        pushDiskMesh(
            data,
            [x * width, y * height, depth / 2 + dotOffset],
            [0, 0, 1],
            dotRadius * scale
        );
    }

    for (const [x, z, scale] of topDots) {
        pushDiskMesh(
            data,
            [x * width, -height / 2 - dotOffset, z * depth],
            [0, -1, 0],
            dotRadius * scale
        );
    }

    return new Float32Array(data);
}

function createBlanketWhiteMesh(width, height, depth) {
    return createBlanketMesh(
        width * 1.04,
        height * 0.22,
        depth * 1.04,
        6,
        getBlanketRadius(width, height, depth) * 1.2
    );
}

function createZMesh(letter) {
    const outline = getZOutline(letter);
    const { points, depth } = outline;
    const data = [];
    const frontZ = depth / 2;
    const backZ = -depth / 2;
    const frontNormal = [0, 0, 1];
    const backNormal = [0, 0, -1];
    const triangles = triangulatePolygon(points);

    for (const [aIndex, bIndex, cIndex] of triangles) {
        pushTriangle(data, points[aIndex], points[bIndex], points[cIndex], frontZ, frontNormal);
        pushTriangle(data, points[aIndex], points[cIndex], points[bIndex], backZ, backNormal);
    }

    for (let index = 0; index < points.length; index += 1) {
        const nextIndex = (index + 1) % points.length;
        const a = points[index];
        const b = points[nextIndex];
        const edge = subtract2d(b, a);
        const normal = normalize3d([edge[1], -edge[0], 0]);
        const frontA = [a[0], a[1], frontZ];
        const frontB = [b[0], b[1], frontZ];
        const backA = [a[0], a[1], backZ];
        const backB = [b[0], b[1], backZ];

        pushQuad(data, frontA, frontB, backA, backB, normal);
    }

    return new Float32Array(data);
}

function drawMesh(renderer, projection, model, vertices, color, lightAmount = 1) {
    const { gl } = renderer;
    const matrix = multiply(projection, model);
    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STREAM_DRAW);
    gl.enableVertexAttribArray(renderer.aPosition);
    gl.vertexAttribPointer(renderer.aPosition, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(renderer.aNormal);
    gl.vertexAttribPointer(renderer.aNormal, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(renderer.uMatrix, false, new Float32Array(matrix));
    gl.uniformMatrix4fv(renderer.uModel, false, new Float32Array(model));
    gl.uniform1f(renderer.uLightAmount, lightAmount);
    gl.uniform3fv(renderer.uColor, new Float32Array(color));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
    gl.deleteBuffer(buffer);
}

function getHatParts(metrics, characterGroup) {
    const mainLetter = metrics.letters[0];
    const anchorX = mainLetter.x + mainLetter.width * 0.8;
    const anchorY = mainLetter.baselineY - mainLetter.height + mainLetter.thickness * 0.36;
    const anchorZ = -metrics.size * 0.02;
    const baseRadius = metrics.size * 0.18;
    const coneHeight = metrics.size * 0.48;
    const pomRadius = metrics.size * 0.065;
    const mainLocal = multiply(
        translate(anchorX, anchorY, anchorZ + baseRadius * 0.2),
        multiply(
            rotateZ(0.68),
            multiply(rotateX(0.42), rotateY(-0.18))
        )
    );
    const mainTip = transformLocalPoint(mainLocal, [0, -coneHeight, 0]);
    const mainModel = multiply(
        characterGroup,
        mainLocal
    );
    const pomModel = multiply(
        characterGroup,
        translate(mainTip[0], mainTip[1], mainTip[2])
    );

    return [
        { vertices: createConeMesh(baseRadius, coneHeight), model: mainModel, color: THEME.hat },
        { vertices: createHatDotMesh(baseRadius, coneHeight), model: mainModel, color: THEME.dot },
        { vertices: createSphereMesh(pomRadius), model: pomModel, color: THEME.fur },
    ];
}

function getBlanketLayout(metrics, pull = 0) {
    const firstLetter = metrics.letters[0];
    const lastLetter = metrics.letters[metrics.letters.length - 1];
    const left = firstLetter.x - metrics.size * 0.16;
    const right = lastLetter.x + lastLetter.width + metrics.size * 0.18;
    const width = right - left;
    const height = metrics.size * 0.88;
    const depth = firstLetter.depth * 1.24;
    const centerX = (left + right) / 2;
    const centerY = firstLetter.baselineY - metrics.size * 0.1;
    const centerZ = firstLetter.depth * 0.2;
    const localModel = multiply(
        translate(centerX, centerY + pull, centerZ),
        multiply(
            rotateX(0.08),
            rotateZ(-0.03)
        )
    );

    return {
        width,
        height,
        depth,
        model: multiply(
            metrics.group,
            localModel
        ),
    };
}

function getBlanketScreenBounds(metrics, pull = 0) {
    const layout = getBlanketLayout(metrics, pull);
    const corners = [];

    for (const x of [-layout.width / 2, layout.width / 2]) {
        for (const y of [-layout.height / 2, layout.height / 2]) {
            for (const z of [-layout.depth / 2, layout.depth / 2]) {
                const point = transformLocalPoint(layout.model, [x, y, z]);
                corners.push({
                    x: point[0] + metrics.width / 2,
                    y: point[1] + metrics.height / 2,
                });
            }
        }
    }

    const padding = metrics.size * 0.08;

    return {
        left: Math.min(...corners.map((corner) => corner.x)) - padding,
        right: Math.max(...corners.map((corner) => corner.x)) + padding,
        top: Math.min(...corners.map((corner) => corner.y)) - padding,
        bottom: Math.max(...corners.map((corner) => corner.y)) + padding,
    };
}

function getBlanketParts(metrics, state) {
    const layout = getBlanketLayout(metrics, state.blanketPull);
    const whiteModel = multiply(
        layout.model,
        translate(0, -layout.height * 0.5, layout.depth * 0.04)
    );

    return [
        {
            vertices: createBlanketMesh(layout.width, layout.height, layout.depth),
            model: layout.model,
            color: THEME.blanket,
        },
        {
            vertices: createBlanketDotMesh(layout.width, layout.height, layout.depth),
            model: layout.model,
            color: THEME.dot,
        },
        {
            vertices: createBlanketWhiteMesh(layout.width, layout.height, layout.depth),
            model: whiteModel,
            color: THEME.fur,
        },
    ];
}

function renderZzz(gl, width, height, movement) {
    const renderer = ensureRenderer(gl);
    const state = ensureState();
    const metrics = getMetrics(width, height);
    updateInteraction(state, movement, metrics);

    gl.viewport(0, 0, width, height);
    gl.clearColor(...THEME.background);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(renderer.program);

    drawMesh(
        renderer,
        metrics.projection,
        identity(),
        createBackgroundDotMesh(width, height),
        THEME.backgroundDot,
        0
    );

    const wakeProgress = getWakeProgress(state);
    const annoyanceProgress = getAnnoyanceProgress(state);
    const annoyancePhase = getAnnoyancePhase(state);
    const characterGroup = getSleepyGroup(metrics, wakeProgress, annoyanceProgress, annoyancePhase);

    for (let letterIndex = metrics.letters.length - 1; letterIndex >= 0; letterIndex -= 1) {
        const vertices = createZMesh(metrics.letters[letterIndex]);
        drawMesh(renderer, metrics.projection, characterGroup, vertices, THEME.gold);
    }

    for (const part of getBlanketParts(metrics, state)) {
        drawMesh(renderer, metrics.projection, part.model, part.vertices, part.color);
    }

    for (const part of getHatParts(metrics, characterGroup)) {
        drawMesh(renderer, metrics.projection, part.model, part.vertices, part.color);
    }
}

let zzzRenderer = null;
let zzzState = null;

export function AnimationZ(gl, width, height, movement) {
    renderZzz(gl, width, height, movement);
}

export function CleanZ() {
    zzzRenderer = null;
    zzzState = null;
}

export const descriptionZ = [
    `Z 컨텐츠는 WebGL 렌더링 기반으로 다시 시작했습니다.
    기존 A~Y 컨텐츠는 2D canvas를 그대로 사용하고, Z만 WebGL context를 받아 3D 장면으로 그립니다.`,
    `현재 단계에서는 외곽 폴리곤을 extrude한 3D Zzz를 표시합니다.
    가장 큰 Z의 오른쪽 귀퉁이에는 땡땡이 무늬 잠옷 모자를 걸쳐 두었습니다.
    Zzz의 아래쪽에는 같은 무늬를 가진 파란 이불을 덮었습니다.
    이불을 끝까지 끌어내리거나 Zzz를 여러 번 건드리면 잠깐 깨어난 뒤 다시 누워 잠듭니다.`,
];

export const toolTipZ = [
    '이불을 끌어내리거나 Zzz를 여러 번 건드려 보세요.',
];
