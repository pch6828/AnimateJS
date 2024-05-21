import { useRef, useState, useEffect } from 'react';

import '../../style/content.css';

import AnimationC from '../animate/c_coffee';

function Content() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    const [ctx, setCtx] = useState();
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = devicePixelRatio * window.innerWidth * 0.7;
        canvas.height = devicePixelRatio * window.innerHeight;

        context.strokeStyle = 'black';
        context.lineWidth = 2.5;
        contextRef.current = context;

        let requestId;

        function resizeCanvas() {
            const canvas = canvasRef.current;
            canvas.width = devicePixelRatio * window.innerWidth * 0.7;
            canvas.height = devicePixelRatio * window.innerHeight;
        }

        window.addEventListener('resize', resizeCanvas)

        const requestAnimation = () => {
            requestId = window.requestAnimationFrame(requestAnimation);

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                AnimationC(ctx, canvas.width, canvas.height);
            }
        };

        requestAnimation();

        setCtx(context);

        return () => {
            window.cancelAnimationFrame(requestId);
        };
    }, [ctx]);

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