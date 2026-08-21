# Portfolio-26

# MyOS Portfolio — Debugging & Concepts Log

A running record of the bugs we hit and the underlying JS/CSS concepts behind each fix, in the order we covered them.

---

## 1. Inline styles beat CSS classes — always

**The bug:** `menuClose` wasn't closing the start menu, even though the click listener was firing correctly.

**The cause:** an element's own `style="..."` attribute (inline style) always overrides rules coming from a class or stylesheet, regardless of CSS specificity tricks or source order. If something sets `element.style.display = 'flex'` once, no `classList.toggle()` or `.some-class { display: none }` rule can undo it later — the inline style just wins.

**Where it bit us again:**
- `start-btn`'s `onclick="...style.display = 'flex'"` fighting the class-based JS toggle
- `<div id="win-browser" style="...display:none;">` baked into the HTML, silently blocking `classList.add('active')` from ever showing the window
- The browser window's third close listener setting `style.display = 'none'` directly, permanently overriding the class system so the window could never reopen

**The rule to keep:** pick **one** system per element — either inline styles or classes, never both. For anything toggled open/closed, classes are almost always the better choice because they're overridable and inspectable.

---

## 2. `display` can't be animated

**The bug:** menu/window CSS had `@keyframes` written, but open/close still snapped instantly with no animation.

**The cause:** `display: none` removes an element from layout on the same frame it's applied — there's no intermediate state for the browser to animate through. Transitions and animations need a property that can have in-between values.

**The fix pattern:** stop toggling `display`. Keep the element permanently `display: flex`, and animate `opacity` + `transform` instead. Use `visibility` + `pointer-events: none` to fully disable it when "closed" (so it can't be focused/clicked), and delay the `visibility` flip using a transition so it happens *after* the fade-out finishes:

```css
.thing {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity .18s ease, transform .18s ease, visibility 0s linear .18s;
}
.thing.open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition: opacity .18s ease, transform .18s ease, visibility 0s linear 0s;
}
```

Applied this same pattern to: the start menu, and every `.window`.

---

## 3. Duplicate event listeners silently fight each other

**The bug:** the browser window would open the first time, but after closing it once, it would never reopen.

**The cause:** the same close button had **three separate `addEventListener` calls** attached to it from three different places in the code — one from a generic loop, one from the `data-action` handler, and one from an inline `<script>` at the bottom of the HTML targeting the browser window specifically. All three fired on every click. One of them used `style.display = 'none'` (see concept #1), which permanently blocked the class-based system used everywhere else.

**How to catch this:** search the whole codebase for every place a given element/selector gets `addEventListener` attached. If it's more than once for the same interaction, that's a red flag — pick one owner.

**The pattern we landed on:** a single `data-action="close"` handler per button, plus an optional **hook** system (`WindowManager.beforeClose[id]`) so one module (e.g. `browser.js`) can intercept and cancel a close (to shut extra tabs first) without needing its own separate listener on the same button.

---

## 4. Undefined functions fail silently (until they don't)

**The bug:** minimize/close referenced `windows[id]`, `closeWindow()`, `focusWindow()`, `updateTaskbar()` — none of which existed anywhere in the code.

**The lesson:** JavaScript won't warn you at "compile time" the way some languages do. A call to an undefined function only throws when that exact line actually runs — so a broken button might sit unnoticed for a while if nobody clicks it during testing. Always check the browser console (`F12` → Console tab) after wiring up new interactions; `ReferenceError` there means something's called but never defined.

---

## 5. Splitting one big JS file by responsibility

**The problem:** all the bugs above kept happening because unrelated features (start menu, browser tabs, file finder, window chrome) lived in one file, making it easy to forget a listener already existed and add a conflicting second one.

**The pattern:**
- `window-manager.js` — the *only* file allowed to touch `.active`, z-index, or position on `.window` elements
- `start-menu.js` — owns the About menu only
- `browser.js` — owns tab state *inside* the browser window, never touches the window's own open/close class directly
- `file-finder.js` — owns the sidebar panels
- `clock.js` — one job, fully standalone
- `app.js` — just the entry point / sanity check that other modules loaded

**Rule of thumb:** if two files need to affect the same DOM element, one of them should expose a small API (`window.WindowManager = { open, close, ... }`) instead of the other file reaching in and toggling classes/styles directly. This is basically the "single responsibility principle" applied to a plain JS + HTML project (no framework needed to get the benefit).

---

## 6. Adding a new tab without touching unrelated code

**The task:** adding a 3rd browser tab ("How It Works").

**Why it didn't conflict with anything:** the existing `closeTab()`, close-button wiring, and the `beforeClose` hook were all written generically — operating on *whichever* tab ID was passed in, never hardcoded to `'tab-2'`. Because of that, tab-3 got the close/reopen behavior "for free" just by mirroring the existing tab-2 functions (`openHowItWorksTab`, a new `switchToTab` branch, a new `ShowOnlyB` branch).

**Takeaway:** writing functions to take an ID/parameter instead of hardcoding a specific element pays off the moment you need a second or third instance of the same pattern.

---

## 7. `user-select: none` and cascade order

**The bug:** text was selectable in the browser window despite a global `* { user-select: none; }` reset.

**The cause (possible):** a later-loaded stylesheet re-enabling it for a more specific selector, and/or missing vendor prefixes (`-webkit-user-select`) for stricter browser engines.

**How to actually debug CSS "why is this rule not applying" questions:** right-click the element → Inspect → look at the **Styles panel** in DevTools. It shows every matching rule and which one is winning (struck-through rules lost the cascade). This is faster than guessing from reading the CSS files.

---

## 8. CSS media queries run before JavaScript

**The task:** block phones/tablets from the desktop simulation with a "please use a PC" message, with zero flash of the real UI first.

**Why CSS-only (not JS-based `navigator.userAgent` sniffing):** JS only runs after the page has already started rendering, so a JS check would show the full desktop for a split second before hiding it. A CSS media query applies before first paint, so there's no flash — and it works even if JavaScript fails to load at all.

```css
@media (max-width: 1023px), (pointer: coarse) and (max-width: 1366px) {
    #desktop { display: none !important; }
    #mobile-block { display: flex !important; }
}
```

`pointer: coarse` specifically detects touch input (finger vs. mouse), which is more reliable for "is this actually a phone/tablet" than screen width alone — a narrow desktop browser window shouldn't be blocked, but an iPad in landscape should be.

---

## 9. Using a shared "state" class on `<body>` to coordinate UI

**The task:** hide the menubar whenever any window is maximized.

**The pattern:** rather than reaching into the menubar's styles from inside the maximize function, `window-manager.js` tracks maximized windows in a `Set` and toggles one class on `<body>`:

```js
document.body.classList.toggle('has-maximized-window', maximizedWindows.size > 0);
```

Then CSS reacts to that class:

```css
body.has-maximized-window #menubar {
    display: none;
}
```

**Why this is a good pattern generally:** it decouples "what triggers the state" from "what the state looks like." Any future feature that also needs to know "is something maximized right now" can just check for that body class — no need to hunt through `window-manager.js` internals. It's the same idea as a global flag, but scoped through the DOM instead of a JS variable, so CSS can react to it directly with zero JS needed on the styling side.

**A related detail we had to handle:** if a maximized window gets *closed* (not un-maximized first), the state has to be cleaned up too — otherwise `has-maximized-window` stays stuck forever. Any time you track "state" like this, make sure every exit path (close, minimize, browser back button, etc.) also clears it.

---

## Quick-reference: recurring debugging checklist

When something "isn't working" in vanilla JS/CSS UI code, check in this order:

1. **Inline style vs class conflict** — inspect the element in DevTools; is there a `style="..."` attribute overriding your class?
2. **Duplicate listeners** — search the codebase for every `addEventListener` on the same selector/element.
3. **Undefined function calls** — check the browser console for `ReferenceError`.
4. **Cascade/specificity** — DevTools Styles panel shows exactly which rule is winning and why.
5. **Timing** — is the element even in the DOM yet when the script runs? (`DOMContentLoaded`, script order in `<head>` vs bottom of `<body>`)
