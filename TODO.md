# TODO - Feature Development

---

## =� PAGINATION MODE - Book Reading Experience

### <� Objective
Implement pagination mode (l�t trang ngang) nh� �c s�ch th�t, thay th� scroll d�c l�m mode m�c �nh.

### Phase 1: Core Pagination System � PRIORITY HIGH
**Timeline: 4-5 hours**

#### 1.1 Architecture & Setup (1h)
- [ ] **1.1.1** T�o file `js/pagination-reader.js` v�i class PaginationReader
- [ ] **1.1.2** Design module structure: mode management, page navigation, state persistence
- [ ] **1.1.3** Define constants: page dimensions, animation timings, breakpoints
- [ ] **1.1.4** Setup integration hooks v�i reader.js

#### 1.2 CSS Pagination Layout (1.5h)
- [ ] **1.2.1** Implement CSS columns trong `css/iframe.css`:
  - `column-width: 100vw` cho full-page layout
  - `column-gap: 40px` cho page separation
  - `overflow-x: hidden` � �n adjacent pages
- [ ] **1.2.2** Add page break controls:
  - `break-inside: avoid` cho paragraphs
  - `break-inside: avoid` cho images
  - Handle tables v� code blocks
- [ ] **1.2.3** Responsive adjustments cho different screen sizes
- [ ] **1.2.4** Fix height calculation � consistent pages

#### 1.3 Navigation System (1.5h)
- [ ] **1.3.1** Implement arrow key navigation (Left/Right)
- [ ] **1.3.2** Click zone navigation:
  - Left 30% c�a screen � previous page
  - Right 30% c�a screen � next page
  - Center 40% � no action (preserve text selection)
- [ ] **1.3.3** Page calculation logic:
  - Calculate total pages based on content length
  - Track current page position
  - Handle edge cases (first/last page)
- [ ] **1.3.4** Scroll position translation sang page numbers

#### 1.4 Mode Toggle Implementation (1h)
- [ ] **1.4.1** Add toggle button v�o toolbar (HTML):
  - Position: B�n tr�i n�t copy (ngo�i c�ng b�n ph�i)
  - Icon: `icons/icon48.png`
  - Two states: Book mode (pagination) / Scroll mode
- [ ] **1.4.2** Implement mode switching logic:
  - Toggle between pagination v� scroll layouts
  - Preserve reading position khi switch
  - Update button icon/tooltip
- [ ] **1.4.3** Add CSS classes cho mode states:
  - `.pagination-mode` cho book layout
  - `.scroll-mode` cho traditional scroll
- [ ] **1.4.4** Handle iframe content reflow khi switch modes

---

### Phase 2: UX Polish & Indicators (2-3 hours)

#### 2.1 Page Indicator UI (1h)
- [ ] **2.1.1** Design page counter display:
  - Format: "3 / 15" ho�c "Page 3 of 15"
  - Position: Bottom center ho�c top right
  - Minimal typography theo design system
- [ ] **2.1.2** Implement auto-hide behavior:
  - Show khi navigate
  - Fade out sau 2 seconds
  - Show on hover over indicator area
- [ ] **2.1.3** Add CSS animations cho fade in/out
- [ ] **2.1.4** Handle long articles (100+ pages) formatting

#### 2.2 Animation - Simple Slide (MVP) (1h)
- [ ] **2.2.1** Implement smooth horizontal slide:
  - `transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)`
  - GPU-accelerated v�i `transform: translateX()`
  - 60fps guarantee
- [ ] **2.2.2** Add easing curves cho natural feel
- [ ] **2.2.3** Prevent animation jank v�i `will-change`
- [ ] **2.2.4** Handle rapid navigation (debounce/throttle)

#### 2.3 Visual Feedback (0.5h)
- [ ] **2.3.1** Add hover states cho click zones (subtle visual cues)
- [ ] **2.3.2** Cursor changes: Arrow left/right � edge zones
- [ ] **2.3.3** Keyboard shortcut hints (tooltip ho�c first-time overlay)
- [ ] **2.3.4** Loading state khi calculating pages

#### 2.4 Accessibility (0.5h)
- [ ] **2.4.1** Keyboard navigation support:
  - Arrow keys: Left/Right
  - Page Up/Down: Jump multiple pages
  - Home/End: First/Last page
- [ ] **2.4.2** Screen reader announcements cho page changes
- [ ] **2.4.3** Focus management khi navigate
- [ ] **2.4.4** ARIA labels cho navigation controls

---

### Phase 3: Settings & Persistence (1-2 hours)

#### 3.1 Settings Panel Integration (0.5h)
- [ ] **3.1.1** Add "Reading Mode" section trong settings panel
- [ ] **3.1.2** Radio options:
  - Book Mode (Pagination) - default
  - Scroll Mode (Traditional)
- [ ] **3.1.3** Add setting � choose default mode on load
- [ ] **3.1.4** Update UI khi settings change

#### 3.2 Storage & Persistence (0.5h)
- [ ] **3.2.1** Save mode preference trong `chrome.storage.local`:
  - Key: `readingMode` (values: 'pagination' | 'scroll')
  - Per-user global setting
- [ ] **3.2.2** Remember last page position per URL:
  - Key: `pagePosition:{url_hash}`
  - Store: `{ page: 5, totalPages: 15, timestamp }`
- [ ] **3.2.3** Restore mode v� position on reader load
- [ ] **3.2.4** Cleanup old position data (expire sau 30 days)

#### 3.3 Performance Optimization (1h)
- [ ] **3.3.1** Lazy page rendering (ch� render current + adjacent pages)
- [ ] **3.3.2** Debounce resize events (recalculate pages)
- [ ] **3.3.3** Cache page calculations � avoid recompute
- [ ] **3.3.4** Memory management cho long articles (DOM recycling)

---

### Phase 4: Testing & Refinement (2 hours)

#### 4.1 Cross-browser Testing (0.5h)
- [ ] **4.1.1** Test Chrome 102+ (target browser)
- [ ] **4.1.2** Test Edge Chromium
- [ ] **4.1.3** Verify CSS columns support
- [ ] **4.1.4** Check animation performance

#### 4.2 Content Type Testing (0.5h)
- [ ] **4.2.1** Short articles (< 500 words)
- [ ] **4.2.2** Long articles (5000+ words)
- [ ] **4.2.3** Articles v�i nhi�u images
- [ ] **4.2.4** Articles v�i tables/code blocks
- [ ] **4.2.5** Mixed content (text + media)

#### 4.3 Edge Cases (0.5h)
- [ ] **4.3.1** Very narrow viewports (mobile simulation)
- [ ] **4.3.2** Very wide viewports (ultrawide monitors)
- [ ] **4.3.3** Dynamic content changes (lazy loaded images)
- [ ] **4.3.4** Zoom levels (browser zoom in/out)

#### 4.4 Performance Validation (0.5h)
- [ ] **4.4.1** Measure page calculation time (< 100ms target)
- [ ] **4.4.2** Animation frame rate (60fps target)
- [ ] **4.4.3** Memory usage v�i 10k+ word articles (< 10MB overhead)
- [ ] **4.4.4** Navigation response time (< 50ms target)

---

### Phase 5: Advanced Features (FUTURE) =.

#### 5.1 Enhanced Animations (2-4h)
- [ ] **5.1.1** 3D page flip effect:
  - CSS `perspective` v� `rotateY`
  - Shadow effects cho depth
  - Smooth 0.6s transition
- [ ] **5.1.2** Realistic page curl (advanced):
  - Canvas-based ho�c WebGL
  - Physics simulation
  - Turn.js style effect

#### 5.2 Advanced Navigation (2-3h)
- [ ] **5.2.1** Swipe gestures (touch support)
- [ ] **5.2.2** Page thumbnails preview
- [ ] **5.2.3** Mini-map navigation cho long articles
- [ ] **5.2.4** Jump to page input

#### 5.3 Reading Progress (1-2h)
- [ ] **5.3.1** Progress bar showing position trong article
- [ ] **5.3.2** Reading time estimation
- [ ] **5.3.3** Bookmarks system
- [ ] **5.3.4** Reading history tracking

---

### =� Files to Create/Modify

**New Files:**
- `js/pagination-reader.js` - Core pagination logic
- `css/pagination.css` - Pagination-specific styles (optional, c� th� merge v�o iframe.css)

**Modified Files:**
- `html/reader.html` - Add toggle button, page indicator, script includes
- `css/reader.css` - Toggle button styles
- `css/iframe.css` - Pagination layout, column styles
- `js/reader.js` - Integration v�i PaginationReader class
- `manifest.json` - Version bump (khi deploy)

---

### <� Success Metrics

**MVP Success Criteria:**
-  Pagination mode works smooth v�i 60fps animations
-  Toggle gi�a pagination/scroll preserves reading position
-  Page indicator accurate v� user-friendly
-  Keyboard navigation responsive (< 50ms)
-  Content breaks acceptable (< 5% awkward breaks)
-  Performance overhead < 10MB memory, < 100ms init

**User Experience Goals:**
-  Feels like reading a real book
-  No confusion v� navigation
-  Smooth, jank-free animations
-  Works v�i 95%+ of articles encountered

---

### � Known Challenges & Mitigations

**Challenge 1: Content Breaking**
- **Issue**: Text/images c�t gi�a pages
- **Mitigation**: CSS break-inside, acceptable trade-off
- **Severity**: Medium (cosmetic)

**Challenge 2: Variable Screen Sizes**
- **Issue**: Pages kh�c nhau tr�n different viewports
- **Mitigation**: Responsive calculation, debounced resize
- **Severity**: Medium (handle-able)

**Challenge 3: Long Articles Performance**
- **Issue**: 10k+ words c� th� lag
- **Mitigation**: Lazy rendering, DOM recycling
- **Severity**: High (performance critical)

**Challenge 4: User Learning Curve**
- **Issue**: Users quen scroll, ph�i h�c pagination
- **Mitigation**: Tooltips, onboarding hints, easy toggle
- **Severity**: Low (UX design)

---

### =� Implementation Priority

**MUST HAVE (MVP):**
1.  Core pagination layout (CSS columns)
2.  Basic navigation (arrows, clicks)
3.  Toggle button
4.  Simple slide animation
5.  Page indicator

**SHOULD HAVE (Polish):**
6.  Settings integration
7.  Position persistence
8.  Performance optimization
9.  Accessibility features

**NICE TO HAVE (Future):**
10. =. 3D flip animation
11. =. Swipe gestures
12. =. Page thumbnails
13. =. Realistic page curl

---

### =� Recommended Execution Plan

**Day 1 (4-5h)**: Phase 1 - Core System
- Morning: Architecture + CSS layout
- Afternoon: Navigation + Toggle

**Day 2 (2-3h)**: Phase 2 - UX Polish
- Morning: Page indicator + Animations
- Afternoon: Visual feedback + A11y

**Day 3 (1-2h)**: Phase 3 - Settings
- Morning: Settings panel + Persistence

**Day 4 (2h)**: Phase 4 - Testing
- All day: Testing + Bug fixes + Refinement

**Total MVP Time: 9-12 hours** (spread across ~2-3 working days)

---

## =� LINE HIGHLIGHTING - Previous Feature (ON HOLD)

### Phase 5: Polish & Settings = PAUSED
- [ ] **5.1** Add toggle setting trong reader settings panel
- [ ] **5.2** Customize highlight color options (yellow, blue, gray)
- [ ] **5.3** Add highlight intensity slider
- [ ] **5.4** Save user preferences trong chrome.storage

### Phase 6: Testing & Deployment = PAUSED
- [ ] **6.1** Manual testing v�i different content types
- [ ] **6.2** Performance testing v�i long articles (10k+ words)
- [ ] **6.3** Memory leak testing
- [ ] **6.4** Update manifest version v� deploy

**Note**: Line highlighting Phases 1-4 � complete (66% done). Phase 5-6 t�m pause � focus v�o Pagination Mode.

---

**Current Focus: PAGINATION MODE - Book Reading Experience** =�
**Status: Planning Complete, Ready for Implementation** 
**Estimated Time: 9-12 hours (MVP)** �
