const VERTEX_SHADER_SOURCE = `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uMatrix;
uniform mat4 uModel;

varying float vLight;

void main() {
    vec3 normal = normalize((uModel * vec4(aNormal, 0.0)).xyz);
    vec3 light = normalize(vec3(-0.35, -0.72, 0.6));
    vLight = 0.36 + max(dot(normal, light), 0.0) * 0.64;
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
    background: [0.956, 0.918, 0.843, 1],
    gold: [0.94, 0.68, 0.22],
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
    if (!zzzRenderer || zzzRenderer.gl !== gl) {
        zzzRenderer = createRenderer(gl);
    }

    return zzzRenderer;
}

function createState() {
    return {
        rotationY: 0,
        previousPointerX: null,
        wasDown: false,
    };
}

function ensureState() {
    if (!zzzState) {
        zzzState = createState();
    }

    return zzzState;
}

function updateInteraction(state, movement, width) {
    if (!movement) {
        return;
    }

    if (movement.isDown && state.wasDown && state.previousPointerX !== null) {
        const deltaX = movement.mousePoint.x - state.previousPointerX;
        state.rotationY += deltaX / Math.max(width, 1) * Math.PI * 1.8;
    }

    state.previousPointerX = movement.isDown ? movement.mousePoint.x : null;
    state.wasDown = movement.isDown;
}

function getMetrics(width, height, state) {
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
            translate(0, height * 0.06, 0),
            multiply(
                rotateX(Math.PI / 4),
                rotateZ(Math.PI / 4)
            )
        ),
    };
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

function renderZzz(gl, width, height, movement) {
    const renderer = ensureRenderer(gl);
    const state = ensureState();
    updateInteraction(state, movement, width);
    const metrics = getMetrics(width, height, state);

    gl.viewport(0, 0, width, height);
    gl.clearColor(...THEME.background);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(renderer.program);

    for (let letterIndex = metrics.letters.length - 1; letterIndex >= 0; letterIndex -= 1) {
        const vertices = createZMesh(metrics.letters[letterIndex]);
        drawMesh(renderer, metrics.projection, metrics.group, vertices, THEME.gold);
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
    마우스를 누른 채 좌우로 움직이면 Y축을 기준으로 글씨를 회전할 수 있습니다.
    다음 단계에서 모자, 이불, 수면 인터랙션을 이 3D 기반 위에 얹을 수 있습니다.`,
];

export const toolTipZ = [
    '마우스를 누른 채 좌우로 움직이면 Zzz가 Y축 기준으로 회전합니다.',
];
