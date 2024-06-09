import { useState } from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';

import Main from './animate-js/class/main_menu/main.jsx'
import Content from './animate-js/class/content_page/content.jsx';

function App() {
  const [deg, setDeg] = useState(0);

  function updateDeg(newDeg) {
    setDeg(newDeg);
  }

  return (
    <HashRouter>
      <Routes>
        <Route path='/' element={<Main deg={deg} setDeg={updateDeg} />} />
        <Route path='/Content/:id' element={<Content />} />
      </Routes>
    </HashRouter >
  );
}

export default App;
