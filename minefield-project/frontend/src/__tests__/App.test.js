import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, createMemoryRouter } from 'react-router-dom';
import App from '../App.js'

jest.mock('../components/Header.js', () => {
    const { Outlet } = require('react-router-dom');
    const HeaderComponent = () => {
      return <div data-testid="mockHeaderComponent">
          Mock Header Component
          <Outlet />
      </div>
    };
    return {
      __esModule: true,
      default: HeaderComponent,
      Header: HeaderComponent
    };
});
jest.mock('../components/Nav.js', () => ({
  __esModule: true,
  //Handles import Nav from  
  default: () => <div data-testid="mockNavComponent">Mock Nav Component</div>,
  //handles import { Nav } from
  Nav: () => <div data-testid="mockNavComponent">Mock Nav Component</div>
}));
jest.mock('../components/GameSelection.js', () => ({
  __esModule: true,  
  default: () => <div data-testid="mockGameSelectionComponent">Mock GameSelection Component</div>,
  GameSelection: () => <div data-testid="mockGameSelectionComponent">Mock GameSelection Component</div>
}));

describe('App component routing', () => {
  it('renders the Header and Nav component on the root path "/" ', async () => {
    //arrange
    const MockHeader = require('../components/Header.js').Header;
    const MockNav = require('../components/Nav.js').Nav;
    const MockGameSelection = require('../components/GameSelection.js').GameSelection;
    //create a router for this test
    const testRouter = createMemoryRouter(createRoutesFromElements([
      <Route path = '/' element = { <MockHeader /> } >
        <Route index element = { <MockNav /> } />
        <Route path = 'game' element = { <MockGameSelection /> } />
      </Route>
    ]), { initialEntries: ['/'] }); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId('mockHeaderComponent');
      const navComponent = screen.getByTestId('mockNavComponent');
      expect(headerComponent).toBeInTheDocument();
      expect(navComponent).toBeInTheDocument();
    })
    expect(screen.queryByTestId('mockGameSelectionComponent')).not.toBeInTheDocument();
  });

  it('renders the Header and GameSelection component on the path "/game" ', async () => {
    //arrange
    const MockHeader = require('../components/Header.js').Header;
    const MockNav = require('../components/Nav.js').Nav;
    const MockGameSelection = require('../components/GameSelection.js').GameSelection;
    //create a router for this test
    const testRouter = createMemoryRouter(createRoutesFromElements([
      <Route path = '/' element = { <MockHeader /> } >
        <Route index element = { <MockNav /> } />
        <Route path = 'game' element = { <MockGameSelection /> } />
      </Route>
    ]), { initialEntries: ['/game'] }); //sets the initial URL for this test
    //action
    render(<RouterProvider router={testRouter} />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId('mockHeaderComponent');
      const gameSelectionComponent = screen.getByTestId('mockGameSelectionComponent');
      expect(headerComponent).toBeInTheDocument();
      expect(gameSelectionComponent).toBeInTheDocument();
    })
    expect(screen.queryByTestId('mockNavComponent')).not.toBeInTheDocument();
  });

  it('renders the RouterProvider element', async () => {
    //arrange
    //action
    render(<App />);
    //assert
    await waitFor(() => {
      const headerComponent = screen.getByTestId('mockHeaderComponent');
      const navComponent = screen.getByTestId('mockNavComponent');
      expect(headerComponent).toBeInTheDocument();
      expect(navComponent).toBeInTheDocument();
      expect(screen.queryByTestId('mockGameSelectionComponent')).not.toBeInTheDocument();
    })
  })
});

describe('API_BASE_URL logic', () => {
  const actualNodeEnv = process.env.NODE_ENV;
  beforeEach(() => {
    jest.resetModules(); //to clear cache
  });

  afterAll(() => {
    process.env.NODE_ENV = actualNodeEnv; // restore original env var
  })

  it('should return the production URL when NODE_ENV = "production" ', () => {
    //arrange
    process.env.NODE_ENV = 'production';
    const { API_BASE_URL } = require('../App.js');
    //assert
    expect(API_BASE_URL).toBe('https://ecommerceapi-4-0b65.onrender.com'); //TO BE UPDATED WITH CORRECT URLs WHEN UPLOADED TO RENDER
  });

  it('should return the localhost URL when NODE_ENV is not production', () => {
    //arrage
    process.env.NODE_ENV = 'development';
    const { API_BASE_URL } = require('../App.js');
    //assert
    expect(API_BASE_URL).toBe('http://localhost:4001'); //TO BE UPDATED WITH CORRECT URLs WHEN UPLOADED TO RENDER
  });
})