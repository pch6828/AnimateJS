import { useRef, useState, useEffect } from 'react';

import '../../style/content.css';

function Content() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [ctx, setCtx] = useState();
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth * 0.7;
        canvas.height = window.innerHeight;
        console.log(canvas.width, canvas.height);

        context.strokeStyle = 'black';
        context.lineWidth = 2.5;
        contextRef.current = context;

        setCtx(context);
    }, []);

    function startDrawing() {
        setIsDrawing(true);
    };

    function endDrawing() {
        setIsDrawing(false);
    };

    function drawing({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        if (ctx) {
            if (!isDrawing) {
                console.log(nativeEvent);
                ctx.beginPath();
                ctx.moveTo(offsetX, offsetY);
            } else {
                ctx.lineTo(offsetX, offsetY);
                ctx.stroke();
            }
        }
    };

    return (
        <div className='content-page'>
            <div className='content-description'>
                description
            </div>
            <canvas className='content-canvas'
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onMouseMove={drawing}
            >
            </canvas>
        </div>
    );
}

export default Content;