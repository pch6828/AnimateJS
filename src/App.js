import { BrowserRouter, Routes, Route } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Main from './animate-js/main/main.jsx'
import A_ from './animate-js/content/A_.jsx'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' Component={Main} />
        <Route exact path='/A_' Component={A_} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
