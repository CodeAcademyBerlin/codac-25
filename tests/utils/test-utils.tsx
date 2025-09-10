import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function that includes common providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    // Wrap provider(s) here when needed (theme, auth, etc.)
    ...options,
  })
}

export * from '@testing-library/react'
export { customRender as render }