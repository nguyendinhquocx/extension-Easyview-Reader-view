# Wheel Navigation for Pagination Mode

## Feature Request

**User request:**
> "Tao muốn khi tao dùng chuột cuộn ngang nó cũng qua phải trái được như khi nhấn nút <- và ->"

**Translation:**
"I want to use horizontal mouse scroll to navigate left/right, same as arrow keys"

---

## Implementation

### Added Wheel Event Support

**New event listeners:**
- `document.addEventListener('wheel', ...)`
- `window.addEventListener('wheel', ...)`
- `iframeDoc.addEventListener('wheel', ...)`

**Handler:** `handleWheel(e)`

---

## How It Works

### 1. Horizontal Scroll Detection

```javascript
const deltaX = e.deltaX;  // Horizontal scroll amount
const deltaY = e.deltaY;  // Vertical scroll amount

// Check if horizontal scroll
const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY) || e.shiftKey;
```

**Logic:**
- If `|deltaX| > |deltaY|` → horizontal scroll
- If `Shift` key pressed → treat vertical as horizontal

### 2. Navigation Direction

```javascript
if (scrollAmount > 0) {
    // Scroll right → next page
    this.nextPage();
} else if (scrollAmount < 0) {
    // Scroll left → previous page
    this.prevPage();
}
```

**Direction mapping:**
- Scroll right (positive deltaX) → **Next page**
- Scroll left (negative deltaX) → **Previous page**

### 3. Debounce (300ms)

```javascript
const now = Date.now();

// Prevent too sensitive scrolling
if (now - this.lastWheelTime < this.wheelThreshold) {
    return;
}

// ... navigate ...

this.lastWheelTime = now;
```

**Why debounce?**
- Mouse wheel can generate many events quickly
- 300ms threshold prevents accidental multi-page jumps
- Smooth, controlled navigation

### 4. Prevent Default Scroll

```javascript
if (isHorizontalScroll) {
    e.preventDefault();      // Stop default scroll
    e.stopPropagation();     // Stop event bubbling
    // ... navigate ...
}
```

**Important:**
- Prevents browser's default horizontal scroll
- Replaces with page navigation
- Only in pagination mode

---

## Usage

### For Trackpad Users (MacBook, etc.):

**Two-finger swipe:**
- 👈 Swipe left → Previous page
- 👉 Swipe right → Next page

### For Mouse Users:

**Option 1: Horizontal scroll wheel**
- Tilt wheel left → Previous page
- Tilt wheel right → Next page

**Option 2: Shift + Vertical scroll** (if no horizontal wheel)
- `Shift` + Scroll up → Previous page
- `Shift` + Scroll down → Next page

---

## Technical Details

### State Variables

```javascript
// Constructor
this.lastWheelTime = 0;
this.wheelThreshold = 300; // ms between navigations
```

### Event Handler Binding

```javascript
// setupNavigation()
this.boundHandlers.wheel = this.handleWheel.bind(this);
document.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
window.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
if (this.iframeDoc) {
    this.iframeDoc.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
}
```

**Why `passive: false`?**
- Allows `preventDefault()` to work
- Necessary to prevent default scroll behavior

### Cleanup

```javascript
// removeNavigation()
if (this.boundHandlers.wheel) {
    document.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    window.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    if (this.iframeDoc) {
        this.iframeDoc.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    }
}
```

---

## Navigation Methods Summary

### Now Supported:

1. **Keyboard:**
   - ← → Arrow keys
   - Home / End
   - PageUp / PageDown

2. **Mouse:**
   - Click left 30% → Previous
   - Click right 30% → Next

3. **Wheel/Trackpad:** ✨ NEW
   - Horizontal scroll
   - Shift + Vertical scroll
   - Two-finger swipe (trackpad)

---

## Code Changes

### Files Modified:

**`js/pagination-reader.js`:**

1. **Constructor** - Added wheel tracking:
```javascript
this.boundHandlers = {
    keydown: null,
    click: null,
    resize: null,
    wheel: null,  // ← NEW
};

this.lastWheelTime = 0;
this.wheelThreshold = 300;
```

2. **setupNavigation()** - Added wheel listeners:
```javascript
this.boundHandlers.wheel = this.handleWheel.bind(this);
document.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
window.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
if (this.iframeDoc) {
    this.iframeDoc.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
}
```

3. **removeNavigation()** - Remove wheel listeners:
```javascript
if (this.boundHandlers.wheel) {
    document.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    window.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    if (this.iframeDoc) {
        this.iframeDoc.removeEventListener('wheel', this.boundHandlers.wheel, { passive: false });
    }
}
```

4. **handleWheel()** - NEW method (~40 lines):
```javascript
handleWheel(e) {
    if (this.mode !== 'pagination') return;

    const now = Date.now();
    if (now - this.lastWheelTime < this.wheelThreshold) return;

    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY) || e.shiftKey;

    if (isHorizontalScroll) {
        e.preventDefault();
        e.stopPropagation();

        const scrollAmount = e.shiftKey ? deltaY : deltaX;

        if (scrollAmount > 0) {
            this.nextPage();
            this.lastWheelTime = now;
        } else if (scrollAmount < 0) {
            this.prevPage();
            this.lastWheelTime = now;
        }
    }
}
```

---

## Benefits

### 1. **Natural Navigation**
- ✅ Trackpad users can swipe naturally
- ✅ Feels like reading a real book (flip pages)
- ✅ No need to reach for arrow keys

### 2. **Better UX**
- ✅ Consistent with native apps (PDF readers, image viewers)
- ✅ Debounce prevents accidental jumps
- ✅ Smooth, controlled navigation

### 3. **Accessibility**
- ✅ Multiple navigation methods
- ✅ Works with different hardware (mouse, trackpad, etc.)
- ✅ Shift+Scroll for mice without horizontal wheel

### 4. **Performance**
- ✅ Lightweight handler (simple calculations)
- ✅ Debounced (300ms) to prevent spam
- ✅ Only active in pagination mode

---

## Testing

### Trackpad Test:
- [ ] Two-finger swipe left → Previous page
- [ ] Two-finger swipe right → Next page
- [ ] Fast swipes don't skip multiple pages (debounce works)

### Mouse Test (with horizontal wheel):
- [ ] Tilt wheel left → Previous page
- [ ] Tilt wheel right → Next page

### Mouse Test (Shift + Scroll):
- [ ] Hold Shift + Scroll up → Previous page
- [ ] Hold Shift + Scroll down → Next page

### Edge Cases:
- [ ] Scroll mode: Wheel scrolls normally (not affected)
- [ ] Switch to pagination: Wheel navigates pages
- [ ] Rapid scrolling: Debounce prevents multi-page jumps

---

## Debugging

**Console logs:**
```
[Pagination] Wheel: next page
[Pagination] Wheel: previous page
```

**Check in browser console:**
```javascript
// Get pagination reader instance
const reader = window.paginationDebug.getReader();

// Check current state
console.log('Mode:', reader.mode);
console.log('Current page:', reader.currentPage);
console.log('Last wheel time:', reader.lastWheelTime);
```

---

## Future Enhancements

Potential improvements:
- [ ] Configurable wheel sensitivity
- [ ] Accumulate scroll amount for smoother feel
- [ ] Visual feedback during wheel navigation
- [ ] Touch swipe support (mobile)

---

## Summary

### What's New:
- ✅ Horizontal scroll wheel support
- ✅ Shift + Vertical scroll (fallback)
- ✅ Trackpad two-finger swipe
- ✅ 300ms debounce for smooth navigation

### How to Use:
- **Trackpad:** Swipe left/right (2 fingers)
- **Mouse:** Tilt wheel left/right or Shift+Scroll
- **Works with:** Arrow keys, clicks, PageUp/Down

### Result:
**Natural, smooth page navigation như đọc sách thật!**

---

**Status:** Feature complete ✅
**Added:** Wheel navigation support
**Debounce:** 300ms threshold
**Works with:** Trackpad, mouse wheel, Shift+scroll
**Last Updated:** 2025-10-07
