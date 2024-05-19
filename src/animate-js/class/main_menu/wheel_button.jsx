import '../../style/main.css'

function WheelSlot({ x, y, deg, alphabet, selected }) {
    return (
        <div className='wheel-slot'
            style={{ transform: 'translate(' + x + 'vh,' + y + 'vh) rotate(' + deg + 'deg)' }}
        >
            <div className={'wheel-slot-label ' + (selected ? 'selected-label' : '')}>
                {alphabet + alphabet.toLowerCase()}
            </div>
            <div className={'wheel-slot-title ' + (selected ? 'selected-title' : '')}>
                Temporary Title
            </div>
        </div>
    );
}

export default WheelSlot;