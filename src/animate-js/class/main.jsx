import { useState } from 'react';
import items from './wheel_button_item.jsx';
import WheelButton from './wheel_button.jsx';

import '../style/main.css'

function Main() {
    const [deg, setDeg] = useState(0);
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
            {items.map((item, i) => (
                <WheelButton
                    key={i}
                    x={75 * Math.sin(2 * Math.PI / 26 * i)}
                    y={75 * Math.cos(2 * Math.PI / 26 * i)}
                    deg={-deg}
                    alphabet={item.key}
                />
            ))}
        </div>
    );
}

export default Main;