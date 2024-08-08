import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import '../../style/transition.css'

import Main from '../main_menu/main.jsx'
import Content from '../content_page/content.jsx';

function TransitionWrapper() {
    const [deg, setDeg] = useState(0);
    const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight);

    const location = useLocation();

    useEffect(() => {
        function onResize() {
            setAspectRatio(window.innerWidth / window.innerHeight);
        }

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        const pathname = location.pathname;
        if (pathname === '/') {
            document.title = 'AnimateJS';
        } else {
            const id = pathname.substring(9);
            document.title = 'AnimateJS | ' + id;
        }
    }, [location]);

    function updateDeg(newDeg) {
        setDeg(newDeg);
    }

    return (
        <TransitionGroup>
            <CSSTransition
                key={location.pathname}
                timeout={1000}
                className="page-transition"
            >
                <Routes location={location}>
                    <Route path='/' element={<Main deg={deg} setDeg={updateDeg} aspectRatio={aspectRatio} />} />
                    <Route path='/Content/:id' element={<Content aspectRatio={aspectRatio} />} />
                </Routes>
            </CSSTransition>
        </TransitionGroup>
    );
}

export default TransitionWrapper;