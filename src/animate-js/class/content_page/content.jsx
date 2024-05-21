import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import '../../style/content.css';

import items from './content_item';

function Content() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const { id } = useParams();

    const [ctx, setCtx] = useState();
    const [isDrawing, setIsDrawing] = useState(false);


    const animation = items.get(id);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = devicePixelRatio * window.innerWidth * 0.7;
        canvas.height = devicePixelRatio * window.innerHeight;
        canvas.style.backgroundColor = animation ? animation.backgroundColor : 'bisque';

        context.strokeStyle = 'black';
        context.lineWidth = 2.5;
        contextRef.current = context;

        let requestId;

        function resizeCanvas() {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.width = devicePixelRatio * window.innerWidth * 0.7;
                canvas.height = devicePixelRatio * window.innerHeight;
            }
        }

        window.addEventListener('resize', resizeCanvas)

        const requestAnimation = () => {
            requestId = window.requestAnimationFrame(requestAnimation);

            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (animation)
                    animation.animate(ctx, canvas.width, canvas.height);
            }
        };

        requestAnimation();

        setCtx(context);

        return () => {
            window.cancelAnimationFrame(requestId);
        };
    }, [ctx, animation]);

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