function AnimationP(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 6;


    ctx.font = fontSize + 'px Times New Roman';
    const textwidth = ctx.measureText('Postgraduate').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText('Postgraduate', centerx - textwidth / 2, centery + fontSize * 1.5);
}

export default AnimationP