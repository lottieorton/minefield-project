import Filter from "../components/Filter.js";
import { fireEvent, render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';

describe('Filter component', () => {
    const mockHandleChange = jest.fn();

    it('renders a drop down with all the values', () => {
        //arrange
        render(<Filter handleChange={mockHandleChange} />);
        //assert
        //screen.debug();
        const filter = screen.getByLabelText(/choose your difficulty/i);
        expect(filter).toHaveTextContent(/easy/i);
        expect(filter).toHaveTextContent(/medium/i);
        expect(filter).toHaveTextContent(/hard/i);
        expect(filter.value).toBe('easy');
    });

    it('calls handleChange when dropdown value changed', () => {
        //arrange
        render(<Filter onValueChange={mockHandleChange} />);
        //action
        const filter = screen.getByLabelText(/choose your difficulty/i);
        fireEvent.change(filter, { target: {value: 'hard'}});
        //assert
        screen.debug();
        expect(mockHandleChange).toHaveBeenCalledWith('hard');
        expect(filter.value).toBe('hard')
    })
})