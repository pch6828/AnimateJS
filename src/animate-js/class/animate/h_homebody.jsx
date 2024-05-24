
function AnimationH(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 7;
    const roundCorner = fontSize / 5;

    ctx.globalCompositeOperation = 'source-over';

    ctx.font = fontSize + 'px Madimi One';
    const textwidth = ctx.measureText('Homebody').width;
    const textwidthHome = ctx.measureText('Home').width;
    const textwidthBody = ctx.measureText('body').width;

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize / 3;

    ctx.fillText('Home', centerx - textwidth / 2, centery + fontSize / 4);

    // Draw House icon
    ctx.beginPath();
    ctx.roundRect(centerx - textwidth / 2 + textwidthHome, centery - fontSize, textwidthBody, fontSize * 1.5, [roundCorner, roundCorner, roundCorner, roundCorner]);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(centerx - textwidth / 2 + textwidthHome, centery - fontSize * 0.7);
    ctx.lineTo(centerx - textwidth / 2 + textwidthHome + textwidthBody / 2, centery - fontSize * 1.5);
    ctx.lineTo(centerx + textwidth / 2, centery - fontSize * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerx - textwidth / 2 + textwidthHome + textwidthBody * 0.8, centery - fontSize * 0.7);
    ctx.lineTo(centerx - textwidth / 2 + textwidthHome + textwidthBody * 0.8, centery - fontSize * 1.5);
    ctx.closePath();
    ctx.stroke();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillText('body', centerx - textwidth / 2 + textwidthHome, centery + fontSize / 4);
}

export default AnimationH