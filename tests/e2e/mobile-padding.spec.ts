import { test, expect } from '@playwright/test';

test('checks padding on desktop devices', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Get the computed padding values for the main container
  const pageContainer = page.locator('.flex.flex-1.flex-col');
  const padding = await pageContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      paddingTop: style.paddingTop,
      paddingRight: style.paddingRight,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft
    };
  });
  
  console.log('Desktop padding:', padding);
  
  // Check that padding values are reasonable (not too large)
  const paddingTopValue = parseInt(padding.paddingTop);
  const paddingRightValue = parseInt(padding.paddingRight);
  const paddingBottomValue = parseInt(padding.paddingBottom);
  const paddingLeftValue = parseInt(padding.paddingLeft);
  
  // These should be reasonable values for desktop
  expect(paddingTopValue).toBeLessThan(50);
  expect(paddingRightValue).toBeLessThan(50);
  expect(paddingBottomValue).toBeLessThan(50);
  expect(paddingLeftValue).toBeLessThan(50);
});

test('checks padding on mobile viewport', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Navigate to the homepage
  await page.goto('/');
  
  // Wait for page to fully load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Get the computed padding values for the main container
  const pageContainer = page.locator('.flex.flex-1.flex-col');
  const padding = await pageContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      paddingTop: style.paddingTop,
      paddingRight: style.paddingRight,
      paddingBottom: style.paddingBottom,
      paddingLeft: style.paddingLeft
    };
  });
  
  console.log('Mobile padding:', padding);
  
  // Check that padding values are appropriate for mobile
  const paddingTopValue = parseInt(padding.paddingTop);
  const paddingRightValue = parseInt(padding.paddingRight);
  const paddingBottomValue = parseInt(padding.paddingBottom);
  const paddingLeftValue = parseInt(padding.paddingLeft);
  
  // These should be smaller values for mobile
  expect(paddingTopValue).toBeLessThan(30);
  expect(paddingRightValue).toBeLessThan(30);
  expect(paddingBottomValue).toBeLessThan(30);
  expect(paddingLeftValue).toBeLessThan(30);
});

test('compares desktop and mobile padding', async ({ page }) => {
  // Test desktop version first
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const desktopContainer = page.locator('.flex.flex-1.flex-col');
  const desktopPadding = await desktopContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      paddingTop: parseInt(style.paddingTop),
      paddingRight: parseInt(style.paddingRight),
      paddingBottom: parseInt(style.paddingBottom),
      paddingLeft: parseInt(style.paddingLeft)
    };
  });
  
  // Switch to mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const mobileContainer = page.locator('.flex.flex-1.flex-col');
  const mobilePadding = await mobileContainer.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return {
      paddingTop: parseInt(style.paddingTop),
      paddingRight: parseInt(style.paddingRight),
      paddingBottom: parseInt(style.paddingBottom),
      paddingLeft: parseInt(style.paddingLeft)
    };
  });
  
  console.log('Desktop vs Mobile padding comparison:');
  console.log('Desktop:', desktopPadding);
  console.log('Mobile:', mobilePadding);
  
  // Mobile padding should be less than or equal to desktop padding
  expect(mobilePadding.paddingTop).toBeLessThanOrEqual(desktopPadding.paddingTop);
  expect(mobilePadding.paddingRight).toBeLessThanOrEqual(desktopPadding.paddingRight);
  expect(mobilePadding.paddingBottom).toBeLessThanOrEqual(desktopPadding.paddingBottom);
  expect(mobilePadding.paddingLeft).toBeLessThanOrEqual(desktopPadding.paddingLeft);
});