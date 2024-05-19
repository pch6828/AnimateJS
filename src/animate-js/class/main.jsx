import { useState } from "react";

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
            <div className="wheel-menu-button">

            </div>
        </div>
    );
}

export default Main;