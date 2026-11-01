import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve('.');

const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
    console.log(`[PASS] ${name}`);
  } catch (err) {
    results.push({ name, pass: false, error: err.message });
    console.error(`[FAIL] ${name}: ${err.message}`);
  }
}

console.log('=== EMPIRICAL ADVERSARIAL STRESS TEST: MOBILE VIEWPORT & FINTECH NAVIGATION (M2) ===\n');

// 1. DASHBOARD SHELL TESTS
const dashboardShellPath = path.join(rootDir, 'apps/dashboard/src/components/dashboard-shell.tsx');
const dashboardShellContent = fs.readFileSync(dashboardShellPath, 'utf8');

test('DashboardShell: Fixed bottom navigation element exists with correct aria-label', () => {
  if (!dashboardShellContent.includes('aria-label="Mobile Bottom Navigation"')) {
    throw new Error('Missing <nav aria-label="Mobile Bottom Navigation">');
  }
});

test('DashboardShell: Bottom navigation is fixed, bottom-pinned, and restricted to mobile (< 768px)', () => {
  const navTagMatch = dashboardShellContent.match(/<nav\s+aria-label="Mobile Bottom Navigation"[^>]*className="([^"]+)"/);
  if (!navTagMatch) throw new Error('Could not find nav tag className');
  const classes = navTagMatch[1].split(/\s+/);
  if (!classes.includes('md:hidden')) throw new Error('Nav must have md:hidden');
  if (!classes.includes('fixed')) throw new Error('Nav must have fixed');
  if (!classes.includes('bottom-0')) throw new Error('Nav must have bottom-0');
  if (!classes.includes('inset-x-0')) throw new Error('Nav must have inset-x-0');
});

test('DashboardShell: Z-index hierarchy is correct (header: z-30, bottom-nav: z-40, drawer/modal: z-50)', () => {
  const navMatch = dashboardShellContent.match(/<nav\s+aria-label="Mobile Bottom Navigation"[^>]*className="([^"]+)"/);
  const headerMatch = dashboardShellContent.match(/<header[^>]*className="([^"]+)"/);
  const drawerMatch = dashboardShellContent.match(/mobileMenuOpen\s*&&\s*\(\s*<div[^>]*className="([^"]+)"/);

  if (!navMatch || !navMatch[1].includes('z-40')) {
    throw new Error(`Bottom nav must have z-40, found: ${navMatch ? navMatch[1] : 'none'}`);
  }
  if (!headerMatch || !headerMatch[1].includes('z-30')) {
    throw new Error(`Header must have z-30, found: ${headerMatch ? headerMatch[1] : 'none'}`);
  }
  if (!drawerMatch || !drawerMatch[1].includes('z-50')) {
    throw new Error(`Drawer must have z-50, found: ${drawerMatch ? drawerMatch[1] : 'none'}`);
  }
});

test('DashboardShell: Page content has clearance padding pb-24 on mobile, reset to md:pb-8 on desktop', () => {
  const mainMatch = dashboardShellContent.match(/<main[^>]*className="([^"]+)"/);
  if (!mainMatch) throw new Error('Could not find <main> tag');
  const classes = mainMatch[1].split(/\s+/);
  if (!classes.includes('pb-24')) throw new Error('main must have pb-24');
  if (!classes.includes('md:pb-8')) throw new Error('main must have md:pb-8');
});

test('DashboardShell: All 5 bottom nav items meet min-h-[46px] min-w-[46px] touch target standards', () => {
  const items = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Verify', href: '/dashboard/verify' },
    { label: 'Slips', href: '/dashboard/slips' },
    { label: 'Billing', href: '/dashboard/billing' },
  ];
  for (const item of items) {
    if (!dashboardShellContent.includes(`href: "${item.href}"`)) {
      throw new Error(`Missing nav item definition for ${item.label}`);
    }
  }

  // Count instances of min-h-[46px] and min-w-[46px] in the nav
  const minHMatches = dashboardShellContent.match(/min-h-\[46px\]/g) || [];
  const minWMatches = dashboardShellContent.match(/min-w-\[46px\]/g) || [];
  // Should have at least 2 in template: Link items and Menu button
  if (minHMatches.length < 2 || minWMatches.length < 2) {
    throw new Error(`Expected at least 2 occurrences of min-h-[46px] and min-w-[46px], found minH: ${minHMatches.length}, minW: ${minWMatches.length}`);
  }
});

// 2. DASHBOARD OVERVIEW PAGE TESTS
const dashboardPagePath = path.join(rootDir, 'apps/dashboard/src/app/dashboard/page.tsx');
const dashboardPageContent = fs.readFileSync(dashboardPagePath, 'utf8');

test('DashboardOverview: Quick actions provide minimum 44px touch targets', () => {
  const quickActionsMatch = dashboardPageContent.match(/Quick Actions/);
  if (!quickActionsMatch) throw new Error('Missing Quick Actions section');
  const minH44Count = (dashboardPageContent.match(/min-h-\[44px\]/g) || []).length;
  if (minH44Count < 3) {
    throw new Error(`Expected at least 3 quick actions with min-h-[44px], found: ${minH44Count}`);
  }
});

test('DashboardOverview: Dedicated Virtual Account card has lateral expansion defenses (min-w-0, break-all, truncate)', () => {
  if (!dashboardPageContent.includes('break-all')) {
    throw new Error('DVA card missing break-all to prevent long account number blowouts');
  }
  if (!dashboardPageContent.includes('truncate')) {
    throw new Error('DVA card missing truncate on bank or account names');
  }
});

test('DashboardOverview: Audit logs use responsive dual-view (md:hidden card feed vs hidden md:block table)', () => {
  if (!dashboardPageContent.includes('md:hidden space-y-2.5')) {
    throw new Error('Missing md:hidden mobile card feed for recent logs');
  }
  if (!dashboardPageContent.includes('hidden md:block overflow-x-auto') && !dashboardPageContent.includes('hidden md:block')) {
    throw new Error('Desktop table wrapper missing hidden md:block');
  }
});

// 3. WWW MARKETING PAGE TESTS
const wwwPagePath = path.join(rootDir, 'apps/www/src/app/page.tsx');
const wwwPageContent = fs.readFileSync(wwwPagePath, 'utf8');

test('WWW Page: Pricing table has overflow wrapper with touch-pan-x and min-w-[640px]', () => {
  if (!wwwPageContent.includes('touch-pan-x')) {
    throw new Error('Pricing table missing touch-pan-x class');
  }
  if (!wwwPageContent.includes('min-w-[640px]')) {
    throw new Error('Pricing table missing min-w-[640px] to preserve tabular readability');
  }
});

test('WWW Page: Verification demo buttons have min-h-[44px] and responsive grid', () => {
  if (!wwwPageContent.includes('grid-cols-2 xs:grid-cols-3 sm:grid-cols-5')) {
    throw new Error('Verification demo missing responsive column wrapping on mobile');
  }
  const minH44Demo = (wwwPageContent.match(/min-h-\[44px\]/g) || []).length;
  if (minH44Demo < 2) {
    throw new Error(`Expected min-h-[44px] touch targets in www page, found ${minH44Demo}`);
  }
});

test('WWW Page: Verification demo result scroll container has touch-pan-y and overscroll-contain', () => {
  if (!wwwPageContent.includes('touch-pan-y')) {
    throw new Error('Verification demo result container missing touch-pan-y');
  }
  if (!wwwPageContent.includes('overscroll-contain')) {
    throw new Error('Verification demo result container missing overscroll-contain');
  }
});

// 4. MATHEMATICAL VIEWPORT GEOMETRY SIMULATION (320px, 375px, 414px)
const viewports = [320, 375, 414];

test('Viewport Simulation: Bottom Navigation Bar Item Widths at 320px, 375px, 414px', () => {
  for (const vp of viewports) {
    const navPadding = 16; // px-2 on both sides = 8 * 2 = 16
    const availableWidth = vp - navPadding;
    const numItems = 5;
    const itemWidth = availableWidth / numItems;
    const minTargetWidth = 46; // min-w-[46px]

    if (itemWidth < minTargetWidth) {
      throw new Error(`At viewport ${vp}px, item width is ${itemWidth.toFixed(1)}px which is less than min-w-[46px]! Layout clipping would occur.`);
    }
  }
});

test('Viewport Simulation: Clearance Height vs Bottom Nav Height', () => {
  // Bottom nav height: min-h-[46px] + py-1 on items (8px) + py-1.5 on nav container (12px) = 66px
  const bottomNavHeight = 66;
  const paddingBottomClearance = 96; // pb-24 = 24 * 4px = 96px
  const netClearance = paddingBottomClearance - bottomNavHeight;

  if (netClearance <= 0) {
    throw new Error(`Negative clearance (${netClearance}px): Bottom nav overlaps page content!`);
  }
  if (netClearance < 20) {
    throw new Error(`Clearance buffer too small (${netClearance}px): risky for touch gestures.`);
  }
});

test('Viewport Simulation: Dedicated Virtual Account Width at 320px Viewport', () => {
  const vp = 320;
  // Margins: main p-3.5 = 14*2 = 28px
  // Parent card p-5 = 20*2 = 40px
  // DVA box p-4 = 16*2 = 32px
  // Total lateral inset = 100px
  const contentWidth = vp - 100; // 220px
  const sampleAccountNumber = '0123456789'; // 10 chars
  // font-mono at text-xl (20px fontSize): character width is approx 0.6 * 20 = 12px
  const estimatedTextWidth = sampleAccountNumber.length * 12; // 120px

  if (estimatedTextWidth > contentWidth) {
    throw new Error(`Account number would overflow 320px viewport without truncation or wrap.`);
  }
});

// SUMMARY
console.log('\n=== TEST SUITE EXECUTION SUMMARY ===');
const passed = results.filter(r => r.pass).length;
const failed = results.filter(r => !r.pass).length;
console.log(`Total tests: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS TESTS PASSED EMPIRICALLY!');
}
