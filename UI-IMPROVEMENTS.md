# UI Improvements - Floating Buttons & Default Mode

## User Requests

### 1. Add Pagination Toggle to Floating Buttons
> "Nút copy dưới cùng bên phải giữ nguyên, nút pagination toggle button thêm trên nút copy (tổng dưới cùng bên phải là 3 nút)"

**Translation:**
"Keep the copy button at bottom right, add pagination toggle button above the copy button (total 3 buttons at bottom right)"

### 2. Change Default Mode to Scroll
> "Chế độ mặc định khi vào view đọc là cuộn dọc thay vì cuộn ngang"

**Translation:**
"Default mode when entering reader view should be scroll (vertical) instead of pagination (horizontal)"

### 3. Remove Selection Hint Notification
> "Tao thấy đôi lúc có thông báo 'By selecting the actual content...' bỏ mẹ nó đi"

**Translation:**
"Sometimes there's a notification 'By selecting the actual content...' remove it"

---

## Implementation

### ✅ 1. Floating Pagination Toggle Button

**Added to HTML:**
```html
<!-- reader.html -->
<div class="floating-close">
    <div class="icon-close toolbar-icon" data-cmd="close"></div>
</div>
<div class="floating-pagination">  <!-- NEW -->
    <div class="icon-pagination toolbar-icon" data-cmd="toggle-pagination"></div>
</div>
<div class="floating-copy">
    <div class="icon-copy toolbar-icon" data-cmd="copy"></div>
</div>
```

**Position (bottom right):**
```
X (Close - top right)

Pagination Toggle  ← 120px from bottom
Copy               ← 60px from bottom
Home (when scrolled)
```

**CSS Added:**
```css
.floating-pagination {
    position: fixed;
    bottom: 120px;  /* Above copy button (60px + 60px spacing) */
    right: 30px;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

body.toolbar-hidden .floating-pagination {
    opacity: 1;  /* Show when toolbar hidden */
}
```

**Behavior:**
- Shows when toolbar is hidden (scroll down)
- Hides when toolbar is visible
- Works in both scroll and pagination modes
- Same toggle functionality as toolbar button

---

### ✅ 2. Default Mode = Scroll

**Changed in pagination-reader.js:**
```javascript
// Constructor
// OLD
this.mode = 'pagination'; // Default was pagination

// NEW
this.mode = 'scroll'; // DEFAULT: scroll mode
```

**Flow:**
```
User opens reader view
  ↓
PaginationReader.init()
  ↓
Load saved preference (if exists)
  ↓
If no saved preference → mode = 'scroll'
  ↓
enableScroll() called by default
  ↓
User sees scroll mode (vertical)
```

**Benefits:**
- ✅ More familiar UX (traditional scroll)
- ✅ Users can opt-in to pagination mode via button
- ✅ Preference saved after first toggle
- ✅ Next visit remembers choice

---

### ✅ 3. Remove Selection Hint Notification

**Before:**
```javascript
setTips() {
    const h = [ "By selecting the actual content or part of it before switching to the reader view, you can prevent unwanted content from cluttering your view. This is also useful if the automatic selection module fails to detect the correct content." ];

    // Show tip if not dismissed
    for (let D = 0; D < h.length; D += 1) {
        if (localStorage.getItem("tip." + D) !== "s") {
            // Show notification
            document.body.dataset.tips = String(true);
            break;
        }
    }
}
```

**After:**
```javascript
setTips() {
    // Tips disabled - no notification messages
    document.body.dataset.tips = String(false);
}
```

**Result:**
- ✅ No yellow notification box
- ✅ Clean reading experience
- ✅ No distractions

---

## CSS Updates

### Floating Buttons Layout

**Before (2 buttons):**
```
.floating-close     (top right, 15px from top)
.floating-copy      (bottom right, 60px from bottom)
```

**After (3 buttons):**
```
.floating-close       (top right, 15px from top)
.floating-pagination  (bottom right, 120px from bottom)  ← NEW
.floating-copy        (bottom right, 60px from bottom)
```

### Pagination Mode CSS Update

**Before:**
```css
/* Hide all floating buttons in pagination mode */
body.pagination-active .floating-copy,
body.pagination-active .floating-close,
body.pagination-active #home-btn {
    display: none !important;
}
```

**After:**
```css
/* Don't hide pagination toggle and copy in pagination mode */
body.pagination-active .floating-close,
body.pagination-active #home-btn {
    display: none !important;
}
/* floating-pagination and floating-copy still visible */
```

**Why:**
- Pagination toggle button needs to be visible in pagination mode (to switch back to scroll)
- Copy button also useful in pagination mode
- Only close button and home button hidden

---

## Files Modified

### 1. `html/reader.html`
**Added:**
```html
<div class="floating-pagination">
    <div class="icon-pagination toolbar-icon" data-cmd="toggle-pagination" title="Switch to Pagination Mode"></div>
</div>
```

**Location:** Between floating-close and floating-copy

### 2. `css/reader.css`
**Added:**
```css
.floating-pagination {
    position: fixed;
    bottom: 120px;
    right: 30px;
    z-index: 1001;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

body.toolbar-hidden .floating-pagination {
    opacity: 1;
}
```

**Modified:**
```css
/* Updated pagination mode hide rules */
body.pagination-active .floating-close,
body.pagination-active #home-btn {
    display: none !important;
}
/* Removed: .floating-copy and .floating-pagination */
```

### 3. `js/pagination-reader.js`
**Changed:**
```javascript
// Line 13
this.mode = 'scroll'; // Changed from 'pagination'
```

### 4. `js/reader.js`
**Simplified:**
```javascript
// Line 4481-4484
setTips() {
    // Tips disabled - no notification messages
    document.body.dataset.tips = String(false);
}
```

---

## User Experience Flow

### Opening Reader View:
```
1. User clicks reader view
2. Reader opens in SCROLL mode (default)
3. Toolbar visible at top
4. No floating buttons yet
```

### Scrolling Down:
```
1. User scrolls down
2. Toolbar hides (slides up)
3. Floating buttons appear:
   - Close (top right X)
   - Pagination toggle (bottom right, book icon)
   - Copy (bottom right, copy icon)
   - Home (bottom right, arrow - when scrolled)
```

### Toggling to Pagination:
```
1. User clicks pagination toggle button
2. Mode switches to pagination
3. Floating buttons:
   - Close: HIDDEN ✗
   - Pagination toggle: VISIBLE ✓ (to switch back)
   - Copy: VISIBLE ✓
   - Home: HIDDEN ✗
4. Arrow keys / wheel scroll work
```

### Toggling Back to Scroll:
```
1. User clicks pagination toggle again
2. Mode switches back to scroll
3. All floating buttons visible when toolbar hidden
4. Position preserved
```

---

## Benefits

### 1. **Better Accessibility**
- ✅ Pagination toggle accessible even when toolbar hidden
- ✅ No need to scroll to top to access toolbar
- ✅ One-click mode switching

### 2. **Improved Default UX**
- ✅ Scroll mode is more familiar to most users
- ✅ Pagination is opt-in feature for those who want it
- ✅ Preference remembered after first toggle

### 3. **Cleaner Interface**
- ✅ No distracting notifications
- ✅ Floating buttons only when needed
- ✅ Minimal, focused UI

### 4. **Consistent Button Layout**
- ✅ 3 buttons at bottom right corner
- ✅ Even spacing (60px between each)
- ✅ Same styling and transitions

---

## Testing Checklist

### Floating Button Position:
- [ ] Open reader view
- [ ] Scroll down → toolbar hides
- [ ] Check 3 floating buttons appear:
  - Top right: Close (X)
  - Bottom right: Pagination toggle (book icon, 120px from bottom)
  - Bottom right: Copy (copy icon, 60px from bottom)
- [ ] Buttons fade in smoothly

### Pagination Toggle:
- [ ] Click pagination toggle → switch to pagination mode
- [ ] Check: Close and Home buttons hidden
- [ ] Check: Pagination toggle and Copy still visible
- [ ] Click pagination toggle again → switch back to scroll
- [ ] All floating buttons visible

### Default Mode:
- [ ] Open new article in reader view
- [ ] Check: Opens in scroll mode (vertical scrolling)
- [ ] Not in pagination mode by default

### No Notifications:
- [ ] Open reader view
- [ ] Check: No yellow notification box
- [ ] No "By selecting the actual content..." message

---

## Summary

### Changes Made:
1. ✅ **Added** floating pagination toggle button (bottom right, 120px from bottom)
2. ✅ **Changed** default mode from pagination → scroll
3. ✅ **Removed** selection hint notification
4. ✅ **Updated** CSS to keep toggle/copy visible in pagination mode

### UI Layout:
```
Floating buttons (when toolbar hidden):

Top Right:
  - Close (X)

Bottom Right:
  - Pagination Toggle (120px from bottom)
  - Copy (60px from bottom)
  - Home (when scrolled, below copy)
```

### Result:
- ✅ Easy access to pagination toggle
- ✅ Better default experience (scroll mode)
- ✅ Clean, distraction-free reading
- ✅ Consistent button behavior

---

**Status:** All UI improvements complete ✅
**Files modified:** 4 files (HTML, CSS, 2 JS files)
**Last Updated:** 2025-10-07
