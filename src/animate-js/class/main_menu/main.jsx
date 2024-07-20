import { useState } from 'react';
import items from './wheel_button_item.jsx';
import WheelSlot from './wheel_button.jsx';

import '../../style/main.css'

function Main({ deg, setDeg }) {
    const [pos, setPos] = useState(0);
    const [isDrag, setIsDrag] = useState(false);

    function rotateWheelStart(e) {
        const { clientY } = e;
        setPos(clientY);
        setIsDrag(true);
    }
    function rotateWheel(e) {
        const { clientY } = e;
        if (isDrag) {
            const delta = ((pos - clientY) % 360);
            setDeg((deg - delta) % 360);
            setPos(clientY);
        }
    }
    function rotateWheelEnd(e) {
        const { clientY } = e;
        const rounded_deg = Math.round(deg / (360 / 26)) * (360 / 26);
        setDeg(rounded_deg);
        setPos(clientY);
        setIsDrag(false);
    }

    return (
        <div className="main-page"
            onPointerDown={rotateWheelStart}
            onPointerMove={rotateWheel}
            onPointerLeave={rotateWheelEnd}
            onPointerUp={rotateWheelEnd}
            onGotPointerCapture={() => { setIsDrag(true); }}
            onLostPointerCapture={() => { setIsDrag(false); }}
        >
            <div className="wheel-menu"
                style={{ transform: 'rotate(' + deg + 'deg)' }}
            >
                <div className="main-title"
                    style={{ transform: 'rotate(' + (-deg) + 'deg) translate(15vw, 0vw)' }}
                >
                    26<br />
                    Animated<br />
                    TMI
                </div>
                {items.map((item, i) => (
                    <WheelSlot
                        key={i}
                        x={45 * Math.cos(2 * Math.PI / 26 * i)}
                        y={45 * Math.sin(2 * Math.PI / 26 * i)}
                        deg={-deg}
                        alphabet={item.key}
                        title={item.title}
                        color={item.color}
                        date={item.date}
                        selected={(Math.round(-deg / (360 / 26)) + 26) % 26 === i}
                    />
                ))}
            </div>
        </div>
    );
}

export default Main;