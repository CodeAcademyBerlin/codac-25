import { describe, it, expect } from 'vitest'

import { render, screen } from '@/tests/utils/test-utils'

import { Alert, AlertTitle, AlertDescription } from './alert'

describe('Alert Components', () => {
  describe('Alert', () => {
    it('should render alert with default variant', () => {
      render(<Alert>Alert content</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveAttribute('data-slot', 'alert')
      expect(alert).toHaveTextContent('Alert content')
    })

    it('should render with default variant styling', () => {
      render(<Alert>Default alert</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toHaveClass('bg-card', 'text-card-foreground')
    })

    it('should render with destructive variant', () => {
      render(<Alert variant="destructive">Destructive alert</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toHaveClass('text-destructive', 'bg-card')
    })

    it('should apply custom className', () => {
      render(<Alert className="custom-alert-class">Custom alert</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toHaveClass('custom-alert-class')
    })

    it('should render with icon when provided', () => {
      render(
        <Alert>
          <svg data-testid="alert-icon" />
          Alert with icon
        </Alert>
      )
      
      const alert = screen.getByRole('alert')
      const icon = screen.getByTestId('alert-icon')
      
      expect(alert).toContainElement(icon)
      expect(alert).toHaveClass('has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr]')
    })

    it('should handle all variant types', () => {
      const variants = ['default', 'destructive'] as const

      variants.forEach(variant => {
        const { unmount } = render(
          <Alert variant={variant} data-testid={`alert-${variant}`}>
            {variant} alert
          </Alert>
        )
        
        const alert = screen.getByTestId(`alert-${variant}`)
        expect(alert).toBeInTheDocument()
        expect(alert).toHaveRole('alert')
        
        unmount()
      })
    })

    it('should apply base styling classes', () => {
      render(<Alert>Styled alert</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toHaveClass(
        'relative', 'w-full', 'rounded-lg', 'border', 
        'px-4', 'py-3', 'text-sm', 'grid'
      )
    })

    it('should handle additional props', () => {
      render(<Alert id="test-alert" data-custom="value">Alert with props</Alert>)
      const alert = screen.getByRole('alert')
      
      expect(alert).toHaveAttribute('id', 'test-alert')
      expect(alert).toHaveAttribute('data-custom', 'value')
    })
  })

  describe('AlertTitle', () => {
    it('should render alert title', () => {
      render(<AlertTitle>Alert Title</AlertTitle>)
      const title = screen.getByText('Alert Title')
      
      expect(title).toBeInTheDocument()
      expect(title).toHaveAttribute('data-slot', 'alert-title')
    })

    it('should apply title styling classes', () => {
      render(<AlertTitle>Styled Title</AlertTitle>)
      const title = screen.getByText('Styled Title')
      
      expect(title).toHaveClass(
        'col-start-2', 'line-clamp-1', 'min-h-4', 
        'font-medium', 'tracking-tight'
      )
    })

    it('should apply custom className', () => {
      render(<AlertTitle className="custom-title-class">Custom Title</AlertTitle>)
      const title = screen.getByText('Custom Title')
      
      expect(title).toHaveClass('custom-title-class')
    })

    it('should render as div element', () => {
      render(<AlertTitle>Title Element</AlertTitle>)
      const title = screen.getByText('Title Element')
      
      expect(title.tagName).toBe('DIV')
    })
  })

  describe('AlertDescription', () => {
    it('should render alert description', () => {
      render(<AlertDescription>Alert Description</AlertDescription>)
      const description = screen.getByText('Alert Description')
      
      expect(description).toBeInTheDocument()
      expect(description).toHaveAttribute('data-slot', 'alert-description')
    })

    it('should apply description styling classes', () => {
      render(<AlertDescription>Styled Description</AlertDescription>)
      const description = screen.getByText('Styled Description')
      
      expect(description).toHaveClass(
        'text-muted-foreground', 'col-start-2', 'grid', 
        'justify-items-start', 'gap-1', 'text-sm'
      )
    })

    it('should apply custom className', () => {
      render(<AlertDescription className="custom-desc-class">Custom Description</AlertDescription>)
      const description = screen.getByText('Custom Description')
      
      expect(description).toHaveClass('custom-desc-class')
    })

    it('should render as div element', () => {
      render(<AlertDescription>Description Element</AlertDescription>)
      const description = screen.getByText('Description Element')
      
      expect(description.tagName).toBe('DIV')
    })

    it('should handle paragraph content styling', () => {
      render(
        <AlertDescription>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        </AlertDescription>
      )
      const description = screen.getByText('First paragraph').closest('div')
      
      expect(description).toHaveClass('[&_p]:leading-relaxed')
    })
  })

  describe('Complete Alert Structure', () => {
    it('should render complete alert with all components', () => {
      render(
        <Alert variant="destructive">
          <svg data-testid="warning-icon" />
          <AlertTitle>Error Occurred</AlertTitle>
          <AlertDescription>
            Something went wrong while processing your request.
          </AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      const icon = screen.getByTestId('warning-icon')
      const title = screen.getByText('Error Occurred')
      const description = screen.getByText(/Something went wrong/)

      expect(alert).toContainElement(icon)
      expect(alert).toContainElement(title)
      expect(alert).toContainElement(description)
      expect(alert).toHaveClass('text-destructive')
    })

    it('should handle alert without icon', () => {
      render(
        <Alert>
          <AlertTitle>No Icon Alert</AlertTitle>
          <AlertDescription>This alert has no icon</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      const title = screen.getByText('No Icon Alert')
      const description = screen.getByText('This alert has no icon')

      expect(alert).toContainElement(title)
      expect(alert).toContainElement(description)
      expect(alert).toHaveClass('grid-cols-[0_1fr]') // Grid layout without icon
    })

    it('should handle alert with only title', () => {
      render(
        <Alert>
          <AlertTitle>Title Only</AlertTitle>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      const title = screen.getByText('Title Only')

      expect(alert).toContainElement(title)
      expect(alert).not.toHaveTextContent('description')
    })

    it('should handle alert with only description', () => {
      render(
        <Alert>
          <AlertDescription>Description only alert</AlertDescription>
        </Alert>
      )

      const alert = screen.getByRole('alert')
      const description = screen.getByText('Description only alert')

      expect(alert).toContainElement(description)
      expect(screen.queryByText('title')).not.toBeInTheDocument()
    })
  })
})