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

function createCubeVertices() {
    const faces = [
        { normal: [0, 0, 1], corners: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
        { normal: [0, 0, -1], corners: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
        { normal: [1, 0, 0], corners: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
        { normal: [-1, 0, 0], corners: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
        { normal: [0, 1, 0], corners: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
        { normal: [0, -1, 0], corners: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] },
    ];
    const data = [];

    for (const face of faces) {
        const [a, b, c, d] = face.corners;
        for (const corner of [a, b, c, a, c, d]) {
            data.push(...corner, ...face.normal);
        }
    }

    return new Float32Array(data);
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

function scale(x, y, z) {
    const matrix = identity();
    matrix[0] = x;
    matrix[5] = y;
    matrix[10] = z;
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
    const buffer = gl.createBuffer();
    const vertices = createCubeVertices();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    return {
        gl,
        program,
        buffer,
        vertexCount: vertices.length / 6,
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

function getMetrics(width, height) {
    const size = clamp(Math.min(width, height) * 0.34, 104, 220);
    const gap = -size * 0.05;
    const letters = [
        { size, x: 0 },
        { size: size * 0.72, x: 0 },
        { size: size * 0.52, x: 0 },
    ];
    let cursorX = 0;

    for (const letter of letters) {
        letter.width = letter.size * 0.82;
        letter.height = letter.size;
        letter.thickness = letter.size * 0.24;
        letter.depth = letter.size * 0.24;
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
            translate(0, height * 0.03, 0),
            multiply(
                rotateZ(0.12),
                multiply(rotateX(-0.55), rotateY(0.28))
            )
        ),
    };
}

function getCuboidsForLetter(letter) {
    const { x, baselineY, width, height, thickness, depth } = letter;
    const topY = baselineY - height + thickness / 2;
    const bottomY = baselineY - thickness / 2;
    const startX = x + width - thickness / 2;
    const startY = baselineY - height + thickness / 2;
    const endX = x + thickness / 2;
    const endY = baselineY - thickness / 2;
    const diagonalLength = Math.hypot(endX - startX, endY - startY);
    const diagonalAngle = Math.atan2(endY - startY, endX - startX);

    return [
        { x: x + width / 2, y: topY, z: 0, width, height: thickness, depth, angle: 0 },
        { x: (startX + endX) / 2, y: (startY + endY) / 2, z: 0, width: diagonalLength, height: thickness, depth, angle: diagonalAngle },
        { x: x + width / 2, y: bottomY, z: 0, width, height: thickness, depth, angle: 0 },
    ];
}

function getCuboidMatrix(group, cuboid) {
    const local = multiply(
        translate(cuboid.x, cuboid.y, cuboid.z),
        multiply(
            rotateZ(cuboid.angle),
            scale(cuboid.width, cuboid.height, cuboid.depth)
        )
    );

    return multiply(group, local);
}

function drawCuboid(renderer, projection, model, color) {
    const { gl } = renderer;
    const matrix = multiply(projection, model);

    gl.uniformMatrix4fv(renderer.uMatrix, false, new Float32Array(matrix));
    gl.uniformMatrix4fv(renderer.uModel, false, new Float32Array(model));
    gl.uniform3fv(renderer.uColor, new Float32Array(color));
    gl.drawArrays(gl.TRIANGLES, 0, renderer.vertexCount);
}

function renderZzz(gl, width, height) {
    const renderer = ensureRenderer(gl);
    const metrics = getMetrics(width, height);

    gl.viewport(0, 0, width, height);
    gl.clearColor(...THEME.background);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(renderer.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.buffer);
    gl.enableVertexAttribArray(renderer.aPosition);
    gl.vertexAttribPointer(renderer.aPosition, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(renderer.aNormal);
    gl.vertexAttribPointer(renderer.aNormal, 3, gl.FLOAT, false, 24, 12);

    for (let letterIndex = metrics.letters.length - 1; letterIndex >= 0; letterIndex -= 1) {
        const cuboids = getCuboidsForLetter(metrics.letters[letterIndex]);

        for (const cuboid of cuboids) {
            const model = getCuboidMatrix(metrics.group, cuboid);
            drawCuboid(renderer, metrics.projection, model, THEME.gold);
        }
    }
}

let zzzRenderer = null;

export function AnimationZ(gl, width, height) {
    renderZzz(gl, width, height);
}

export function CleanZ() {
    zzzRenderer = null;
}

export const descriptionZ = [
    `Z 컨텐츠는 WebGL 렌더링 기반으로 다시 시작했습니다.
    기존 A~Y 컨텐츠는 2D canvas를 그대로 사용하고, Z만 WebGL context를 받아 3D 장면으로 그립니다.`,
    `현재 단계에서는 직육면체 조합으로 만든 간단한 3D Zzz를 표시합니다.
    다음 단계에서 모자, 이불, 수면 인터랙션을 이 3D 기반 위에 얹을 수 있습니다.`,
];

export const toolTipZ = [
    '현재 단계는 WebGL 기반 3D Zzz 렌더링을 확인하는 상태입니다.',
];
