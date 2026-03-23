import { useState } from 'react';
import { Link } from 'react-router-dom';
import items from './wheel_button_item.jsx';
import WheelSlot from './wheel_button.jsx';

import '../../style/main.css'
import { VerticalScreenCriteria } from '../constants.jsx';

function Main({ deg, setDeg, aspectRatio }) {
    const [pos, setPos] = useState(0);
    const [isDrag, setIsDrag] = useState(false);
    const angleStep = 360 / 26;
    const dialConfig = aspectRatio < VerticalScreenCriteria
        ? { radius: 66.666, radiusCss: '66.666vh', slotOrbitRatio: 0.81 }
        : { radius: 150, radiusCss: '150vh', slotOrbitRatio: 0.81 };
    const slotOrbitRadius = dialConfig.radius * dialConfig.slotOrbitRatio;
    const startOffset = aspectRatio < VerticalScreenCriteria ? 90 : 0;
    const selectedIndex = ((Math.round((-25 - deg + startOffset) / angleStep) % 26) + 26) % 26;
    const selectedItem = items[selectedIndex];
    const hasSelectedDetail = Boolean(selectedItem?.hasDetailPage);

    function formatIssueDate(date) {
        if (!date) {
            return 'Publication date pending';
        }

        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    function rotateWheelStart(e) {
        if (aspectRatio < VerticalScreenCriteria) {
            const { clientX } = e;
            setPos(clientX);
        } else {
            const { clientY } = e;
            setPos(clientY);
        }
        setIsDrag(true);
    }

    function rotateWheel(e) {
        if (aspectRatio < VerticalScreenCriteria) {
            const { clientX } = e;
            if (isDrag) {
                const delta = ((pos - clientX) % 360);
                setDeg((deg - delta) % 360);
                setPos(clientX);
            }
        } else {
            const { clientY } = e;
            if (isDrag) {
                const delta = ((pos - clientY) % 360);
                setDeg((deg - delta) % 360);
                setPos(clientY);
            }
        }

    }
    function rotateWheelEnd(e) {
        if (aspectRatio < VerticalScreenCriteria) {
            const { clientX } = e;
            setPos(clientX);
        } else {
            const { clientY } = e;
            setPos(clientY);
        }

        const rounded_deg = Math.round(deg / (360 / 26)) * (360 / 26);
        setDeg(rounded_deg);
        setIsDrag(false);
    }

    return (
        <div className="main-page">
            <div className="main-shell">
                <section
                    className="main-stage"
                    style={{ '--dial-radius': dialConfig.radiusCss }}
                    onPointerDown={rotateWheelStart}
                    onPointerMove={rotateWheel}
                    onPointerLeave={rotateWheelEnd}
                    onPointerUp={rotateWheelEnd}
                    onGotPointerCapture={() => { setIsDrag(true); }}
                    onLostPointerCapture={() => { setIsDrag(false); }}
                >
                    <div className="stage-hint" aria-hidden="true">
                        <span className="stage-hint-arrow">↺</span>
                        <span className="stage-hint-text">Rotate to select content</span>
                    </div>

                    {hasSelectedDetail ? (
                        <Link
                            className="stage-summary stage-summary-link"
                            aria-label={'Open ' + (selectedItem.title || selectedItem.key)}
                            to={'/Content/' + selectedItem.key}
                        >
                            <p className="stage-site-title">26 Animated TMI</p>
                            <div className="stage-copy">
                                <strong>{selectedItem.title || 'Reserved for a future column'}</strong>
                                <span>{formatIssueDate(selectedItem.date)}</span>
                            </div>
                        </Link>
                    ) : (
                        <div className="stage-summary" aria-label="Current selection">
                            <p className="stage-site-title">26 Animated TMI</p>
                        </div>
                    )}

                    <div
                        className="wheel-menu"
                        style={{
                            transform: 'rotate(' + deg + 'deg)',
                        }}
                    >
                        <div className="main-title" />
                        {items.map((item, i) => (
                            <WheelSlot
                                key={i}
                                x={slotOrbitRadius * Math.cos(2 * Math.PI / 26 * i - (aspectRatio < VerticalScreenCriteria ? Math.PI / 2 : 0))}
                                y={slotOrbitRadius * Math.sin(2 * Math.PI / 26 * i - (aspectRatio < VerticalScreenCriteria ? Math.PI / 2 : 0))}
                                deg={-deg}
                                aspectRatio={aspectRatio}
                                alphabet={item.key}
                                hasDetailPage={item.hasDetailPage}
                                selected={selectedIndex === i && item.hasDetailPage}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Main;
