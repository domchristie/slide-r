# slide-r

A minimalist web component for building horizontal sliding user interfaces.

## Features

- Touch-slideable
- Smooth scrollable
- <span title="Responsive">Device-size adaptable</span>
- <span title="Bring Your Own Controls">Easily controllable</span>

## Usage

Include the `slide-r.js` script in your project, then in your HTML:

```html
<slide-r>
  <article>Content</article>
  <article>Content</article>
  <article>Content</article>
  <article>Content</article>
</slide-r>
```
Each `article` will be positioned horizontally in a scrollable container, which will "snap" to center the nearest element. (`article`s are used here, but you can use any element.)

## Methods

### `goTo(indexOrElement)`

Scroll to the element at the given index, or to the element itself. For example:

```js
const slider = document.querySelector('slide-r`)
slider.goTo(1) // Scroll to the second element
slider.goTo(slider.children[0]) // Scroll to the first element
```

## Events

### `change`

Triggered when an element enters or leaves the scroll viewport. An [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) is used behind the scenes with default threshold of 0.8.

#### `event.details`

Metadata for each `change` event is included in `event.details`

| Property | Type | Description |
| :-- | :-- | :-- |
| `isStart` | Boolean | `true` if the first element is in the scroll viewport |
| `isEnd` | Boolean | `true` if the last element is in the scroll viewport |
| `activeItems` | Array | Lists the items that are visible in the scroll viewport. Each item is an object with `element` and `index` properties |
| `activeItem` | Object or null | An item which is considered to be the _most active_ (given that more than one element can be active in the scroll viewport) |
| `entries` | Array | Lists the Intersection Observer Entries |

## Example: Bring Your Own Controls

Aside from setting up the touch-slideable, scroll snapping styles, `slide-r` does not provide any user interface controls. The following walks through creating "next/previous" controls.

Start with the HTML:

```html
<slide-r>
  <article>Content</article>
  <article>Content</article>
  <article>Content</article>
  <article>Content</article>
</slide-r>
<button id="previous">Previous</button>
<button id="next">Next</button>
```

Then some styles to only show the buttons when the web component is defined:

```css
#next,
#previous {
  display: none;
}

slide-r:defined ~ #next,
slide-r:defined ~ #previous {
  display: inline-block;
}

article {
  text-align: center;
  border: 1px solid;
}
```

And finally, a script to add the behavior:

```js
const slider = document.querySelector('slide-r')
const previous = document.getElementById('previous')
const next = document.getElementById('next')

// Store the active element index
let activeIndex = 0

slider.addEventListener('change', ({ detail }) => {
  // Set the active index if it exists
  if (detail.activeItem) activeIndex = detail.activeItem.index

  // Disable previous/next buttons when at the start/end
  previous.disabled = detail.isStart
  next.disabled = detail.isEnd
})

// Handle previous/next navigation
previous.onclick = () => slider.goTo(activeIndex - 1)
next.onclick = () => slider.goTo(activeIndex + 1)
```

## Browser Support

[Web components](https://caniuse.com/custom-elementsv1), [CSS Scroll Snap](https://caniuse.com/css-snappoints) and [Scroll-behavior](https://caniuse.com/css-scroll-behavior) have broad support. Safari iOS does not yet support smooth scrolling: `goTo` will scroll the `slide-r,` but will not animate it :(

---

Copyright © 2021+ Dom Christie and released under the MIT license.
