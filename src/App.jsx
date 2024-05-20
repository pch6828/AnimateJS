import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Main from './animate-js/class/main_menu/main.jsx'
import Content from './animate-js/class/content_page/content.jsx';

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
            <Route path='/AnimateJS/Content/:id' Component={Content} />
          </Routes>
        </CSSTransition>
      </TransitionGroup >
    </BrowserRouter>
  );
}

export default App;
