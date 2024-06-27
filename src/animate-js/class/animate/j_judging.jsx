class Tree {
    static maxTimestamp = 100;
    constructor(rootXRatio, rootYRatio, branchLengthRatio, maxGeneration) {
        this.root = { xRatio: rootXRatio, yRatio: rootYRatio };
        this.branchLengthRatio = branchLengthRatio;
        this.subtree = [];
        this.timestamp = 0;
        this.dt = 1;
        this.maxGeneration = maxGeneration;
    }

    move(movement, width, height) {
        const branchWidth = width / 100 * (this.maxGeneration + 1);
        this.timestamp = Math.min(this.timestamp + this.dt, Tree.maxTimestamp);

        if (this.timestamp === Tree.maxTimestamp) {
            if (this.subtree.length === 0 && this.maxGeneration !== 0) {
                const numSubtree = Math.max(Math.ceil(Math.random() * (this.maxGeneration)), 2);
                for (let i = 0; i < numSubtree; i++) {
                    const xRatio = Math.max((Math.random() - 0.5) / (5 - this.maxGeneration), branchWidth * 2 / width);
                    const changeDir = i > 0 && (xRatio > 0 === this.subtree[i - 1].root.xRatio > 0);

                    this.subtree[i] = new Tree(changeDir ? -xRatio : xRatio, -this.branchLengthRatio, this.branchLengthRatio * (5 + this.maxGeneration - Math.abs(xRatio) * 10) / 10, this.maxGeneration - 1);
                }
            }

            for (let i = 0; i < this.subtree.length; i++) {
                this.subtree[i].move(movement, width, height);
            }
        }
    }

    draw(ctx, width, height) {
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = width / 100 * (this.maxGeneration + 1);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.translate(this.root.xRatio * width, this.root.yRatio * height);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -this.branchLengthRatio * height * this.timestamp / Tree.maxTimestamp);
        ctx.closePath();
        ctx.stroke();

        for (let i = 0; i < this.subtree.length; i++) {
            this.subtree[i].draw(ctx, width, height);
        }
        ctx.restore();
    }
}

var tree = null;

function AnimationJ(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 8;

    if (tree === null) {
        tree = new Tree(0.5, 1, 0.25, 3);
    }

    tree.move(movement, width, height);
    tree.draw(ctx, width, height);
    // 계획이 가지치는 모습
    // 매번 약 3회 정도의 분기를 가짐 (분기 횟수, 분기 시 가지 갯수 모두 랜덤으로)
    // 마우스의 움직임을 따라 실제 선택된 계획이 결정됨
    // 종착지에 도착할 경우 클릭시 그 자리에서 다시 반복
    // 일정 길이 이상이 되면 기준점을 다시 업데이트
}

export default AnimationJ;