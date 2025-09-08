import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import { render, screen } from '@/tests/utils/test-utils'

import { Input } from './input'

describe('Input Component', () => {
  it('should render input with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-slot', 'input')
  })

  it('should accept and display placeholder text', () => {
    render(<Input placeholder="Enter your name" />)
    const input = screen.getByPlaceholderText('Enter your name')
    
    expect(input).toBeInTheDocument()
  })

  it('should handle different input types', () => {
    const types = ['text', 'email', 'password', 'number', 'tel', 'url'] as const

    types.forEach(type => {
      const { unmount } = render(<Input type={type} data-testid={`input-${type}`} />)
      const input = screen.getByTestId(`input-${type}`)
      
      expect(input).toHaveAttribute('type', type)
      unmount()
    })
  })

  it('should handle user input correctly', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    const input = screen.getByPlaceholderText('Type here')

    await user.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
  })

  it('should handle controlled input with value prop', () => {
    render(<Input value="Controlled value" readOnly />)
    const input = screen.getByDisplayValue('Controlled value')
    
    expect(input).toHaveValue('Controlled value')
  })

  it('should handle onChange events', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'test')
    expect(handleChange).toHaveBeenCalledTimes(4) // Once per character
  })

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    const input = screen.getByRole('textbox')

    await user.click(input)
    expect(handleFocus).toHaveBeenCalledOnce()

    await user.tab()
    expect(handleBlur).toHaveBeenCalledOnce()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('should apply custom className', () => {
    render(<Input className="custom-input-class" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('custom-input-class')
  })

  it('should have proper accessibility attributes', () => {
    render(<Input aria-label="User name" aria-describedby="name-help" />)
    const input = screen.getByLabelText('User name')
    
    expect(input).toHaveAttribute('aria-describedby', 'name-help')
  })

  it('should handle required attribute', () => {
    render(<Input required aria-label="Required field" />)
    const input = screen.getByLabelText('Required field')
    
    expect(input).toBeRequired()
  })

  it('should handle readonly attribute', () => {
    render(<Input readOnly value="Read only value" />)
    const input = screen.getByDisplayValue('Read only value')
    
    expect(input).toHaveAttribute('readonly')
  })

  it('should handle min and max attributes for number inputs', () => {
    render(<Input type="number" min="0" max="100" />)
    const input = screen.getByRole('spinbutton')
    
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('max', '100')
  })

  it('should handle maxLength attribute', () => {
    render(<Input maxLength={50} />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('maxlength', '50')
  })

  it('should handle autoComplete attribute', () => {
    render(<Input autoComplete="email" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('should handle autoFocus attribute', () => {
    render(<Input autoFocus />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveFocus()
  })

  it('should handle name attribute for forms', () => {
    render(<Input name="username" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveAttribute('name', 'username')
  })

  it('should handle file input type', () => {
    render(<Input type="file" data-testid="file-input" />)
    const input = screen.getByTestId('file-input')
    
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toBeInTheDocument()
  })

  it('should handle date input type', () => {
    render(<Input type="date" data-testid="date-input" />)
    const input = screen.getByTestId('date-input')
    
    expect(input).toHaveAttribute('type', 'date')
    expect(input).toBeInTheDocument()
  })

  it('should apply default styling classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    // Check for key styling classes
    expect(input).toHaveClass('flex', 'h-9', 'w-full', 'rounded', 'border')
    expect(input).toHaveClass('px-3', 'py-1', 'text-base', 'md:text-sm')
  })

  it('should handle focus-visible styling', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50')
  })

  it('should handle invalid state styling', () => {
    render(<Input aria-invalid="true" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
  })

  it('should forward ref correctly', () => {
    let inputRef: HTMLInputElement | null = null
    
    render(<Input ref={(el) => { inputRef = el }} />)
    
    expect(inputRef).toBeInstanceOf(HTMLInputElement)
  })
})