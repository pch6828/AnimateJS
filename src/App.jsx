import { useState } from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Main from './animate-js/class/main_menu/main.jsx'
import Content from './animate-js/class/content_page/content.jsx';

function App() {
  const [deg, setDeg] = useState(0);

  function updateDeg(newDeg) {
    setDeg(newDeg);
  }

  return (
    <HashRouter>
      <TransitionGroup className="transitions-wrapper">
        <CSSTransition
          classNames={"right"}
          timeout={300}
        >
          <Routes>
            <Route path='/' element={<Main deg={deg} setDeg={updateDeg} />} />
            <Route path='/Content/:id' element={<Content />} />
          </Routes>
        </CSSTransition>
      </TransitionGroup >
    </HashRouter>
  );
}

export default App;
