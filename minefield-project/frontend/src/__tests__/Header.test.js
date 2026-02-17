import Header from '../components/Header.js';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../components/Nav.js', () => { 
    return function MockNav() { 
        return <div data-testid="mock-nav">Mock Nav Component</div>; 
    }; 
});

describe('Header component', () => {
    it('check main header is rendered', () => {
        //action
        render(<Header />);
        //assert
        expect(screen.getByText(`Welcome to Lottie's Minefield App`)).toBeInTheDocument();
    });

    /*it('should render outlet', () => {
        //action
        render(<Header />);
        //assert
        expect(screen.getByText(`Mocked Outlet`)).toBeInTheDocument();
    });*/

    it('renders Nav and child content inside the Outlet', () => {
        //arrange
        const TestChild = () => <div>Child Content</div>;
        //action
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path = '/' element = { <Header /> } >
                        <Route index element = { <TestChild /> } />
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        //assert
        expect(screen.getByText(/Child Content/i)).toBeInTheDocument();
        expect(screen.getByTestId("mock-nav")).toBeInTheDocument();
    });
});