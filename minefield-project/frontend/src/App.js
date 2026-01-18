import './App.css';

import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Header from './components/Header.js';
import Nav from './components/Nav.js';
import GameSelection from './components/GameSelection.js';

console.log(`Env variable ${process.env.NODE_ENV}`);
console.log(`Env variable render ${process.env.RENDER}`);

//will need to update with httpS
//to be updated with the correct URL when uploaded to Render
export const API_BASE_URL = 
    process.env.NODE_ENV === 'production' 
        ? 'https://ecommerceapi-4-0b65.onrender.com'
        : 'http://localhost:4001';

const router = createBrowserRouter(createRoutesFromElements(
  <Route path = '/' element = { <Header /> } >
    <Route index element = { <Nav /> } />
    <Route path = 'game' element = { <GameSelection /> } />
  </Route>
));

function App() {
  return (
    <RouterProvider router={ router } />
    /*<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>*/
  );
}

export default App;
