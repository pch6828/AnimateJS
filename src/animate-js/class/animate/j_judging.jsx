class Tree {
    static maxTimestamp = 100;
    constructor(branchLengthRatio, maxGeneration, maxBranchWidthRatio, rootXRatio = 0, rootYRatio = 0) {
        this.root = { xRatio: rootXRatio, yRatio: rootYRatio };
        this.maxBranchWidthRatio = maxBranchWidthRatio;
        this.branchLengthRatio = branchLengthRatio;
        this.subtree = [];
        this.timestamp1 = 0;
        this.timestamp2 = 0;
        this.dt = 1;
        this.maxGeneration = maxGeneration;
    }

    move(width, height) {
        const branchWidth = width / 100 * (this.maxGeneration + 1);
        this.timestamp1 = Math.min(this.timestamp1 + this.dt, Tree.maxTimestamp);
        this.timestamp2 = Math.max(0, Math.min(this.timestamp2 + this.dt + this.timestamp1 - Tree.maxTimestamp, Tree.maxTimestamp));

        if (this.timestamp1 === Tree.maxTimestamp) {
            if (this.subtree.length === 0 && this.maxGeneration !== 0) {
                const numSubtree = 2
                for (let i = 0; i < numSubtree; i++) {
                    var xRatio = Math.min(Math.max(Math.abs(Math.random() - 0.5) / (5 - this.maxGeneration), branchWidth * 2 / width), this.maxBranchWidthRatio * 0.5 * (i + 1));
                    const changeDir = i > 0 && ((xRatio > 0) === (this.subtree[i - 1].root.xRatio > 0));

                    this.subtree[i] = new Tree(
                        this.branchLengthRatio * (5 + this.maxGeneration - Math.abs(xRatio) * 10) / 10,
                        this.maxGeneration - 1, xRatio,
                        changeDir ? -xRatio : xRatio, -this.branchLengthRatio
                    );
                }
            }

            if (this.timestamp2 === Tree.maxTimestamp) {
                for (let i = 0; i < this.subtree.length; i++) {
                    this.subtree[i].move(width, height);
                }
            }
        }
    }

    draw(ctx, width, height) {
        const treeLineWidth = width / 100 * (this.maxGeneration + 1);
        const nextTreeLineWidth = width / 100 * this.maxGeneration;
        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = treeLineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.translate(this.root.xRatio * width, this.root.yRatio * height);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, (-this.branchLengthRatio * height + (treeLineWidth - nextTreeLineWidth) / 2) * this.timestamp1 / Tree.maxTimestamp);
        ctx.closePath();
        ctx.stroke();

        for (let i = 0; i < this.subtree.length; i++) {
            const subtree = this.subtree[i];
            ctx.lineWidth = nextTreeLineWidth;
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

class Seed {
    constructor(rootXRatio, rootYRatio, trailLine) {
        this.root = { xRatio: rootXRatio, yRatio: rootYRatio };
        if (trailLine) {
            this.trailLine = trailLine;
            this.tree = trailLine.tree;
        }
    }
    move(movement, width, height) {
        const rootX = this.root.xRatio * width;
        movement.mousePoint.x -= rootX;

        this.trailLine.move(movement, width, height);
        this.tree.move(width, height);
        movement.mousePoint.x += rootX;
    }
    draw(ctx, width, height) {
        ctx.save();
        ctx.translate(this.root.xRatio * width, this.root.yRatio * height);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(0, 0, width / 30, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        this.tree.draw(ctx, width, height);
        this.trailLine.draw(ctx, width, height);

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, width / 40, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

class TrailLine {
    constructor(tree) {
        this.tree = tree;
        this.nextLayer = null;
        this.timestamp = 0;
        this.dt = 0.3;
        this.xRatio = 0;
    }

    move(movement, width, height) {
        const rootX = this.tree.root.xRatio * width;
        movement.mousePoint.x -= rootX;
        if (this.tree.timestamp1 === Tree.maxTimestamp) {
            this.timestamp = Math.min(this.timestamp + this.dt, Tree.maxTimestamp);

            if (this.nextLayer === null && this.tree.subtree.length !== 0 && this.timestamp === Tree.maxTimestamp) {
                this.xRatio += movement.mousePoint.x / width * 0.002;
                for (let i = 0; i < this.tree.subtree.length; i++) {
                    const subtree = this.tree.subtree[i];
                    if ((subtree.root.xRatio > 0) === (this.xRatio > 0) &&
                        Math.abs(this.xRatio) >= Math.abs(subtree.root.xRatio)) {
                        this.nextLayer = new TrailLine(subtree);
                        break;
                    }
                }
            }
        }
        if (this.nextLayer)
            this.nextLayer.move(movement, width, height);
        movement.mousePoint.x += rootX;

        if (this.timestamp === Tree.maxTimestamp && this.tree.subtree.length === 0) {

        }
    }

    draw(ctx, width, height) {
        const treeLineWidth = width / 100 * (this.tree.maxGeneration + 1);
        const nextTreeLineWidth = width / 100 * this.tree.maxGeneration;
        ctx.save();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = treeLineWidth * 0.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.translate(this.tree.root.xRatio * width, this.tree.root.yRatio * height);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, (-this.tree.branchLengthRatio * height + (treeLineWidth - nextTreeLineWidth) / 2 * (this.tree.subtree.length === 0 ? 1 : 0.6)) * this.timestamp / Tree.maxTimestamp);
        ctx.closePath();
        ctx.stroke();

        if (this.timestamp === Tree.maxTimestamp) {
            ctx.lineWidth = nextTreeLineWidth * 0.6;
            ctx.beginPath();
            ctx.moveTo(0, -this.tree.branchLengthRatio * height * this.timestamp / Tree.maxTimestamp);
            ctx.lineTo(this.xRatio * width, -this.tree.branchLengthRatio * height * this.timestamp / Tree.maxTimestamp);
            ctx.closePath();
            ctx.stroke();
        }

        if (this.nextLayer)
            this.nextLayer.draw(ctx, width, height);
        ctx.restore();
    }
}

var seed = null;
var treeWithLine = null;

function AnimationJ(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 8;

    if (seed === null) {
        const tree = new Tree(0.25, 3, 0.5);
        const trailLine = new TrailLine(tree);
        seed = new Seed(0.5, 1, trailLine);
    }

    seed.move(movement, width, height);
    seed.draw(ctx, width, height);
    // 계획이 가지치는 모습
    // 매번 약 3회 정도의 분기를 가짐 (분기 횟수, 분기 시 가지 갯수 모두 랜덤으로)
    // 마우스의 움직임을 따라 실제 선택된 계획이 결정됨
    // 종착지에 도착할 경우 클릭시 그 자리에서 다시 반복
    // 일정 길이 이상이 되면 기준점을 다시 업데이트
}

export default AnimationJ;