const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMatrix;
uniform mat4 uModel;

varying float vLight;

void main() {
    vec3 normal = normalize((uModel * vec4(aNormal, 0.0)).xyz);
    vec3 light = normalize(vec3(-0.45, -0.65, 0.62));
    vLight = 0.42 + max(dot(normal, light), 0.0) * 0.58;
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
    background: [0.94, 0.91, 0.86, 1],
    letter: [0.3, 0.47, 0.76],
};

const FACE_LETTERS = [
    { letter: 'M', netX: -1, netY: -1, center: [0, 0, 0.506], normal: [0, 0, 1], u: [1, 0, 0], v: [0, -1, 0] },
    { letter: 'E', netX: -1, netY: 0, center: [-0.506, 0, 0], normal: [-1, 0, 0], u: [0, 0, 1], v: [0, -1, 0] },
    { letter: 'O', netX: 1, netY: 0, center: [0.506, 0, 0], normal: [1, 0, 0], u: [0, 0, -1], v: [0, -1, 0] },
    { letter: 'R', netX: 2, netY: 0, center: [0, 0, -0.506], normal: [0, 0, -1], u: [-1, 0, 0], v: [0, -1, 0] },
    { letter: 'M', netX: 0, netY: 0, center: [0, -0.506, 0], normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, -1] },
    { letter: 'Y', netX: 2, netY: 1, center: [0, 0.506, 0], normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
];

const CLICK_DISTANCE = 8;
const TAP_MAX_FRAMES = 24;
const DOUBLE_TAP_FRAMES = 36;

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

function scale(x, y, z) {
    const matrix = identity();
    matrix[0] = x;
    matrix[5] = y;
    matrix[10] = z;
    return matrix;
}

function transformPoint(matrix, point) {
    return [
        matrix[0] * point[0] + matrix[4] * point[1] + matrix[8] * point[2] + matrix[12],
        matrix[1] * point[0] + matrix[5] * point[1] + matrix[9] * point[2] + matrix[13],
        matrix[2] * point[0] + matrix[6] * point[1] + matrix[10] * point[2] + matrix[14],
    ];
}

function transformVector(matrix, vector) {
    return [
        matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8] * vector[2],
        matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9] * vector[2],
        matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2],
    ];
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function lerp3d(start, end, amount) {
    return [
        lerp(start[0], end[0], amount),
        lerp(start[1], end[1], amount),
        lerp(start[2], end[2], amount),
    ];
}

function smoothstep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
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
        uColor: gl.getUniformLocation(program, 'uColor'),
    };
}

function ensureRenderer(gl) {
    if (!memoryRenderer || memoryRenderer.gl !== gl) {
        memoryRenderer = createRenderer(gl);
    }

    return memoryRenderer;
}

function createState() {
    return {
        orientation: multiply(rotateX(-0.42), rotateY(0.62)),
        unfoldProgress: 0,
        targetUnfoldProgress: 0,
        velocityX: 0,
        velocityY: 0,
        isDragging: false,
        isPointerActive: false,
        pressCandidate: false,
        pressFrames: 0,
        tapCount: 0,
        tapCooldown: 0,
        pointerStartX: 0,
        pointerStartY: 0,
        wasDown: false,
        lastPointerX: 0,
        lastPointerY: 0,
    };
}

function ensureState() {
    if (!memoryState) {
        memoryState = createState();
    }

    return memoryState;
}

function getMetrics(width, height) {
    const size = clamp(Math.min(width, height) * 0.5, 200, 400);
    const unfoldSize = Math.min(width * 0.18, height * 0.26, size * 0.58);

    return {
        width,
        height,
        size,
        unfoldSize,
        unfoldStep: unfoldSize * 1.06,
        projection: ortho(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000),
    };
}

function getCubeModel(metrics, state) {
    return multiply(
        state.orientation,
        scale(metrics.size, metrics.size, metrics.size)
    );
}

function getCubeScreenBounds(metrics, model) {
    const corners = [];

    for (const x of [-0.5, 0.5]) {
        for (const y of [-0.5, 0.5]) {
            for (const z of [-0.5, 0.5]) {
                const point = transformPoint(model, [x, y, z]);
                corners.push({
                    x: point[0] + metrics.width / 2,
                    y: point[1] + metrics.height / 2,
                });
            }
        }
    }

    const padding = metrics.size * 0.12;

    return {
        left: Math.min(...corners.map((corner) => corner.x)) - padding,
        right: Math.max(...corners.map((corner) => corner.x)) + padding,
        top: Math.min(...corners.map((corner) => corner.y)) - padding,
        bottom: Math.max(...corners.map((corner) => corner.y)) + padding,
    };
}

function isPointOnCube(metrics, model, point) {
    const bounds = getCubeScreenBounds(metrics, model);

    return (
        point.x >= bounds.left &&
        point.x <= bounds.right &&
        point.y >= bounds.top &&
        point.y <= bounds.bottom
    );
}

function getUnfoldedNetBounds(metrics) {
    const half = metrics.unfoldSize * 0.58;
    const points = FACE_LETTERS.map((face) => ({
        x: (face.netX - 0.5) * metrics.unfoldStep + metrics.width / 2,
        y: face.netY * metrics.unfoldStep + metrics.height / 2,
    }));

    return {
        left: Math.min(...points.map((point) => point.x)) - half,
        right: Math.max(...points.map((point) => point.x)) + half,
        top: Math.min(...points.map((point) => point.y)) - half,
        bottom: Math.max(...points.map((point) => point.y)) + half,
    };
}

function isPointOnUnfoldedNet(metrics, point) {
    const bounds = getUnfoldedNetBounds(metrics);

    return (
        point.x >= bounds.left &&
        point.x <= bounds.right &&
        point.y >= bounds.top &&
        point.y <= bounds.bottom
    );
}

function rotateByScreenDelta(state, angleX, angleY) {
    state.orientation = multiply(
        multiply(rotateX(angleX), rotateY(angleY)),
        state.orientation
    );
}

function updateTapCooldown(state) {
    if (state.tapCooldown > 0) {
        state.tapCooldown -= 1;
        return;
    }

    state.tapCount = 0;
}

function registerShortTap(state) {
    if (state.tapCooldown > 0 && state.tapCount === 1) {
        state.targetUnfoldProgress = state.targetUnfoldProgress > 0.5 ? 0 : 1;
        state.tapCount = 0;
        state.tapCooldown = 0;
        state.velocityX = 0;
        state.velocityY = 0;
        return;
    }

    state.tapCount = 1;
    state.tapCooldown = DOUBLE_TAP_FRAMES;
}

function updateInteraction(state, movement, metrics) {
    state.unfoldProgress = lerp(state.unfoldProgress, state.targetUnfoldProgress, 0.14);
    updateTapCooldown(state);

    if (!movement) {
        if (state.targetUnfoldProgress < 0.5) {
            rotateByScreenDelta(state, state.velocityX, state.velocityY);
            state.velocityX *= 0.94;
            state.velocityY *= 0.94;
        }
        return;
    }

    const pointer = movement.mousePoint;
    const model = getCubeModel(metrics, state);
    const isUnfolded = state.targetUnfoldProgress > 0.5;

    if (!state.wasDown && movement.isDown) {
        state.pressCandidate = isUnfolded
            ? isPointOnUnfoldedNet(metrics, pointer)
            : isPointOnCube(metrics, model, pointer);
        state.isPointerActive = state.pressCandidate;
        state.isDragging = false;
        state.pointerStartX = pointer.x;
        state.pointerStartY = pointer.y;
        state.lastPointerX = pointer.x;
        state.lastPointerY = pointer.y;
        state.pressFrames = 0;
        state.velocityX = 0;
        state.velocityY = 0;
    }

    if (movement.isDown && state.isPointerActive) {
        state.pressFrames += 1;
    }

    if (movement.isDown && state.isPointerActive && !isUnfolded) {
        const dragDistance = Math.hypot(
            pointer.x - state.pointerStartX,
            pointer.y - state.pointerStartY
        );

        if (!state.isDragging && dragDistance > CLICK_DISTANCE) {
            state.isDragging = true;
        }
    }

    if (movement.isDown && state.isDragging && !isUnfolded) {
        const deltaX = pointer.x - state.lastPointerX;
        const deltaY = pointer.y - state.lastPointerY;

        state.velocityX = -deltaY * 0.01;
        state.velocityY = deltaX * 0.01;
        rotateByScreenDelta(state, state.velocityX, state.velocityY);
        state.lastPointerX = pointer.x;
        state.lastPointerY = pointer.y;
    }

    if (state.wasDown && !movement.isDown) {
        const releaseDistance = Math.hypot(
            pointer.x - state.pointerStartX,
            pointer.y - state.pointerStartY
        );

        if (
            state.pressCandidate &&
            releaseDistance <= CLICK_DISTANCE &&
            state.pressFrames <= TAP_MAX_FRAMES
        ) {
            registerShortTap(state);
        } else if (releaseDistance > CLICK_DISTANCE || state.pressFrames > TAP_MAX_FRAMES) {
            state.tapCount = 0;
            state.tapCooldown = 0;
        }

        state.isDragging = false;
        state.isPointerActive = false;
        state.pressCandidate = false;
        state.pressFrames = 0;
    }

    if (!state.isDragging && state.targetUnfoldProgress < 0.5) {
        rotateByScreenDelta(state, state.velocityX, state.velocityY);
        state.velocityX *= 0.94;
        state.velocityY *= 0.94;
    } else if (state.targetUnfoldProgress > 0.5) {
        state.velocityX *= 0.82;
        state.velocityY *= 0.82;
    }

    state.wasDown = movement.isDown;
}

function pushFace(data, a, b, c, d, normal) {
    data.push(...a, ...normal);
    data.push(...b, ...normal);
    data.push(...d, ...normal);
    data.push(...a, ...normal);
    data.push(...d, ...normal);
    data.push(...c, ...normal);
}

function add3d(a, b) {
    return [
        a[0] + b[0],
        a[1] + b[1],
        a[2] + b[2],
    ];
}

function scale3d(vector, amount) {
    return [
        vector[0] * amount,
        vector[1] * amount,
        vector[2] * amount,
    ];
}

function getFacePoint(face, x, y) {
    return add3d(
        add3d(face.center, scale3d(face.u, x)),
        scale3d(face.v, y)
    );
}

function pushFaceShape(data, face, a, b, c, d) {
    pushFace(
        data,
        getFacePoint(face, a[0], a[1]),
        getFacePoint(face, b[0], b[1]),
        getFacePoint(face, c[0], c[1]),
        getFacePoint(face, d[0], d[1]),
        face.normal
    );
}

function pushDisk(data, face, center, radius, segments = 24) {
    for (let index = 0; index < segments; index += 1) {
        const angleA = index / segments * Math.PI * 2;
        const angleB = (index + 1) / segments * Math.PI * 2;

        pushFaceShape(
            data,
            face,
            center,
            [
                center[0] + Math.cos(angleA) * radius,
                center[1] + Math.sin(angleA) * radius,
            ],
            center,
            [
                center[0] + Math.cos(angleB) * radius,
                center[1] + Math.sin(angleB) * radius,
            ]
        );
    }
}

function pushOvalDisk(data, face, center, radiusX, radiusY, segments = 36) {
    for (let index = 0; index < segments; index += 1) {
        const angleA = index / segments * Math.PI * 2;
        const angleB = (index + 1) / segments * Math.PI * 2;

        pushFaceShape(
            data,
            face,
            center,
            [
                center[0] + Math.cos(angleA) * radiusX,
                center[1] + Math.sin(angleA) * radiusY,
            ],
            center,
            [
                center[0] + Math.cos(angleB) * radiusX,
                center[1] + Math.sin(angleB) * radiusY,
            ]
        );
    }
}

function pushCapsuleStroke(data, face, start, end, thickness) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.hypot(dx, dy) || 1;
    const offsetX = -dy / length * thickness / 2;
    const offsetY = dx / length * thickness / 2;

    pushFaceShape(
        data,
        face,
        [start[0] + offsetX, start[1] + offsetY],
        [end[0] + offsetX, end[1] + offsetY],
        [start[0] - offsetX, start[1] - offsetY],
        [end[0] - offsetX, end[1] - offsetY]
    );
    pushDisk(data, face, start, thickness / 2);
    pushDisk(data, face, end, thickness / 2);
}

function pushOvalRing(data, face, center, outerRadiusX, outerRadiusY, thickness, startAngle = 0, endAngle = Math.PI * 2, segments = 40) {
    const innerRadiusX = Math.max(outerRadiusX - thickness, outerRadiusX * 0.1);
    const innerRadiusY = Math.max(outerRadiusY - thickness, outerRadiusY * 0.1);
    const angleSpan = endAngle - startAngle;

    for (let index = 0; index < segments; index += 1) {
        const angleA = startAngle + angleSpan * index / segments;
        const angleB = startAngle + angleSpan * (index + 1) / segments;
        const outerA = [
            center[0] + Math.cos(angleA) * outerRadiusX,
            center[1] + Math.sin(angleA) * outerRadiusY,
        ];
        const outerB = [
            center[0] + Math.cos(angleB) * outerRadiusX,
            center[1] + Math.sin(angleB) * outerRadiusY,
        ];
        const innerA = [
            center[0] + Math.cos(angleA) * innerRadiusX,
            center[1] + Math.sin(angleA) * innerRadiusY,
        ];
        const innerB = [
            center[0] + Math.cos(angleB) * innerRadiusX,
            center[1] + Math.sin(angleB) * innerRadiusY,
        ];

        pushFaceShape(data, face, outerA, outerB, innerA, innerB);
    }
}

function pushLetterM(data, face) {
    const t = 0.31;

    pushCapsuleStroke(data, face, [-0.33, 0.34], [-0.33, -0.34], t);
    pushCapsuleStroke(data, face, [0.33, 0.34], [0.33, -0.34], t);
    pushCapsuleStroke(data, face, [-0.27, 0.32], [0, -0.03], t);
    pushCapsuleStroke(data, face, [0, -0.03], [0.27, 0.32], t);
}

function pushLetterE(data, face) {
    const t = 0.31;

    pushCapsuleStroke(data, face, [-0.3, 0.34], [-0.3, -0.34], t);
    pushCapsuleStroke(data, face, [-0.3, 0.34], [0.35, 0.34], t);
    pushCapsuleStroke(data, face, [-0.3, 0], [0.25, 0], t);
    pushCapsuleStroke(data, face, [-0.3, -0.34], [0.35, -0.34], t);
}

function pushLetterO(data, face) {
    pushOvalRing(data, face, [0, 0], 0.48, 0.48, 0.35, 0, Math.PI * 2, 56);
}

function pushLetterR(data, face) {
    const t = 0.31;

    pushCapsuleStroke(data, face, [-0.3, 0.34], [-0.3, -0.34], t);
    pushCapsuleStroke(data, face, [-0.3, 0.34], [-0.08, 0.34], t);
    pushCapsuleStroke(data, face, [-0.3, 0.03], [-0.08, 0.03], t);
    pushOvalDisk(data, face, [-0.03, 0.2], 0.42, 0.29, 36);
    pushCapsuleStroke(data, face, [-0.11, -0.03], [0.35, -0.36], t);
}

function pushLetterY(data, face) {
    const t = 0.33;

    pushCapsuleStroke(data, face, [-0.31, 0.35], [0, 0.03], t);
    pushCapsuleStroke(data, face, [0.31, 0.35], [0, 0.03], t);
    pushCapsuleStroke(data, face, [0, 0.03], [0, -0.35], t);
}

function getUnfoldedFace(face, metrics) {
    return {
        letter: face.letter,
        center: [
            (face.netX - 0.5) * metrics.unfoldStep,
            face.netY * metrics.unfoldStep,
            0,
        ],
        normal: [0, 0, 1],
        u: [metrics.unfoldSize, 0, 0],
        v: [0, -metrics.unfoldSize, 0],
    };
}

function getFoldedFace(face, model) {
    return {
        letter: face.letter,
        center: transformPoint(model, face.center),
        normal: transformVector(model, face.normal),
        u: transformVector(model, face.u),
        v: transformVector(model, face.v),
    };
}

function getMorphedFace(face, metrics, model, progress) {
    const amount = smoothstep(progress);
    const folded = getFoldedFace(face, model);
    const unfolded = getUnfoldedFace(face, metrics);

    return {
        letter: face.letter,
        center: lerp3d(folded.center, unfolded.center, amount),
        normal: lerp3d(folded.normal, unfolded.normal, amount),
        u: lerp3d(folded.u, unfolded.u, amount),
        v: lerp3d(folded.v, unfolded.v, amount),
    };
}

function createLetterMesh(metrics, state) {
    const data = [];
    const model = getCubeModel(metrics, state);
    const drawLetter = {
        M: pushLetterM,
        E: pushLetterE,
        O: pushLetterO,
        R: pushLetterR,
        Y: pushLetterY,
    };

    for (const face of FACE_LETTERS) {
        const foldedNormal = transformVector(state.orientation, face.normal);

        if (state.unfoldProgress < 0.02 && foldedNormal[2] <= 0) {
            continue;
        }

        drawLetter[face.letter](data, getMorphedFace(face, metrics, model, state.unfoldProgress));
    }

    return new Float32Array(data);
}

function drawMesh(renderer, projection, model, vertices, color) {
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
    gl.uniform3fv(renderer.uColor, new Float32Array(color));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 6);
    gl.deleteBuffer(buffer);
}

function renderMemory(gl, width, height, movement) {
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

    drawMesh(renderer, metrics.projection, identity(), createLetterMesh(metrics, state), THEME.letter);
}

let memoryRenderer = null;
let memoryState = null;

export function AnimationM(gl, width, height, movement) {
    renderMemory(gl, width, height, movement);
}

export function CleanM() {
    memoryRenderer = null;
    memoryState = null;
}

export const descriptionM = [
    ``
];

export const toolTipM = [
    'Drag the cube to rotate it.'
];
