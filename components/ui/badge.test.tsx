import { describe, it, expect } from 'vitest'

import { render, screen } from '@/tests/utils/test-utils'

import { Badge } from './badge'

describe('Badge Component', () => {
  it('should render badge with default props', () => {
    render(<Badge>Default badge</Badge>)
    const badge = screen.getByText('Default badge')
    
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge.tagName).toBe('SPAN')
  })

  it('should render with default variant styling', () => {
    render(<Badge>Default badge</Badge>)
    const badge = screen.getByText('Default badge')
    
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground', 'border-transparent')
  })

  it('should render with secondary variant', () => {
    render(<Badge variant="secondary">Secondary badge</Badge>)
    const badge = screen.getByText('Secondary badge')
    
    expect(badge).toHaveClass('bg-secondary', 'text-secondary-foreground', 'border-transparent')
  })

  it('should render with destructive variant', () => {
    render(<Badge variant="destructive">Destructive badge</Badge>)
    const badge = screen.getByText('Destructive badge')
    
    expect(badge).toHaveClass('bg-destructive', 'text-white', 'border-transparent')
  })

  it('should render with outline variant', () => {
    render(<Badge variant="outline">Outline badge</Badge>)
    const badge = screen.getByText('Outline badge')
    
    expect(badge).toHaveClass('text-foreground')
    expect(badge).not.toHaveClass('border-transparent')
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-badge-class">Custom badge</Badge>)
    const badge = screen.getByText('Custom badge')
    
    expect(badge).toHaveClass('custom-badge-class')
  })

  it('should handle all variant types', () => {
    const variants = ['default', 'secondary', 'destructive', 'outline'] as const

    variants.forEach(variant => {
      const { unmount } = render(
        <Badge variant={variant} data-testid={`badge-${variant}`}>
          {variant} badge
        </Badge>
      )
      
      const badge = screen.getByTestId(`badge-${variant}`)
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent(`${variant} badge`)
      
      unmount()
    })
  })

  it('should apply base styling classes', () => {
    render(<Badge>Styled badge</Badge>)
    const badge = screen.getByText('Styled badge')
    
    expect(badge).toHaveClass(
      'inline-flex', 'items-center', 'justify-center', 'rounded', 
      'border', 'px-2', 'py-0.5', 'text-xs', 'font-medium', 
      'w-fit', 'whitespace-nowrap', 'shrink-0'
    )
  })

  it('should handle icon styling', () => {
    render(
      <Badge>
        <svg data-testid="badge-icon" />
        Badge with icon
      </Badge>
    )
    
    const badge = screen.getByText('Badge with icon')
    const icon = screen.getByTestId('badge-icon')
    
    expect(badge).toContainElement(icon)
    expect(badge).toHaveClass('[&>svg]:size-3', 'gap-1', '[&>svg]:pointer-events-none')
  })

  it('should handle additional props', () => {
    render(<Badge id="test-badge" data-custom="value">Badge with props</Badge>)
    const badge = screen.getByText('Badge with props')
    
    expect(badge).toHaveAttribute('id', 'test-badge')
    expect(badge).toHaveAttribute('data-custom', 'value')
  })

  it('should handle focus-visible styling', () => {
    render(<Badge>Focusable badge</Badge>)
    const badge = screen.getByText('Focusable badge')
    
    expect(badge).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50', 'focus-visible:ring-[3px]')
  })

  it('should handle invalid state styling', () => {
    render(<Badge aria-invalid="true">Invalid badge</Badge>)
    const badge = screen.getByText('Invalid badge')
    
    expect(badge).toHaveClass('aria-invalid:ring-destructive/20', 'aria-invalid:border-destructive')
  })

  it('should handle transition styling', () => {
    render(<Badge>Animated badge</Badge>)
    const badge = screen.getByText('Animated badge')
    
    expect(badge).toHaveClass('transition-[color,box-shadow]')
  })

  it('should handle overflow styling', () => {
    render(<Badge>Overflow badge</Badge>)
    const badge = screen.getByText('Overflow badge')
    
    expect(badge).toHaveClass('overflow-hidden')
  })

  describe('asChild prop', () => {
    it('should render as span by default', () => {
      render(<Badge>Default span</Badge>)
      const badge = screen.getByText('Default span')
      
      expect(badge.tagName).toBe('SPAN')
    })

    it('should render as child element when asChild is true', () => {
      render(
        <Badge asChild>
          <div data-testid="custom-element">Custom element</div>
        </Badge>
      )
      const customElement = screen.getByTestId('custom-element')
      
      expect(customElement).toBeInTheDocument()
      expect(customElement.tagName).toBe('DIV')
      expect(customElement).toHaveAttribute('data-slot', 'badge')
    })

    it('should apply styling to child element when asChild is true', () => {
      render(
        <Badge asChild variant="destructive">
          <button data-testid="badge-button">Button badge</button>
        </Badge>
      )
      const button = screen.getByTestId('badge-button')
      
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveClass('bg-destructive', 'text-white')
    })
  })

  describe('Interactive badges', () => {
    it('should handle click events on interactive badges', () => {
      render(
        <Badge asChild>
          <button onClick={() => {}}>Clickable badge</button>
        </Badge>
      )
      const button = screen.getByRole('button', { name: 'Clickable badge' })
      
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('inline-flex', 'items-center')
    })

    it('should handle link badges', () => {
      render(
        <Badge asChild>
          <a href="/test">Link badge</a>
        </Badge>
      )
      const link = screen.getByRole('link', { name: 'Link badge' })
      
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should apply hover styles for interactive elements', () => {
      render(
        <Badge asChild variant="secondary">
          <a href="/test">Hoverable badge</a>
        </Badge>
      )
      const link = screen.getByRole('link')
      
      expect(link).toHaveClass('[a&]:hover:bg-secondary/90')
    })
  })

  describe('Content variations', () => {
    it('should handle empty content', () => {
      render(<Badge data-testid="empty-badge"></Badge>)
      const badge = screen.getByTestId('empty-badge')
      
      expect(badge).toBeInTheDocument()
      expect(badge).toBeEmptyDOMElement()
    })

    it('should handle numeric content', () => {
      render(<Badge>{42}</Badge>)
      const badge = screen.getByText('42')
      
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('42')
    })

    it('should handle complex content with multiple elements', () => {
      render(
        <Badge data-testid="complex-badge">
          <span>Count:</span>
          <strong>5</strong>
        </Badge>
      )
      const badge = screen.getByTestId('complex-badge')
      
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveTextContent('Count:5')
      expect(badge.querySelector('strong')).toHaveTextContent('5')
    })
  })
})