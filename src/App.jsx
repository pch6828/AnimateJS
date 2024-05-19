import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Main from './animate-js/class/main.jsx'
import A_ from './animate-js/class/A_.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/AnimateJS' Component={Main} />
        <Route exact path='/' Component={Main} />
        <Route exact path='/AnimateJS/A_' Component={A_} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
