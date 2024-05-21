var length = 50;

class Point {
    constructor(x, y, start, change_range) {
        this.x = x;
        this.y = y;
        this.initial_y = y;
        this.cur = start;
        this.speed = 0.1;
        this.max_change = Math.random() * change_range;
    }

    resize(change_range) {
        this.max_change = Math.random() * change_range;
    }

    update() {
        this.cur += this.speed;
        this.y = this.initial_y + this.max_change * Math.sin(this.cur);
    }
}

class Wave {
    constructor(width, height, index, point_cnt, color, cup_bottom) {
        this.index = index;
        this.point_cnt = point_cnt;
        this.color = color;
        this.points = [];

        this.width = width;
        this.height = height;
        this.cup_bottom = cup_bottom;

        this.initialy = height / 2 + cup_bottom;
        this.gap = this.width / (this.point_cnt - 1);
        this.init();
    }

    init() {
        this.points = [];

        for (let i = 0; i < this.point_cnt; i++) {
            this.points[i] = new Point(this.gap * i, this.initialy, this.index + i, this.height / 30);
        }
    }

    resize(width, height, cup_bottom) {
        this.width = width;
        this.height = height;
        this.cup_bottom = cup_bottom;

        this.initialy = height / 2 + this.cup_bottom;

        this.gap = this.width / (this.point_cnt - 1);
        this.init();
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;

        let prevx = this.points[0].x;
        let prevy = this.points[0].y;

        ctx.moveTo(prevx, prevy);

        for (let i = 0; i < this.point_cnt; i++) {
            if (0 < i && i < this.point_cnt - 1) {
                this.points[i].update();
            }

            const cx = (prevx + this.points[i].x) / 2;
            const cy = (prevy + this.points[i].y) / 2;

            ctx.quadraticCurveTo(prevx, prevy, cx, cy);
            prevx = this.points[i].x;
            prevy = this.points[i].y;
        }

        ctx.lineTo(prevx, prevy);
        ctx.lineTo(this.width, this.height);
        ctx.lineTo(this.points[0].x, this.height);
        ctx.fill();
        ctx.closePath();
    }

    update(dy) {
        for (let i = 0; i < this.point_cnt; i++) {
            if (!(0 < i && i < this.point_cnt - 1)) {
                this.points[i].y -= dy;
                if (this.points[i].y > this.initialy) {
                    this.points[i].y = this.initialy;
                } else if (this.points[i].y < this.initialy - this.cup_bottom * 8 / 5) {
                    this.points[i].y = this.initialy - this.cup_bottom * 8 / 5;
                };
            }
            this.points[i].initial_y -= dy;
            if (this.points[i].initial_y > this.initialy) {
                this.points[i].initial_y = this.initialy;
            } else if (this.points[i].initial_y < this.initialy - this.cup_bottom * 8 / 5) {
                this.points[i].initial_y = this.initialy - this.cup_bottom * 8 / 5;
            };
        }
    }
}

class Waves {
    constructor(width, height, cup_bottom) {
        this.wave_cnt = 3;
        this.point_cnt = 6;
        this.color = ['#714623', '#744F28', '#9E652E'];
        this.width = width;
        this.height = height;

        this.waves = [];
        for (let i = 0; i < this.wave_cnt; i++) {
            this.waves[i] = new Wave(width, height, i, this.point_cnt, this.color[i], cup_bottom);
        }
    }

    resize(width, height, cup_bottom) {
        for (let i = 0; i < this.wave_cnt; i++) {
            this.waves[i].resize(width, height, cup_bottom);
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.wave_cnt; i++) {
            this.waves[i].draw(ctx);
        }
    }

    update(dy) {
        for (let i = 0; i < this.wave_cnt; i++) {
            this.waves[i].update(dy);
        }
    }
}

class Pour {
    constructor(centerx, bottom, width) {
        this.x = centerx;
        this.y = 0;
        this.length = 0;
        this.bottom = bottom;
        this.lineWidth = width;

    }

    touch_bottom() {
        if (this.y >= this.bottom) {
            this.length -= 10;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.strokeStyle = '#9E652E';
        ctx.lineWidth = this.lineWidth;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.length);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        ctx.closePath();
    }

    add() {
        this.length += 10;
    }

    down() {
        this.y = Math.min(this.y + 10, this.bottom);
    }

    empty() {
        return this.length === 0;
    }
}

var coffee = null;
var drop = [];
var now_drop = null;
var noDown_cnt = 0;

function AnimationC(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const coffeesize = height / 4;

    if (coffee === null || coffee.width !== width || coffee.height !== height) {
        coffee = new Waves(width, height, coffeesize);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    if (movement.isDown) {
        if (!now_drop) {
            now_drop = new Pour(centerx, centery + coffeesize, coffeesize / 10);
        }
        now_drop.add();
        noDown_cnt = 0;
    } else {
        if (now_drop) {
            drop[drop.length] = now_drop;
            now_drop = null;
        }
        noDown_cnt++;
    }

    if (noDown_cnt >= 100) {
        coffee.update(-0.5);
    }

    if (now_drop) {
        if (now_drop.touch_bottom()) {
            coffee.update(1);
        }
    }
    for (let i = 0; i < drop.length; i++) {
        if (drop[i].touch_bottom()) {
            coffee.update(1);
        }
    }
    while (drop[0] && drop[0].empty()) {
        drop.splice(0, 1);
    }

    ctx.font = coffeesize + 'px Big Shoulders Display';
    const textwidth = ctx.measureText('COFFEE').width;

    // Draw Handle
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.arc(centerx + textwidth / 2, centery - coffeesize / 3, coffeesize / 3, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();

    // Make a Hole for Handle
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerx + textwidth / 2, centery - coffeesize / 3, coffeesize / 5, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    // Add Text "COFFEE"
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = coffeesize + 'px Big Shoulders Display';
    ctx.fillText('COFFEE', centerx - textwidth / 2, centery);

    // Add Bottom of Cup
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(centerx, centery, textwidth / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'source-atop';
    coffee.draw(ctx);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(centerx + textwidth / 2, centery - coffeesize * 2 / 3, coffeesize / 3, coffeesize * 2 / 3);
    ctx.globalCompositeOperation = 'source-over';

    if (now_drop) {
        now_drop.draw(ctx);
        now_drop.down();
    }
    for (let i = 0; i < drop.length; i++) {
        drop[i].draw(ctx);
        drop[i].down();
    }

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(centerx - textwidth / 2, centery + textwidth / 2 - 10, textwidth, 10);
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(0, centery + textwidth / 2, width, height);
}

export default AnimationC;