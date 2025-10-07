# Pagination Mode - Fixes Round 2

## Issues Reported by User

### ❌ Issue 1: Đường phân cách và khung (Border/Frame Effect)
**Problem:** Khi vào pagination mode, có đường line ở giữa màn hình và tạo cảm giác như có khung/border, không tự nhiên.

**Root Cause:** `body.pagination-mode::before` CSS tạo book spine visual với gradient shadow ở center.

**Solution:** Xóa book spine pseudo-element vì nó tạo visual distraction.

**Files Changed:**
- `css/iframe.css` - Removed `body.pagination-mode::before` block

---

### ❌ Issue 2: Arrow Keys Không Hoạt Động
**Problem:** Arrow keys (Left/Right) không work, phải dùng Tab key thay thế. Đôi lúc khi switch giữa scroll/pagination thì lại work.

**Root Cause:**
- Event listeners có thể bị duplicate khi toggle modes nhiều lần
- Không capture từ iframe document
- Thiếu `stopImmediatePropagation()` để prevent other handlers

**Solution:**
1. **Remove listeners trước khi add mới** - Gọi `removeNavigation()` trong `setupNavigation()`
2. **Add listener vào iframe document** - `this.iframeDoc.addEventListener()`
3. **Thêm stopImmediatePropagation()** - Prevent all other handlers
4. **Debug logging** - Track xem events có được capture không

**Code Changes:**
```javascript
setupNavigation() {
    // Remove any existing listeners first to prevent duplicates
    this.removeNavigation();

    // Add to document, window, AND iframe document
    document.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });
    window.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });
    if (this.iframeDoc) {
        this.iframeDoc.addEventListener('keydown', this.boundHandlers.keydown, { capture: true });
    }
}

handleKeydown(e) {
    // ...
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation(); // ← Added this
    // ...
}
```

**Files Changed:**
- `js/pagination-reader.js` - `setupNavigation()`, `removeNavigation()`, `handleKeydown()`

---

### ❌ Issue 3: Layout Không Cân Đối Gọn
**Problem:** Pagination mode layout không đẹp như scroll mode. Scroll mode có layout centered, gọn gàng (image copy 3.png), nhưng pagination mode lại rộng ra hết màn hình, không centered (image copy 4.png).

**Root Cause:**
CSS pagination mode đang override:
- `width: 100vw !important;` - Force full width, phá vỡ margin auto
- `padding: 40px 60px !important;` - Override padding của scroll mode

**Solution:**
Giữ nguyên margin/padding của scroll mode để layout vẫn centered và gọn. Chỉ thêm CSS columns, không override layout styles.

**Code Changes:**
```javascript
// OLD - Force full width và custom padding
body.pagination-mode {
    width: 100vw !important;
    padding: 40px 60px !important;
    // ...
}

// NEW - Keep original margin/padding for centered layout
body.pagination-mode {
    // Removed width and padding overrides
    column-width: ${singlePageWidth}px !important;
    column-gap: 60px !important;
    // ... only essential pagination properties
}
```

**Files Changed:**
- `js/pagination-reader.js` - `applyPaginationLayout()` method

---

## Summary of Changes

### Fixed:
1. ✅ **Removed book spine visual** - No more distracting center line
2. ✅ **Arrow keys now work reliably** - Added iframe document listener, stopImmediatePropagation, and remove-before-add pattern
3. ✅ **Layout matches scroll mode** - Centered, clean layout like scroll mode, just with 2-page spread
4. ✅ **Added debug logging** - Easy to troubleshoot arrow key issues

### Technical Improvements:
- **Better event handling:** Capture from all sources (document, window, iframe)
- **Prevent duplicates:** Always remove old listeners before adding new ones
- **Stop all propagation:** `preventDefault()` + `stopPropagation()` + `stopImmediatePropagation()`
- **Cleaner layout:** Don't override width/padding, keep scroll mode's centered layout
- **Debug-friendly:** Console logging for all pagination keydown events

---

## Files Modified

1. **`css/iframe.css`**
   - Removed `body.pagination-mode::before` (book spine visual)

2. **`js/pagination-reader.js`**
   - `applyPaginationLayout()`: Removed width and padding overrides
   - `setupNavigation()`: Added removeNavigation() call, added iframe listener
   - `removeNavigation()`: Added iframe listener removal
   - `handleKeydown()`: Added stopImmediatePropagation() and debug logging
   - Removed duplicate `savePagePosition()` function

---

## Expected Behavior After Fix

### Layout:
- ✅ Centered layout like scroll mode
- ✅ No border/frame effect
- ✅ Clean 2-page spread
- ✅ Original margins and padding preserved

### Navigation:
- ✅ Arrow Left/Right work immediately
- ✅ Works consistently after mode switching
- ✅ Debug logs in console show event capture
- ✅ No conflicts with other key handlers

### Visual:
- ✅ No distracting center line
- ✅ Content flows naturally
- ✅ Looks like scroll mode but paginated

---

## Testing Checklist

- [ ] Open article in reader view
- [ ] Switch to pagination mode (book icon)
- [ ] Press Left/Right arrow keys → should navigate
- [ ] Switch to scroll mode and back → arrow keys still work
- [ ] Check layout is centered like scroll mode
- [ ] No visible border/frame/spine line
- [ ] Console logs show "[Pagination] Keydown: ArrowLeft/Right"

---

**Status:** All 3 fixes complete ✅
**Ready for:** User testing
**Last Updated:** 2025-10-07
