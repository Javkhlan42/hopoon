import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests for User Registration and Login Flow
 * Tests complete user authentication journey
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

test.describe('User Authentication Flow', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);

    // Generate unique phone number
    const phoneNumber = `99${Math.floor(10000000 + Math.random() * 10000000)}`;

    // Fill registration form
    await page.fill('input[name="phone"]', phoneNumber);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirmPassword"]', 'Test123!@#');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify successful registration
    await expect(page).toHaveURL(/\/login|\/dashboard/);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    // Fill login form
    await page.fill('input[name="phone"]', '+97699887766');
    await page.fill('input[name="password"]', 'Test123!@#');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify user is logged in
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="phone"]', '+97699887766');
    await page.fill('input[name="password"]', 'WrongPassword');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=/invalid|credentials/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="phone"]', '+97699887766');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // Verify redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});

/**
 * E2E Tests for Ride Creation and Search Flow
 */
test.describe('Ride Creation and Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as driver
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="phone"]', '+97699887766');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should create a new ride successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/rides/create`);

    // Fill ride form
    await page.fill('input[name="origin"]', 'Sukhbaatar Square, Ulaanbaatar');
    await page.fill(
      'input[name="destination"]',
      'Zaisan Memorial, Ulaanbaatar',
    );

    // Set departure date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="departureDate"]', dateString);

    await page.fill('input[name="departureTime"]', '10:00');
    await page.fill('input[name="availableSeats"]', '3');
    await page.fill('input[name="pricePerSeat"]', '5000');

    // Set preferences
    await page.check('input[name="smokingAllowed"]');
    await page.uncheck('input[name="petsAllowed"]');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify ride created
    await expect(page.locator('text=/ride created|success/i')).toBeVisible();
    await expect(page).toHaveURL(/\/rides\/\w+/);
  });

  test('should search for rides', async ({ page }) => {
    await page.goto(`${BASE_URL}/rides/search`);

    // Fill search form
    await page.fill('input[name="origin"]', 'Sukhbaatar Square');
    await page.fill('input[name="destination"]', 'Zaisan Memorial');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);

    // Search
    await page.click('button[type="submit"]');

    // Verify search results
    await expect(page.locator('[data-testid="ride-card"]')).toHaveCount(1, {
      timeout: 5000,
    });
  });

  test('should view ride details', async ({ page }) => {
    await page.goto(`${BASE_URL}/rides/search`);

    // Search for rides
    await page.fill('input[name="origin"]', 'Sukhbaatar Square');
    await page.fill('input[name="destination"]', 'Zaisan Memorial');
    await page.click('button[type="submit"]');

    // Click on first ride
    await page.click('[data-testid="ride-card"]:first-child');

    // Verify ride details page
    await expect(page).toHaveURL(/\/rides\/\w+/);
    await expect(page.locator('[data-testid="ride-origin"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="ride-destination"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="ride-price"]')).toBeVisible();
  });
});

/**
 * E2E Tests for Booking Flow
 */
test.describe('Booking Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Login as passenger
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="phone"]', '+97699112233');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should book a ride successfully', async () => {
    // Search for rides
    await page.goto(`${BASE_URL}/rides/search`);
    await page.fill('input[name="origin"]', 'Sukhbaatar Square');
    await page.fill('input[name="destination"]', 'Zaisan Memorial');
    await page.click('button[type="submit"]');

    // Select first ride
    await page.click('[data-testid="ride-card"]:first-child');

    // Fill booking form
    await page.fill('input[name="seats"]', '2');
    await page.fill('input[name="pickupAddress"]', 'Sukhbaatar Square');
    await page.fill('input[name="dropoffAddress"]', 'Zaisan Memorial');

    // Submit booking
    await page.click('button[data-testid="book-now"]');

    // Verify booking created
    await expect(
      page.locator('text=/booking confirmed|success/i'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/bookings\/\w+/);
  });

  test('should view booking details', async () => {
    await page.goto(`${BASE_URL}/bookings`);

    // Click on first booking
    await page.click('[data-testid="booking-card"]:first-child');

    // Verify booking details
    await expect(page).toHaveURL(/\/bookings\/\w+/);
    await expect(page.locator('[data-testid="booking-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-seats"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-price"]')).toBeVisible();
  });

  test('should cancel a booking', async () => {
    await page.goto(`${BASE_URL}/bookings`);

    // Click on first booking
    await page.click('[data-testid="booking-card"]:first-child');

    // Cancel booking
    await page.click('button[data-testid="cancel-booking"]');

    // Confirm cancellation
    await page.fill('textarea[name="cancelReason"]', 'Changed plans');
    await page.click('button[data-testid="confirm-cancel"]');

    // Verify cancellation
    await expect(page.locator('text=/cancelled|canceled/i')).toBeVisible();
  });

  test('should not book if insufficient seats', async () => {
    // Search for rides
    await page.goto(`${BASE_URL}/rides/search`);
    await page.fill('input[name="origin"]', 'Sukhbaatar Square');
    await page.fill('input[name="destination"]', 'Zaisan Memorial');
    await page.click('button[type="submit"]');

    // Select first ride
    await page.click('[data-testid="ride-card"]:first-child');

    // Try to book more seats than available
    await page.fill('input[name="seats"]', '10');
    await page.click('button[data-testid="book-now"]');

    // Verify error message
    await expect(page.locator('text=/insufficient|not enough/i')).toBeVisible();
  });
});

/**
 * E2E Tests for Complete User Journey
 */
test.describe('Complete User Journey', () => {
  test('should complete full carpooling flow', async ({ page }) => {
    // 1. Register as driver
    await page.goto(`${BASE_URL}/register`);
    const driverPhone = `99${Math.floor(10000000 + Math.random() * 10000000)}`;
    await page.fill('input[name="phone"]', driverPhone);
    await page.fill('input[name="password"]', 'Driver123!@#');
    await page.fill('input[name="confirmPassword"]', 'Driver123!@#');
    await page.fill('input[name="name"]', 'Test Driver');
    await page.click('button[type="submit"]');

    // 2. Create a ride
    await page.goto(`${BASE_URL}/rides/create`);
    await page.fill('input[name="origin"]', 'Sukhbaatar Square, Ulaanbaatar');
    await page.fill(
      'input[name="destination"]',
      'Zaisan Memorial, Ulaanbaatar',
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill(
      'input[name="departureDate"]',
      tomorrow.toISOString().split('T')[0],
    );
    await page.fill('input[name="departureTime"]', '10:00');
    await page.fill('input[name="availableSeats"]', '3');
    await page.fill('input[name="pricePerSeat"]', '5000');
    await page.click('button[type="submit"]');

    // Extract ride ID from URL
    const rideUrl = page.url();
    const rideId = rideUrl.split('/').pop();

    // 3. Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // 4. Register as passenger
    await page.goto(`${BASE_URL}/register`);
    const passengerPhone = `99${Math.floor(10000000 + Math.random() * 10000000)}`;
    await page.fill('input[name="phone"]', passengerPhone);
    await page.fill('input[name="password"]', 'Passenger123!@#');
    await page.fill('input[name="confirmPassword"]', 'Passenger123!@#');
    await page.fill('input[name="name"]', 'Test Passenger');
    await page.click('button[type="submit"]');

    // 5. Book the ride
    await page.goto(`${BASE_URL}/rides/${rideId}`);
    await page.fill('input[name="seats"]', '2');
    await page.click('button[data-testid="book-now"]');

    // 6. Verify booking
    await expect(page.locator('text=/booking|success/i')).toBeVisible();

    // 7. View bookings list
    await page.goto(`${BASE_URL}/bookings`);
    await expect(
      page.locator('[data-testid="booking-card"]').first(),
    ).toBeVisible();
  });
});
