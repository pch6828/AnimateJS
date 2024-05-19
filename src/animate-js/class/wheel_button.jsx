import '../style/main.css'

function WheelButton({ x, y, deg, alphabet, selected }) {
    return (
        <div className={'wheel-menu-button ' + (selected ? 'selected' : '')}
            style={{ transform: 'translate(' + x + 'vh,' + y + 'vh) rotate(' + deg + 'deg)' }}
        >
            {alphabet + alphabet.toLowerCase()}
        </div>
    );
}

export default WheelButton;