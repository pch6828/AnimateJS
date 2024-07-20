import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import '../../style/content.css';

import items from './content_item';

function Content() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const { id } = useParams();

    const [ctx, setCtx] = useState();
    const [isDown, setIsDown] = useState(false);
    const [mousePoint, setMousePoint] = useState({ x: 0, y: 0 });
    const [mouseButton, setMouseButton] = useState(null);
    const [isToolTipOn, setIsToolTipOn] = useState(false);

    const animation = items.get(id);

    useEffect(() => {
        return () => {
            animation.clean();
        }
    }, [animation]);

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
                    animation.animate(ctx, canvas.width, canvas.height,
                        {
                            isDown: isDown,
                            mousePoint: mousePoint,
                            mouseButton: mouseButton
                        });
            }
        };

        requestAnimation();

        setCtx(context);

        return () => {
            window.cancelAnimationFrame(requestId);
        };
    }, [ctx, animation, isDown, mousePoint, mouseButton]);

    function mouseDown({ nativeEvent }) {
        const { button, offsetX, offsetY } = nativeEvent;
        setIsDown(true);
        setMouseButton(button === 0 ? 'left' : 'right');
        setMousePoint({ x: devicePixelRatio * offsetX, y: devicePixelRatio * offsetY });
    };

    function mouseUp() {
        setIsDown(false);
        setMouseButton(null);
    };

    function mouseMove({ nativeEvent }) {
        const { offsetX, offsetY } = nativeEvent;
        setMousePoint({ x: devicePixelRatio * offsetX, y: devicePixelRatio * offsetY });
    };

    function toolTipClick() {
        setIsToolTipOn(!isToolTipOn);
    }

    return (
        <div className='content-page'>
            <div className='content-description'>
                <Link className='content-close' to={'/'} />
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
            <div className='content-canvas-wrapper'>
                <canvas className='content-canvas'
                    ref={canvasRef}
                    onPointerDown={mouseDown}
                    onPointerUp={mouseUp}
                    onPointerLeave={mouseUp}
                    onPointerMove={mouseMove}
                    onContextMenu={(e) => { e.preventDefault(); }}
                >
                </canvas>
                {
                    isToolTipOn && animation ?
                        (<div
                            className='content-canvas-info'
                            style={{
                                backgroundColor: animation.toolTipColor,
                                borderColor: animation.toolTipColor,
                                color: animation.toolTipTextColor
                            }}
                        >
                            {animation ?
                                animation.toolTipText.map((line, i) => (
                                    <div className='content-canvas-info-line'
                                        key={i}>
                                        {line}
                                    </div>
                                ))
                                : ''}
                        </div>)
                        :
                        null
                }

                <div
                    className='content-canvas-info-button'
                    style={{
                        borderColor: animation ? animation.toolTipColor : 'black',
                        color: animation ? animation.toolTipColor : 'black'
                    }}
                    onClick={toolTipClick}
                >
                    {isToolTipOn ? '!' : '?'}
                </div>
            </div>
        </div >
    );
}

export default Content;