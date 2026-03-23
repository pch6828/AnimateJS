import '../../style/main.css'

function WheelSlot({ x, y, deg, aspectRatio, alphabet, hasDetailPage, selected }) {
    const labelColor = hasDetailPage ? '#16130f' : '#8b8478';

    return (
        <div className='wheel-slot'
            style={{
                transform: 'translate(' + x + 'vh,' + y + 'vh) rotate(' + deg + 'deg)'
            }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}
                style={{ color: labelColor }}>
                {alphabet + alphabet.toLowerCase()}
            </div>
        </div >
    );
}

export default WheelSlot;
