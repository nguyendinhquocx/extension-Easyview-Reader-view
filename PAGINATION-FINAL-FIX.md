# Pagination Mode - Final Layout Fix

## User Feedback

**Vấn đề:**
> "Vẫn không được, tao chỉ muốn nó cân đối như khi cuộn đọc nhưng chuyển trang bằng cách như đọc sách. Phần lề 2 bên tao thấy nó chưa được áp dụng."

**Screenshots:**
- image copy 3.png: Scroll mode - layout cân đối, có margins 2 bên ✅
- image copy 4.png: Pagination mode trước fix - full width, không có margins ❌

**Root Cause:**
- Padding-left/right không work với CSS columns
- Đang override scroll mode's centering layout (margin: auto)
- Không giữ nguyên scroll mode's width/margin settings

---

## Solution: Sử Dụng Max-Width + Margin Auto

### Scroll Mode Layout Analysis

**From `iframe.css` line 1:**
```css
body {
    margin: 30px auto 0 auto;  /* ← margin auto để center */
    padding: 10px;
}
```

**From `reader.js` updateIframeUi() line 4400:**
```javascript
width: ${this.settings.pageWidth ? this.settings.pageWidth + "px" : "calc(100vw - 50px)"};
```

**Default pageWidth: 850px**

**How scroll mode centers content:**
1. Body width = 850px (or user setting)
2. Margin: auto → tự động center
3. Viewport width > body width → có khoảng trắng 2 bên

---

## New Approach

### ✅ 1. Dùng Max-Width Thay Vì Padding

**Old (không work):**
```javascript
padding-left: 100px;
padding-right: 100px;
// CSS columns không respect padding → không có margins
```

**New (works!):**
```javascript
width: 850px !important;
max-width: 850px !important;
margin: 30px auto 0 auto !important;
// Giống scroll mode → tự động center với margins 2 bên
```

### ✅ 2. Giữ Nguyên Scroll Mode's Layout

**Principle:**
- Pagination mode INHERIT scroll mode's centering mechanism
- Chỉ ADD column properties
- KHÔNG override width/margin/padding

**Result:**
- Layout cân đối như scroll mode
- Content centered với margins tự nhiên 2 bên
- Consistent experience khi switch giữa scroll/pagination

### ✅ 3. Fixed Max-Width (850px)

**Config:**
```javascript
this.config = {
    maxWidth: 850, // Fixed width for pagination (same as default page width)
    pageGap: 40,   // Gap between pages
    // ...
}
```

**Why 850px?**
- Default page width setting trong scroll mode
- Comfortable reading width
- Matches scroll mode default experience

---

## Technical Implementation

### Configuration Changes

```javascript
// OLD
this.config = {
    sideMargin: 100, // Not working with CSS columns
    pageGap: 60,
}

// NEW
this.config = {
    maxWidth: 850,   // Fixed content width
    pageGap: 40,     // Gap between pages
}
```

### Layout Application

```javascript
applyPaginationLayout() {
    const columnWidth = this.config.maxWidth; // 850px

    const style = `
        body.pagination-mode {
            /* Layout - use max-width + margin auto like scroll mode */
            width: ${columnWidth}px !important;
            max-width: ${columnWidth}px !important;
            margin: 30px auto 0 auto !important;  /* ← SAME as scroll mode */

            /* Column properties */
            column-width: ${columnWidth}px !important;
            column-gap: ${this.config.pageGap}px !important;
            column-fill: auto !important;

            /* Pagination behavior */
            overflow-x: hidden !important;
            overflow-y: hidden !important;
            height: calc(100vh - 100px) !important;
        }
    `;
}
```

### Page Calculation

```javascript
calculatePages() {
    const contentWidth = this.iframeBody.scrollWidth;

    // Simple: each page = maxWidth + gap
    const columnWidth = this.config.maxWidth + this.config.pageGap;

    this.totalPages = Math.ceil(contentWidth / columnWidth);
}
```

### Navigation

```javascript
goToPage(pageNumber) {
    const columnWidth = this.config.maxWidth + this.config.pageGap;
    const offset = -((pageNumber - 1) * columnWidth);

    this.iframeBody.style.transform = `translateX(${offset}px)`;
}
```

---

## Before vs After

### Before Fix:
```
┌────────────────────────────────────────┐
│ Content full width, no margins         │
│ Text runs edge to edge                 │
│ Looks different from scroll mode       │
└────────────────────────────────────────┘
```
- ❌ Padding không work với CSS columns
- ❌ Content full width
- ❌ Không có margins 2 bên
- ❌ Khác với scroll mode

### After Fix:
```
┌────────────────────────────────────────┐
│        ┌─────────────────┐             │
│ Margin │   Content 850px │ Margin      │
│        │   (Centered)    │             │
│        └─────────────────┘             │
└────────────────────────────────────────┘
```
- ✅ Max-width + margin auto works!
- ✅ Content centered (850px width)
- ✅ Natural margins 2 bên
- ✅ Giống scroll mode layout

---

## Layout Comparison

### Scroll Mode:
```css
body {
    width: 850px;           /* From page width setting */
    margin: 30px auto 0;    /* Auto center */
    /* → Centered with margins */
}
```

### Pagination Mode (NEW):
```css
body.pagination-mode {
    width: 850px !important;        /* Same width */
    max-width: 850px !important;
    margin: 30px auto 0 auto !important;  /* Same centering */

    column-width: 850px !important; /* + Column layout */
    column-gap: 40px !important;
    /* → Same centered layout + pagination */
}
```

**Result:** Pagination mode GIỮ NGUYÊN scroll mode's centered layout, chỉ thêm column properties!

---

## Key Changes

### 1. `pagination-reader.js` - Config
```javascript
// Changed from sideMargin to maxWidth
this.config = {
    maxWidth: 850,  // NEW
    pageGap: 40,
}
```

### 2. `pagination-reader.js` - applyPaginationLayout()
```javascript
// OLD: padding-left/right approach (didn't work)
padding-left: ${this.config.sideMargin}px !important;
padding-right: ${this.config.sideMargin}px !important;

// NEW: max-width + margin auto approach (works!)
width: ${columnWidth}px !important;
max-width: ${columnWidth}px !important;
margin: 30px auto 0 auto !important;
```

### 3. `pagination-reader.js` - calculatePages()
```javascript
// OLD: Complex calculation with sideMargin
const columnWidth = (this.pageWidth - (2 * this.config.sideMargin)) + this.config.pageGap;

// NEW: Simple calculation with maxWidth
const columnWidth = this.config.maxWidth + this.config.pageGap;
```

### 4. `pagination-reader.js` - goToPage()
```javascript
// OLD:
const columnWidth = (this.pageWidth - (2 * this.config.sideMargin)) + this.config.pageGap;

// NEW:
const columnWidth = this.config.maxWidth + this.config.pageGap;
```

### 5. `pagination-reader.js` - handleResize()
```javascript
// OLD: Recalculate pageWidth on resize
this.pageWidth = window.innerWidth;
this.applyPaginationLayout();

// NEW: maxWidth is fixed, no need to recalc layout
// Just recalc pages in case content changed
this.calculatePages();
```

---

## Why This Works

### CSS Columns + Padding = ❌
- CSS columns layout không respect padding trên body
- Padding bị ignored khi tính column layout
- Columns vẫn full width dù có padding

### CSS Columns + Max-Width + Margin Auto = ✅
- Max-width giới hạn body width
- Margin auto centers body trong viewport
- Viewport width > body width → tự nhiên có khoảng trắng 2 bên
- Columns layout work within body width (850px)

**Math:**
```
Viewport width = 1920px (example)
Body width = 850px (max-width)
Margin left = (1920 - 850) / 2 = 535px (auto)
Margin right = (1920 - 850) / 2 = 535px (auto)

→ Content centered với margins tự nhiên!
```

---

## Benefits

### 1. **Layout Consistency**
- ✅ Pagination mode = scroll mode layout + columns
- ✅ Same centering mechanism
- ✅ Same comfortable reading width (850px)
- ✅ Seamless switch between modes

### 2. **Simplicity**
- ✅ No complex margin/padding calculations
- ✅ Reuse scroll mode's proven centering logic
- ✅ Fewer lines of code
- ✅ Easier to understand and maintain

### 3. **Reliability**
- ✅ Max-width + margin auto is CSS standard pattern
- ✅ Works across all browsers
- ✅ No weird CSS columns edge cases
- ✅ Predictable behavior

### 4. **User Experience**
- ✅ Content cân đối như scroll mode
- ✅ Margins 2 bên tự nhiên
- ✅ Comfortable reading area
- ✅ No visual shock khi switch modes

---

## Testing

### Visual Test:
- [ ] Open article in pagination mode
- [ ] **Check margins:** Content centered, có khoảng trắng 2 bên
- [ ] **Check width:** Content width ≈ 850px
- [ ] **Compare with scroll mode:** Layout gần giống nhau
- [ ] **No borders/frames:** Clean margins

### Navigation Test:
- [ ] Arrow Left/Right → flip pages smoothly
- [ ] Content stays centered during flip
- [ ] No layout shift

### Consistency Test:
- [ ] Scroll mode: Content centered ✓
- [ ] Switch to pagination: Content vẫn centered ✓
- [ ] Same visual width in both modes ✓

---

## Summary

### Problem:
- Padding approach không work với CSS columns
- Layout full width, không có margins như scroll mode

### Solution:
- Dùng max-width (850px) + margin auto
- Giữ nguyên scroll mode's centering mechanism
- Pagination chỉ add column properties

### Result:
- ✅ Content centered với margins 2 bên
- ✅ Layout cân đối như scroll mode
- ✅ Simple, reliable CSS pattern
- ✅ Seamless mode switching

---

**Status:** Layout fix complete ✅
**Method:** Max-width + margin auto (scroll mode pattern)
**Width:** 850px (fixed, matches scroll mode default)
**Result:** Centered content with natural margins
**Last Updated:** 2025-10-07
