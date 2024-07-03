class Tree {
    static maxTimestamp = 100;
    constructor(rootXRatio, rootYRatio, branchLengthRatio, maxGeneration) {
        this.root = { xRatio: rootXRatio, yRatio: rootYRatio };
        this.branchLengthRatio = branchLengthRatio;
        this.subtree = [];
        this.timestamp1 = 0;
        this.timestamp2 = 0;
        this.dt = 1;
        this.maxGeneration = maxGeneration;
    }

    move(movement, width, height) {
        const branchWidth = width / 100 * (this.maxGeneration + 1);
        this.timestamp1 = Math.min(this.timestamp1 + this.dt, Tree.maxTimestamp);
        this.timestamp2 = Math.max(0, Math.min(this.timestamp2 + this.dt + this.timestamp1 - Tree.maxTimestamp, Tree.maxTimestamp));

        if (this.timestamp1 === Tree.maxTimestamp) {
            if (this.subtree.length === 0 && this.maxGeneration !== 0) {
                const numSubtree = Math.max((Math.random() >= 0.5 ? 1 : 0) + this.maxGeneration - 1, 2);
                for (let i = 0; i < numSubtree; i++) {
                    var xRatio = Math.min(Math.max(Math.abs(Math.random() - 0.5) / (5 - this.maxGeneration), branchWidth * 1.5 / width), this.root.xRatio * 0.4 * (i + 1));
                    const changeDir = i > 0 && ((xRatio > 0) === (this.subtree[i - 1].root.xRatio > 0));

                    this.subtree[i] = new Tree(changeDir ? -xRatio : xRatio, -this.branchLengthRatio,
                        this.branchLengthRatio * (5 + this.maxGeneration - Math.abs(xRatio) * 10) / 10, this.maxGeneration - 1);
                }
            }

            if (this.timestamp2 === Tree.maxTimestamp) {
                for (let i = 0; i < this.subtree.length; i++) {
                    this.subtree[i].move(movement, width, height);
                }
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
        ctx.lineTo(0, -this.branchLengthRatio * height * this.timestamp1 / Tree.maxTimestamp);
        ctx.closePath();
        ctx.stroke();

        for (let i = 0; i < this.subtree.length; i++) {
            const subtree = this.subtree[i];
            ctx.lineWidth = width / 100 * this.maxGeneration;
            ctx.beginPath();
            ctx.moveTo(0, -this.branchLengthRatio * height * this.timestamp1 / Tree.maxTimestamp);
            ctx.lineTo(subtree.root.xRatio * width * this.timestamp2 / Tree.maxTimestamp, -this.branchLengthRatio * height * this.timestamp1 / Tree.maxTimestamp);
            ctx.closePath();
            ctx.stroke();

            subtree.draw(ctx, width, height);
        }
        ctx.restore();
    }
}

class TrailLine {
    constructor(tree) {
        this.tree = tree;
        this.nextLayer = null;
    }

    movement(movement, width, height) {

    }

    draw(ctx, width, height) {

    }
}

var treeWithLine = null;

function AnimationJ(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 8;

    if (treeWithLine === null) {
        treeWithLine = new TrailLine(new Tree(0.5, 1, 0.25, 3));
    }

    treeWithLine.tree.move(movement, width, height);
    treeWithLine.tree.draw(ctx, width, height);
    // 계획이 가지치는 모습
    // 매번 약 3회 정도의 분기를 가짐 (분기 횟수, 분기 시 가지 갯수 모두 랜덤으로)
    // 마우스의 움직임을 따라 실제 선택된 계획이 결정됨
    // 종착지에 도착할 경우 클릭시 그 자리에서 다시 반복
    // 일정 길이 이상이 되면 기준점을 다시 업데이트
}

export default AnimationJ;