import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Main from './animate-js/class/main_menu/main.jsx'
import A_ from './animate-js/class/A_.jsx'

function App() {
  return (
    <BrowserRouter>
      <TransitionGroup className="transitions-wrapper">
        <CSSTransition
          classNames={"right"}
          timeout={300}
        >
          <Routes>
            <Route exact path='/' Component={Main} />
            <Route exact path='/AnimateJS' Component={Main} />
            <Route exact path='/AnimateJS/A_' Component={A_} />
          </Routes>
        </CSSTransition>
      </TransitionGroup >
    </BrowserRouter>
  );
}

export default App;
