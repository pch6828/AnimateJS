import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import '../../style/transition.css'

import Main from '../main_menu/main.jsx'
import Content from '../content_page/content.jsx';

function TransitionWrapper() {
    const [deg, setDeg] = useState(0);

    function updateDeg(newDeg) {
        setDeg(newDeg);
    }

    return (
        <Routes>
            <Route path='/' element={<Main deg={deg} setDeg={updateDeg} />} />
            <Route path='/Content/:id' element={<Content />} />
        </Routes>
    );
}

export default TransitionWrapper;