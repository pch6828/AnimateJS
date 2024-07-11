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
    static fullRatio = 1 / 30;
    static newSeedRatio = 1 / 80;

    constructor(rootXRatio, rootYRatio, trailLine) {
        this.root = { xRatio: rootXRatio, yRatio: rootYRatio };
        if (trailLine) {
            this.trailLine = trailLine;
            this.tree = trailLine.tree;
        }
        this.prevSeed = null;
        this.timestamp1 = 0;
        this.timestamp2 = 0;
        this.dt1 = 1;
        this.dt2 = 0.5;
        this.proceedingToNext = false;
    }

    move(movement, width, height) {
        const rootX = this.root.xRatio * width;
        var nextSeed = null;
        movement.mousePoint.x -= rootX;

        if (this.prevSeed) {
            this.timestamp1 = Math.min(Tree.maxTimestamp, this.timestamp1 + this.dt1);

            if (this.timestamp1 === Tree.maxTimestamp && movement.isDown)
                this.proceedingToNext = true;

            if (this.proceedingToNext)
                this.timestamp2 = Math.min(Tree.maxTimestamp, this.timestamp2 + this.dt2);

            if (this.timestamp2 === Tree.maxTimestamp) {
                const tree = new Tree(0.25, 3, 0.5);
                const trailLine = new TrailLine(tree);

                this.root.xRatio += this.prevSeed.root.xRatio;
                this.root.yRatio += this.prevSeed.root.yRatio;
                this.prevSeed = null;

                this.trailLine = trailLine;
                this.tree = tree;
            }
        }

        if (this.trailLine)
            nextSeed = this.trailLine.move(movement, width, height);
        if (nextSeed) {
            const dxRatio = nextSeed.root.xRatio;
            const dyRatio = nextSeed.root.yRatio;

            nextSeed.prevSeed = this;
            nextSeed.root.xRatio += this.root.xRatio;
            nextSeed.root.yRatio += this.root.yRatio;

            this.root.xRatio = -dxRatio;
            this.root.yRatio = -dyRatio;
        }
        if (this.tree)
            this.tree.move(width, height);
        movement.mousePoint.x += rootX;

        return nextSeed ? nextSeed : this;
    }
    draw(ctx, width, height) {
        if (this.prevSeed) {
            const timestamp1Ratio = this.timestamp1 / Tree.maxTimestamp;
            const timestamp2Ratio = this.timestamp2 / Tree.maxTimestamp;
            const scaleRatio = 1 + (Seed.fullRatio / Seed.newSeedRatio - 1) * timestamp2Ratio;

            ctx.save();
            ctx.translate(
                (this.root.xRatio + this.prevSeed.root.xRatio * timestamp2Ratio) * width,
                (this.root.yRatio + this.prevSeed.root.yRatio * timestamp2Ratio) * height
            );
            ctx.scale(scaleRatio, scaleRatio);

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0, 0, width * Seed.newSeedRatio * timestamp1Ratio, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();

            this.prevSeed.draw(ctx, width, height);

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, width * Seed.newSeedRatio * 0.75 * timestamp1Ratio, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else {
            ctx.save();
            ctx.translate(this.root.xRatio * width, this.root.yRatio * height);

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0, 0, width * Seed.fullRatio, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();

            if (this.tree)
                this.tree.draw(ctx, width, height);
            if (this.trailLine)
                this.trailLine.draw(ctx, width, height);

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0, 0, width * Seed.fullRatio * 0.75, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
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
        var seed = null;
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
            seed = this.nextLayer.move(movement, width, height);
        movement.mousePoint.x += rootX;

        if (seed === null &&
            this.timestamp === Tree.maxTimestamp &&
            this.tree.subtree.length === 0) {
            seed = new Seed(0, -this.tree.branchLengthRatio, null);
        }

        if (seed) {
            seed.root.xRatio += this.tree.root.xRatio;
            seed.root.yRatio += this.tree.root.yRatio;
        }

        return seed;
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
    const fontSize = height / 5;

    ctx.font = fontSize + 'px Audiowide';
    const largeTextWidth = ctx.measureText('J').width;
    ctx.font = fontSize / 2 + 'px Audiowide';
    const smallTextWidth = Math.max(ctx.measureText('Plan of').width, ctx.measureText('Madness').width);
    // 좌측에 거대한 J
    // 바로 옆으로 Plan of / Madness를 두 줄로 작성

    ctx.font = fontSize + 'px Audiowide';
    ctx.fillText('J', centerx - (largeTextWidth + smallTextWidth) / 2, height / 5);
    ctx.font = fontSize / 2 + 'px Audiowide';
    ctx.fillText('Plan of', centerx - (largeTextWidth + smallTextWidth) / 2 + largeTextWidth, height / 5 - fontSize / 2);
    ctx.fillText('Madness', centerx - (largeTextWidth + smallTextWidth) / 2 + largeTextWidth, height / 5);

    if (seed === null) {
        const tree = new Tree(0.25, 3, 0.5);
        const trailLine = new TrailLine(tree);
        seed = new Seed(0.5, 1, trailLine);
    }

    seed = seed.move(movement, width, height);
    seed.draw(ctx, width, height);
}

export default AnimationJ;