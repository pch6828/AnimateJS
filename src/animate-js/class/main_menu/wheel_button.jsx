import '../../style/main.css'

function WheelSlot({ x, y, deg, alphabet, title, color, selected }) {
    return (
        <div className='wheel-slot'
            style={{ transform: 'translate(' + x + 'vh,' + y + 'vh) rotate(' + deg + 'deg)' }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}
                style={{ color: title ? color : 'black' }}>
                {alphabet + alphabet.toLowerCase()}
            </div>
            <div className={'wheel-slot-title ' + (selected ? 'selected-title' : '')}>
                {title ? title : '(null)'}
            </div>
        </div>
    );
}

export default WheelSlot;