import { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import '../../style/content.css';

import items from './content_item';

function Content() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const { id } = useParams();

    const [ctx, setCtx] = useState();
    const [isDown, setIsDown] = useState(false);
    const [mousePoint, setMousePoint] = useState({ x: 0, y: 0 });

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
                    animation.animate(ctx, canvas.width, canvas.height, { isDown: isDown, mousePoint: mousePoint });
            }
        };

        requestAnimation();

        setCtx(context);

        return () => {
            window.cancelAnimationFrame(requestId);
        };
    }, [ctx, animation, isDown, mousePoint]);

    function mouseDown({ nativeEvent }) {
        setIsDown(true);
        console.log(nativeEvent);
    };

    function mouseUp() {
        setIsDown(false);
    };

    function mouseMove({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        setMousePoint({ x: devicePixelRatio * offsetX, y: devicePixelRatio * offsetY });
    };

    return (
        <div className='content-page'>
            <div className='content-description'>
                <div className='content-alphabet'>
                    {id + id.toLowerCase()}
                </div>
                <div className='content-title'>
                    {animation ? animation.title : ''}
                </div>
                <div className='content-text'>
                    {animation ?
                        animation.text.map((line, i) => (
                            <div className='content-text-line'
                                key={i}>
                                {line}
                            </div>
                        ))
                        : ''}
                </div>

            </div>
            <canvas className='content-canvas'
                ref={canvasRef}
                onMouseDown={mouseDown}
                onMouseUp={mouseUp}
                onMouseLeave={mouseUp}
                onMouseMove={mouseMove}
                onContextMenu={(e) => { e.preventDefault(); }}
            >
            </canvas>
        </div>
    );
}

export default Content;