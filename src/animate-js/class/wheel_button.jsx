import '../style/main.css'

function WheelButton({ x, y, deg, alphabet }) {
    console.log(x, y);
    return (
        <div className="wheel-menu-button"
            style={{ transform: 'translate(' + x + 'vh,' + y + 'vh) rotate(' + deg + 'deg)' }}
        >
            {alphabet}
        </div>
    );
}

export default WheelButton;