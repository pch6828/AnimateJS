import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import '../../style/transition.css'

import Main from '../main_menu/main.jsx'
import Content from '../content_page/content.jsx';

function TransitionWrapper() {
    const [deg, setDeg] = useState(0);

    const location = useLocation();

    function updateDeg(newDeg) {
        setDeg(newDeg);
    }

    return (
        <TransitionGroup>
            <CSSTransition
                key={location.pathname}
                timeout={10000}
                className="page-transition"
            >
                <Routes location={location}>
                    <Route path='/' element={<Main deg={deg} setDeg={updateDeg} />} />
                    <Route path='/Content/:id' element={<Content />} />
                </Routes>
            </CSSTransition>
        </TransitionGroup>
    );
}

export default TransitionWrapper;