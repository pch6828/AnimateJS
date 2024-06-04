import { useState } from 'react';
import items from './wheel_button_item.jsx';
import WheelSlot from './wheel_button.jsx';

import '../../style/main.css'

function Main({ deg, setDeg }) {
    const [pos, setPos] = useState(0);

    function rotateWheelStart(e) {
        e.dataTransfer.setDragImage(new Image(), 0, 0);
        setPos(e.clientY);
    }
    function rotateWheel(e) {
        if (e.clientX !== 0 && e.clientY !== 0) {
            const delta = ((pos - e.clientY) % 360) / 3;
            setDeg((deg - delta) % 360);
            setPos(e.clientY);
        }
    }
    function rotateWheelEnd(e) {
        const rounded_deg = Math.round(deg / (360 / 26)) * (360 / 26);
        setDeg(rounded_deg);
        setPos(e.clientY);
    }
    return (
        <div className="wheel-menu"
            draggable
            onDragStart={rotateWheelStart}
            onDrag={rotateWheel}
            onDragEnd={rotateWheelEnd}
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
                    selected={(Math.round(-deg / (360 / 26)) + 26) % 26 === i}
                />
            ))}
        </div>
    );
}

export default Main;