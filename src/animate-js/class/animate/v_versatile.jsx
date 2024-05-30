class Blade {
    constructor() {

    }
    move(movement) {

    }

    draw(ctx, width, height) {

    }
};

function AnimationV(ctx, width, height, movement) {
    const centerx = width / 2;
    const centery = height / 2;
    const fontSize = height / 6;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 만능 주머니칼의 이미지, 하단에 versatile을 적어두자.
    // 대충 4, 5가지 칼을 그려놓고, 선택할 때마다 손잡이에 다른 텍스트가 적히도록 하자.

    ctx.strokeStyle = 'rgba(128,0,32,1)';
    ctx.lineWidth = width / 10;

    ctx.beginPath();
    ctx.moveTo(centerx - width / 8, centery);
    ctx.lineTo(centerx + width / 8, centery);
    ctx.closePath();

    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.font = 'italic ' + fontSize + 'px Georgia';
    const textwidth = ctx.measureText('Versatile').width;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillText('Versatile', centerx - textwidth / 2, centery + fontSize * 1.7);

}

export default AnimationV;