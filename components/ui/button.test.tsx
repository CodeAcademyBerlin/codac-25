import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { render, screen } from '@/tests/utils/test-utils'

import { Button } from './button'

describe('Button Component', () => {
  it('should render button with default variant and size', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-9', 'px-4', 'py-2')
  })

  it('should render all button variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>)
      const button = screen.getByRole('button', { name: variant })

      expect(button).toBeInTheDocument()
      if (variant === 'default') {
        expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
      } else if (variant === 'destructive') {
        expect(button).toHaveClass('bg-destructive', 'text-white')
      } else if (variant === 'outline') {
        expect(button).toHaveClass('border', 'bg-background')
      }

      unmount()
    })
  })

  it('should render all button sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const

    sizes.forEach((size) => {
      const { unmount } = render(<Button size={size}>{size}</Button>)
      const button = screen.getByRole('button', { name: size })

      expect(button).toBeInTheDocument()
      if (size === 'default') {
        expect(button).toHaveClass('h-9')
      } else if (size === 'sm') {
        expect(button).toHaveClass('h-8')
      } else if (size === 'lg') {
        expect(button).toHaveClass('h-10')
      } else if (size === 'icon') {
        expect(button).toHaveClass('size-9')
      }

      unmount()
    })
  })

  it('should handle click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })

    await user.click(button)
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled button</Button>)
    const button = screen.getByRole('button', { name: 'Disabled button' })

    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    )

    const link = screen.getByRole('link', { name: 'Link button' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom button</Button>)
    const button = screen.getByRole('button', { name: 'Custom button' })

    expect(button).toHaveClass('custom-class')
  })

  it('should have proper accessibility attributes', () => {
    render(<Button aria-label="Accessible button">Button</Button>)
    const button = screen.getByRole('button', { name: 'Accessible button' })

    expect(button).toHaveAttribute('data-slot', 'button')
  })
})