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
    cube: [0.28, 0.48, 0.78],
    cubeEdge: [0.95, 0.83, 0.46],
};

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
        velocityX: 0,
        velocityY: 0,
        isDragging: false,
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
    const size = clamp(Math.min(width, height) * 0.34, 130, 280);

    return {
        width,
        height,
        size,
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

function rotateByScreenDelta(state, angleX, angleY) {
    state.orientation = multiply(
        multiply(rotateX(angleX), rotateY(angleY)),
        state.orientation
    );
}

function updateInteraction(state, movement, metrics) {
    if (!movement) {
        rotateByScreenDelta(state, state.velocityX, state.velocityY);
        state.velocityX *= 0.94;
        state.velocityY *= 0.94;
        return;
    }

    const pointer = movement.mousePoint;
    const model = getCubeModel(metrics, state);

    if (!state.wasDown && movement.isDown && isPointOnCube(metrics, model, pointer)) {
        state.isDragging = true;
        state.lastPointerX = pointer.x;
        state.lastPointerY = pointer.y;
        state.velocityX = 0;
        state.velocityY = 0;
    }

    if (movement.isDown && state.isDragging) {
        const deltaX = pointer.x - state.lastPointerX;
        const deltaY = pointer.y - state.lastPointerY;

        state.velocityX = -deltaY * 0.01;
        state.velocityY = deltaX * 0.01;
        rotateByScreenDelta(state, state.velocityX, state.velocityY);
        state.lastPointerX = pointer.x;
        state.lastPointerY = pointer.y;
    }

    if (state.wasDown && !movement.isDown) {
        state.isDragging = false;
    }

    if (!state.isDragging) {
        rotateByScreenDelta(state, state.velocityX, state.velocityY);
        state.velocityX *= 0.94;
        state.velocityY *= 0.94;
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

function createCubeMesh() {
    const data = [];
    const n = 0.5;

    pushFace(data, [-n, -n, n], [n, -n, n], [-n, n, n], [n, n, n], [0, 0, 1]);
    pushFace(data, [n, -n, -n], [-n, -n, -n], [n, n, -n], [-n, n, -n], [0, 0, -1]);
    pushFace(data, [-n, -n, -n], [-n, -n, n], [-n, n, -n], [-n, n, n], [-1, 0, 0]);
    pushFace(data, [n, -n, n], [n, -n, -n], [n, n, n], [n, n, -n], [1, 0, 0]);
    pushFace(data, [-n, -n, -n], [n, -n, -n], [-n, -n, n], [n, -n, n], [0, -1, 0]);
    pushFace(data, [-n, n, n], [n, n, n], [-n, n, -n], [n, n, -n], [0, 1, 0]);

    return new Float32Array(data);
}

function createEdgeMesh(thickness = 0.018) {
    const data = [];
    const n = 0.5;
    const edge = (center, size) => {
        const half = size.map((value) => value / 2);

        pushFace(data, [center[0] - half[0], center[1] - half[1], center[2] + half[2]], [center[0] + half[0], center[1] - half[1], center[2] + half[2]], [center[0] - half[0], center[1] + half[1], center[2] + half[2]], [center[0] + half[0], center[1] + half[1], center[2] + half[2]], [0, 0, 1]);
        pushFace(data, [center[0] + half[0], center[1] - half[1], center[2] - half[2]], [center[0] - half[0], center[1] - half[1], center[2] - half[2]], [center[0] + half[0], center[1] + half[1], center[2] - half[2]], [center[0] - half[0], center[1] + half[1], center[2] - half[2]], [0, 0, -1]);
        pushFace(data, [center[0] - half[0], center[1] - half[1], center[2] - half[2]], [center[0] - half[0], center[1] - half[1], center[2] + half[2]], [center[0] - half[0], center[1] + half[1], center[2] - half[2]], [center[0] - half[0], center[1] + half[1], center[2] + half[2]], [-1, 0, 0]);
        pushFace(data, [center[0] + half[0], center[1] - half[1], center[2] + half[2]], [center[0] + half[0], center[1] - half[1], center[2] - half[2]], [center[0] + half[0], center[1] + half[1], center[2] + half[2]], [center[0] + half[0], center[1] + half[1], center[2] - half[2]], [1, 0, 0]);
        pushFace(data, [center[0] - half[0], center[1] - half[1], center[2] - half[2]], [center[0] + half[0], center[1] - half[1], center[2] - half[2]], [center[0] - half[0], center[1] - half[1], center[2] + half[2]], [center[0] + half[0], center[1] - half[1], center[2] + half[2]], [0, -1, 0]);
        pushFace(data, [center[0] - half[0], center[1] + half[1], center[2] + half[2]], [center[0] + half[0], center[1] + half[1], center[2] + half[2]], [center[0] - half[0], center[1] + half[1], center[2] - half[2]], [center[0] + half[0], center[1] + half[1], center[2] - half[2]], [0, 1, 0]);
    };

    for (const y of [-n, n]) {
        for (const z of [-n, n]) {
            edge([0, y, z], [1 + thickness, thickness, thickness]);
        }
    }

    for (const x of [-n, n]) {
        for (const z of [-n, n]) {
            edge([x, 0, z], [thickness, 1 + thickness, thickness]);
        }
    }

    for (const x of [-n, n]) {
        for (const y of [-n, n]) {
            edge([x, y, 0], [thickness, thickness, 1 + thickness]);
        }
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

    const model = getCubeModel(metrics, state);

    drawMesh(renderer, metrics.projection, model, createCubeMesh(), THEME.cube);
    drawMesh(renderer, metrics.projection, model, createEdgeMesh(), THEME.cubeEdge);
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
