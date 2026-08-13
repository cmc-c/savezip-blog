# Design QA — Savezip profile picks hub

## Comparison setup

- Source visual truth: `/Users/myeongcheolcheon/Documents/New project/qa-source-home-mobile-viewport.png`
- Implementation screenshot: `/Users/myeongcheolcheon/Documents/New project/qa-implementation-picks-mobile-viewport.png`
- Full implementation screenshots:
  - `/Users/myeongcheolcheon/Documents/New project/qa-implementation-picks-mobile.png`
  - `/Users/myeongcheolcheon/Documents/New project/qa-implementation-picks-desktop.png`
- Combined comparison input: `/Users/myeongcheolcheon/Documents/New project/qa-comparison-mobile.png`
- Source URL: `https://cmc-c.github.io/savezip-blog/`
- Implementation URL: `https://cmc-c.github.io/savezip-blog/picks/`
- Viewport: 390 x 844 CSS px for the normalized mobile comparison; 1280 x 900 CSS px for the desktop check.
- Pixels and density: source and implementation mobile viewport captures are both 390 x 844 px at CSS scale and device scale factor 1. No density normalization was required.
- State: public, logged-out, light theme, top of page.
- Comparison scope: this is an extension of the existing Savezip site rather than a pixel clone. The source establishes the site shell, typography family, monochrome palette, rules, and compact commerce treatment; the implementation intentionally changes the page hierarchy to a profile-first shopping hub.

## Full-view comparison evidence

- The combined mobile capture verifies that the same Savezip header, disclosure bar, black/white palette, thin borders, and system sans-serif family continue into the new page.
- The new hero is intentionally more prominent than the blog home search surface because it must explain the profile destination in one viewport. It remains flat, border-led, and shadow-free like the source.
- At 390 px the implementation reported `scrollWidth=390` and `clientWidth=390`, so there is no horizontal overflow. At 1280 px the product cards hold a stable three-column grid and the rest of the layout remains centered.
- The full mobile and desktop captures show a clear sequence: brand promise, featured comparison, three products, selection standard, and two onward links.

## Focused region comparison evidence

- The first 844 px of source and implementation were placed together in `qa-comparison-mobile.png`, so header height, disclosure treatment, typography, border weight, button density, and above-the-fold hierarchy were judged in one input.
- Product imagery was checked separately because the automated screenshot browser did not paint the remote ad-domain images in its full-page capture. In the in-app browser all three images completed at 1000 x 1000 natural pixels with no console errors. The three source assets were also opened as `/tmp/savezip-products-montage.jpg` to verify subject, crop, sharpness, and option correspondence.

## Required fidelity surfaces

- Fonts and typography: passed. The site font stack is preserved; the hub adds a heavier display weight and tighter tracking only for the profile hero and section headings. Korean wrapping is deliberate and no text truncation was observed.
- Spacing and layout rhythm: passed. Mobile spacing is compact above the fold, card content aligns consistently, and the black methodology block provides a clear section break. Desktop uses the existing site wrapper without overflow.
- Colors and visual tokens: passed. Existing neutral surfaces and black CTAs are retained. Acid-lime is limited to small decision labels and does not replace semantic text or controls.
- Image quality and asset fidelity: passed. All three assets are official 1000 x 1000 product images returned by the existing product source. `object-fit: contain` preserves the full product silhouette without cropping.
- Copy and content: passed. The page leads with a concrete value proposition, labels each recommendation by use case, includes dated prices and unit costs, avoids unverified first-person experience, and repeats the affiliate disclosure.

## Findings

- No actionable P0, P1, or P2 differences remain.
- No P3 polish item is required for the current three-product launch.

## Primary interactions tested

- Featured comparison link opens the post-85 detailed comparison with profile UTM parameters.
- “고르는 기준” jumps to `#how-we-pick` and lands the section at the top of the viewport.
- All three Coupang CTAs expose `_blank` targets and `nofollow sponsored noopener` relationships.
- All three product images load in the in-app browser, and the page logs contain no warning or error entries.

## Comparison history

- Pass 1: no P0/P1/P2 issue was found, so no visual-fix iteration was required.

## Residual test gaps

- The Threads profile URL itself was not edited because the available browser session is not authenticated as `@savezip.kr`. The public hub and all site interactions are verified independently.

final result: passed
