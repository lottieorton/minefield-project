import Header from '../components/Header.js';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('Header component', () => {
    /*jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        Outlet: () => <div data-testid="mocked-outlet">Mocked Outlet</div>
    }));*/
    
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

    it('renders child content inside the Outlet', () => {
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
    });
});