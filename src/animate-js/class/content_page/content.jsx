import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import '../../style/content.css';

import items from './content_item';
import { CompactScreenCriteria } from '../constants';

function Content({ aspectRatio }) {
    const canvasRef = useRef(null);
    const interactionRef = useRef({
        isDown: false,
        mousePoint: { x: 0, y: 0 },
        mouseButton: null,
    });
    const { id } = useParams();
    const [isToolTipOn, setIsToolTipOn] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const isCompactScreen = aspectRatio < CompactScreenCriteria;
    const articleCode = id ? id.toUpperCase() : '?';
    const animation = items.get(articleCode);
    const articleNumber = id ? String(articleCode.charCodeAt(0) - 64).padStart(2, '0') : '--';
    const title = animation ? animation.title : 'Pending Column';
    const bodyLines = animation && animation.text.length
        ? animation.text
        : ['This entry is being prepared.'];
    const toolTipLines = animation ? animation.toolTipText : [];
    const canvasBackground = animation ? animation.backgroundColor : '#f4ead7';

    useEffect(() => {
        return () => {
            animation?.clean?.();
        };
    }, [animation]);

    useEffect(() => {
        if (!isCompactScreen) {
            setIsDescriptionOpen(false);
        }
    }, [isCompactScreen]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !animation) {
            return undefined;
        }

        const context = canvas.getContext('2d');

        function resizeCanvas() {
            const pixelRatio = window.devicePixelRatio || 1;

            if (aspectRatio < CompactScreenCriteria) {
                canvas.width = pixelRatio * window.innerWidth;
                canvas.height = pixelRatio * window.innerHeight * 0.56;
            } else {
                canvas.width = pixelRatio * window.innerWidth * 0.72;
                canvas.height = pixelRatio * window.innerHeight;
            }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        canvas.style.backgroundColor = canvasBackground;
        context.strokeStyle = '#1f1a14';
        context.lineWidth = 2.5;

        let requestId;

        const draw = () => {
            requestId = window.requestAnimationFrame(draw);
            context.clearRect(0, 0, canvas.width, canvas.height);
            animation.animate(
                context,
                canvas.width,
                canvas.height,
                interactionRef.current,
            );
        };

        draw();

        return () => {
            window.cancelAnimationFrame(requestId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [animation, aspectRatio, canvasBackground]);

    function updatePointerState(nativeEvent, isDown) {
        const pixelRatio = window.devicePixelRatio || 1;
        const { button, offsetX, offsetY } = nativeEvent;

        interactionRef.current = {
            isDown,
            mouseButton: isDown ? (button === 2 ? 'right' : 'left') : null,
            mousePoint: {
                x: pixelRatio * offsetX,
                y: pixelRatio * offsetY,
            },
        };
    }

    function pointerDown(event) {
        updatePointerState(event.nativeEvent, true);
        event.currentTarget.setPointerCapture(event.pointerId);
    }

    function pointerUp(event) {
        updatePointerState(event.nativeEvent, false);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }

    function pointerMove({ nativeEvent }) {
        const pixelRatio = window.devicePixelRatio || 1;
        interactionRef.current = {
            ...interactionRef.current,
            mousePoint: {
                x: pixelRatio * nativeEvent.offsetX,
                y: pixelRatio * nativeEvent.offsetY,
            },
        };
    }

    return (
        <div className='content-page'>
            <div className='content-layout'>
                <aside className={'content-description' + (isCompactScreen ? ' is-compact' : '') + (isDescriptionOpen ? ' is-open' : '')}>
                    {!isCompactScreen ? (
                        <Link className='content-close' to={'/'}>
                            Back to Index
                        </Link>
                    ) : null}

                    <div className='content-meta'>Letter {articleCode} / No. {articleNumber}</div>
                    <div className='content-alphabet'>{articleCode + articleCode.toLowerCase()}</div>
                    <h1 className='content-title'>{title}</h1>

                    <div className='content-text'>
                        {bodyLines.map((line, index) => (
                            <p className='content-text-line' key={index}>
                                {line}
                            </p>
                        ))}
                    </div>

                    {toolTipLines.length ? (
                        <button
                            className='content-note-toggle'
                            onClick={() => { setIsToolTipOn(!isToolTipOn); }}
                            type='button'
                        >
                            {isToolTipOn ? 'Hide Interaction Note' : 'Show Interaction Note'}
                        </button>
                    ) : null}

                    {isToolTipOn && toolTipLines.length ? (
                        <div className='content-note'>
                            {toolTipLines.map((line, index) => (
                                <p className='content-note-line' key={index}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    ) : null}
                </aside>
                <section
                    className='content-canvas-wrapper'
                    style={{ '--content-canvas-paper': canvasBackground }}
                >
                    {isCompactScreen ? (
                        <div className='content-canvas-controls'>
                            <Link className='content-canvas-close' to={'/'}>
                                Back to Index
                            </Link>
                            <button
                                className='content-panel-toggle'
                                onClick={() => { setIsDescriptionOpen(!isDescriptionOpen); }}
                                type='button'
                            >
                                {isDescriptionOpen ? 'Hide Description' : 'Show Description'}
                            </button>
                        </div>
                    ) : null}
                    <canvas
                        className='content-canvas'
                        ref={canvasRef}
                        onPointerDown={pointerDown}
                        onPointerUp={pointerUp}
                        onPointerLeave={pointerUp}
                        onPointerMove={pointerMove}
                        onContextMenu={(event) => { event.preventDefault(); }}
                    />
                </section>
            </div>
        </div>
    );
}

export default Content;
