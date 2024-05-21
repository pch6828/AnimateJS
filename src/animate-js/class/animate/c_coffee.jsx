var length = 50;

function AnimationC(ctx, width, height) {
    const centerx = width / 2;
    const centery = height / 2;
    const coffeesize = height / 4;

    ctx.globalCompositeOperation = 'source-over';


    ctx.font = coffeesize + 'px Big Shoulders Display';
    const textwidth = ctx.measureText('COFFEE').width;

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.arc(centerx + textwidth / 2, centery - coffeesize / 3, coffeesize / 3, Math.PI / 2, -Math.PI / 2, true);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerx + textwidth / 2, centery - coffeesize / 3, coffeesize / 5, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = coffeesize + 'px Big Shoulders Display';
    ctx.fillText('COFFEE', centerx - textwidth / 2, centery);
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    ctx.arc(centerx, centery, textwidth / 2, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(centerx - textwidth / 2, centery + textwidth / 2 - 10, textwidth, 10);

    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(centerx + textwidth / 2, centery - coffeesize * 2 / 3, coffeesize / 3, coffeesize * 2 / 3);
    ctx.globalCompositeOperation = 'source-over';

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(centerx - textwidth / 2, centery + textwidth / 2 - 10, textwidth, 10);
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillRect(0, centery + textwidth / 2, this.width, this.height);
    ctx.restore();
}

export default AnimationC;