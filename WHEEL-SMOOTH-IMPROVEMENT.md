# Wheel Navigation - Smooth Improvement

## User Feedback

**Issue:**
> "Tốt, tuy nhiên nó đang hơi khựng và chưa mượt mà lắm"

**Translation:**
"Good, but it's a bit jerky and not smooth enough"

---

## Problem with Original Implementation

### Old Approach: Hard Debounce (300ms)

```javascript
// OLD
this.lastWheelTime = 0;
this.wheelThreshold = 300; // ms between navigations

handleWheel(e) {
    const now = Date.now();

    // Hard debounce - block all events for 300ms
    if (now - this.lastWheelTime < 300) {
        return;  // Ignore scroll
    }

    // Single scroll event = immediate page flip
    if (scrollAmount > 0) {
        this.nextPage();
        this.lastWheelTime = now;
    }
}
```

**Problems:**
1. ❌ **Feels laggy** - 300ms delay makes response slow
2. ❌ **Not responsive to small scrolls** - small movements ignored
3. ❌ **Binary behavior** - either blocked or instant flip, no middle ground
4. ❌ **Unnatural feel** - doesn't match natural scrolling expectation

**Result:**
- Feels "khựng" (jerky, stuttering)
- Not smooth like native scroll

---

## New Approach: Scroll Accumulation

### Concept: Natural Scroll Feel

**Idea:**
- **Accumulate** small scroll amounts
- **Flip page** only when accumulated amount exceeds threshold
- **Reset** accumulator if user stops scrolling

**Benefits:**
- ✅ Responsive to all scroll inputs (no hard debounce)
- ✅ Natural feel - small scrolls accumulate
- ✅ Prevents accidental flips (need sustained scroll)
- ✅ Smooth, predictable behavior

### Implementation

```javascript
// NEW - Scroll accumulation
this.scrollAccumulator = 0;
this.scrollThreshold = 100;      // Amount needed to flip
this.scrollResetTimeout = null;
this.scrollResetDelay = 200;     // ms to reset after last scroll

handleWheel(e) {
    // No hard debounce - handle every event!

    // Accumulate scroll amount
    this.scrollAccumulator += scrollAmount;

    // Clear existing reset timeout
    clearTimeout(this.scrollResetTimeout);

    // Check if threshold reached
    if (Math.abs(this.scrollAccumulator) >= this.scrollThreshold) {
        // Flip page!
        if (this.scrollAccumulator > 0) {
            this.nextPage();
        } else {
            this.prevPage();
        }

        // Reset accumulator
        this.scrollAccumulator = 0;
    } else {
        // Not enough yet - reset after delay
        this.scrollResetTimeout = setTimeout(() => {
            this.scrollAccumulator = 0;
        }, this.scrollResetDelay);
    }
}
```

---

## How It Works

### Example Scroll Sequence:

```
User starts scrolling right (small movements):

Event 1: deltaX = +15
  → scrollAccumulator = 15 (< 100, no flip)
  → Start reset timer (200ms)

Event 2: deltaX = +20 (within 200ms)
  → Clear reset timer
  → scrollAccumulator = 35 (< 100, no flip)
  → Start new reset timer

Event 3: deltaX = +30
  → Clear reset timer
  → scrollAccumulator = 65 (< 100, no flip)
  → Start new reset timer

Event 4: deltaX = +40
  → Clear reset timer
  → scrollAccumulator = 105 (>= 100, FLIP!)
  → nextPage()
  → Reset: scrollAccumulator = 0

User stops scrolling:
  → 200ms passes
  → Reset timer fires
  → scrollAccumulator = 0
```

### Visual Representation:

```
Scroll amount over time:

    ^
100 |                    ╔═══ PAGE FLIP!
    |                  ╔═╝
 75 |                ╔═╝
    |              ╔═╝
 50 |            ╔═╝
    |          ╔═╝
 25 |        ╔═╝
    |      ╔═╝
  0 |══════╝
    └─────────────────────────────────────> time
         Scroll events accumulating
```

---

## Configuration

### Tunable Parameters:

```javascript
this.scrollThreshold = 100;   // Accumulated amount to flip page
                              // Lower = more sensitive
                              // Higher = need more scrolling

this.scrollResetDelay = 200;  // ms to reset accumulator
                              // Lower = reset faster (harder to accumulate)
                              // Higher = more forgiving (easier to accumulate)
```

### Current Settings:

- **Threshold: 100** - Balanced sensitivity
- **Reset delay: 200ms** - Quick reset, prevents stale accumulation

---

## Before vs After

### Before (Hard Debounce):

```
User scrolls:
  Event 1 → PAGE FLIP (instant)
  Event 2 → BLOCKED (300ms debounce)
  Event 3 → BLOCKED
  Event 4 → BLOCKED
  ...wait 300ms...
  Event N → PAGE FLIP (instant)

Result: Jerky, unresponsive, laggy
```

### After (Accumulation):

```
User scrolls:
  Event 1 → Accumulate +15
  Event 2 → Accumulate +20 (total: 35)
  Event 3 → Accumulate +30 (total: 65)
  Event 4 → Accumulate +40 (total: 105) → PAGE FLIP!

Result: Smooth, responsive, natural
```

---

## Benefits

### 1. **Smooth Feel**
- ✅ Every scroll event processed (no blocking)
- ✅ Natural accumulation like native scroll
- ✅ Predictable behavior

### 2. **Responsive**
- ✅ No 300ms lag
- ✅ Immediate feedback (accumulation happens instantly)
- ✅ Small scrolls not wasted

### 3. **Prevents Accidents**
- ✅ Small accidental scrolls won't flip page
- ✅ Need sustained/strong scroll to flip
- ✅ Auto-reset if user stops scrolling

### 4. **Customizable**
- ✅ Adjust threshold for sensitivity
- ✅ Adjust reset delay for forgiveness
- ✅ Easy to tune to user preference

---

## Code Changes

### State Variables:

```javascript
// OLD
this.lastWheelTime = 0;
this.wheelThreshold = 300;

// NEW
this.scrollAccumulator = 0;
this.scrollThreshold = 100;
this.scrollResetTimeout = null;
this.scrollResetDelay = 200;
```

### Handler Logic:

```javascript
// OLD - Hard debounce
if (now - this.lastWheelTime < 300) {
    return; // Block
}
this.nextPage();
this.lastWheelTime = now;

// NEW - Accumulation
this.scrollAccumulator += scrollAmount;
clearTimeout(this.scrollResetTimeout);

if (Math.abs(this.scrollAccumulator) >= this.scrollThreshold) {
    this.nextPage();
    this.scrollAccumulator = 0;
} else {
    this.scrollResetTimeout = setTimeout(() => {
        this.scrollAccumulator = 0;
    }, this.scrollResetDelay);
}
```

### Cleanup:

```javascript
// Added to destroy()
clearTimeout(this.scrollResetTimeout);
```

---

## Testing

### Smooth Feel Test:
- [ ] Scroll slowly → Accumulates smoothly, flips after ~3-4 small scrolls
- [ ] Scroll fast → Flips immediately on strong scroll
- [ ] Stop mid-scroll → Resets after 200ms, doesn't flip

### Sensitivity Test:
- [ ] Tiny scroll (deltaX ~5) → Accumulates, doesn't flip alone
- [ ] Medium scroll (deltaX ~50) → Need 2 scrolls to flip
- [ ] Big scroll (deltaX ~100+) → Flips immediately

### Edge Cases:
- [ ] Scroll opposite direction → Cancels accumulation (+ then - = 0)
- [ ] Rapid back-and-forth → Doesn't flip (cancels out)
- [ ] Switch to scroll mode → No interference

---

## Tuning Guide

### If too sensitive (flips too easily):
```javascript
this.scrollThreshold = 150; // Increase (need more scroll)
```

### If not sensitive enough (hard to flip):
```javascript
this.scrollThreshold = 75;  // Decrease (easier to flip)
```

### If accumulation expires too fast:
```javascript
this.scrollResetDelay = 300; // Increase (more time to continue)
```

### If accumulation lasts too long:
```javascript
this.scrollResetDelay = 100; // Decrease (reset faster)
```

---

## Technical Details

### Why Accumulation Works Better:

**Physics analogy:**
- Old: Binary switch - on/off with delay
- New: Bucket filling - accumulate until full

**User experience:**
- Old: "Why isn't my small scroll working? ...oh now it jumped!"
- New: "I'm scrolling... scrolling... and it flipped naturally!"

### Math:

```
Threshold = 100 units

Small scroll:  deltaX = 20
Medium scroll: deltaX = 50
Large scroll:  deltaX = 120

Small:  Need 5 scrolls (20 × 5 = 100)
Medium: Need 2 scrolls (50 × 2 = 100)
Large:  Instant flip (120 > 100)
```

---

## Performance

### Minimal Overhead:

- ✅ Addition operation: `scrollAccumulator += scrollAmount` (O(1))
- ✅ Comparison: `Math.abs(scrollAccumulator) >= threshold` (O(1))
- ✅ Timeout clear/set: Lightweight (native browser API)

### No Performance Impact:
- No complex calculations
- No DOM manipulations in handler
- Only navigates when threshold reached (same as before)

---

## Summary

### Problem:
- Hard 300ms debounce made wheel navigation feel jerky and laggy

### Solution:
- Scroll accumulation - collect scroll amounts until threshold reached
- Responsive to all events, no blocking
- Natural feel like native scrolling

### Result:
- ✅ **Mượt mà** (smooth, fluid)
- ✅ Responsive và natural
- ✅ Prevents accidental flips
- ✅ Customizable sensitivity

---

**Status:** Wheel navigation improved ✅
**Method:** Scroll accumulation (threshold: 100, reset: 200ms)
**Feel:** Smooth and natural
**Performance:** No impact
**Last Updated:** 2025-10-07
