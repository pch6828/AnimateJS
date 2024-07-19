export function AnimationM(ctx, width, height, movement) {
    const centerx = width / 2;
    const fontSize = height / 10;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(94,113,106,0.7)';
    ctx.font = fontSize + 'px Major Mono Display';
    const textWidth = ctx.measureText('mentor').width;

    ctx.fillText('mentor', centerx - textWidth / 2, fontSize);
    // MENTEE 글자가 줄줄이 이동하는 이미지
    // 임의의 높이에 바닥을 두고 처음에는 좌측 바닥에 글자들이 있도록
    // 시작할 때 랜덤한 높이로 기둥이 생기도록 (목적지)
    // 클릭할 때마다 해당 위치까지 기둥이 생기도록 (최대 6개, 초과 시 처음 만든 기둥부터 사라짐)
    // 만들어진 기둥들을 통해서 글자들이 목적지로 갈 수 있다면(각 기둥 간의 거리가 일정 수준 이하라면) 이동
    // 이동이 끝나면 기둥이 내려오면서 다음 목적지 생성, 무한 반복
}

export function CleanM() {

}