// MIT License
// -----------
//
// Copyright (c) 2021 Dom Christie
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

;(function () {
  const template = document.createElement('template')
  template.innerHTML = `
<style>
  :host {
    overflow-x: scroll;
    display: flex;

    /* Enable Safari touch scrolling physics */
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  ::slotted(*) {
    min-width: 80%;
  }

  @supports (scroll-snap-align: start) {
    /* modern scroll snap points */
    :host {
      scroll-snap-type: x mandatory;
    }
    ::slotted(*) {
      scroll-snap-align: center;
    }
  }

  @supports not (scroll-snap-align: start) {
    /* old scroll snap points spec */
    :host {
      -webkit-scroll-snap-type: mandatory;
              scroll-snap-type: mandatory;
      -webkit-scroll-snap-destination: center;
              scroll-snap-destination: center;
    }

    ::slotted(*) {
      scroll-snap-coordinate: center;
    }
  }
</style>
<slot></slot>`

  class Slider extends HTMLElement {
    constructor () {
      super()
      this.attachShadow({ mode: 'open' })
      this.shadowRoot.appendChild(template.content.cloneNode(true))
      this.observer = new IntersectionObserver(this.onintersect.bind(this), {
        root: this,
        threshold: this.threshold
      })
      this.activeItems = []
    }

    connectedCallback () {
      this._onslotchange = (event) => this.onslotchange(event)
      this.slot.addEventListener('slotchange', this._onslotchange)
    }

    get threshold () {
      return JSON.parse(this.getAttribute('threshold')) || 0.8
    }

    goTo (indexOrElement) {
      const element = (
        typeof indexOrElement === 'number' ?
          this.children[indexOrElement] :
          indexOrElement
      )
      if (!element) throw new ReferenceError('cannot find element to scroll to')

      const left = element.offsetLeft - ((this.clientWidth - element.offsetWidth) / 2)
      if (supportsSmoothScroll) {
        this.scrollTo({ left, behavior: 'smooth' })
      } else {
        this.scrollLeft = left
      }
    }

    get slot () {
      return this.shadowRoot.querySelector('slot')
    }

    onintersect (entries) {
      const children = Array.from(this.children)

      entries.forEach((entry) => {
        entry.isIntersecting ? this.activate(entry) : this.deactivate(entry)
      })

      this.dispatch('change', {
        detail: {
          isStart: this.isStart,
          isEnd: this.isEnd,
          activeItems: this.activeItems,
          activeItem: this.activeItem,
          entries
        }
      })
    }

    activate (entry) {
      this.activeItems.push({
        element: entry.target,
        index: Array.from(this.children).indexOf(entry.target),
        entry
      })
    }

    deactivate (entry) {
      const index = this.activeItems.indexOf(
        this.activeItems.find(a => a.element === entry.target)
      )
      if (index !== -1) this.activeItems.splice(index, 1)
    }

    get isStart () {
      return this.activeItems.some(a => a.index === 0)
    }

    get isEnd () {
      return this.activeItems.some(a => a.index === this.children.length - 1)
    }

    get activeItem () {
      if (!this.activeItems.length) return null

      return this.activeItems.reduce((previous, item) => {
        if (this.isEnd) {
          return (item.index < previous.index) ? item : previous
        } else {
          return (item.index > previous.index) ? item : previous
        }
      })
    }

    onslotchange () {
      this.observer.disconnect()
      Array.from(this.children).forEach(
        element => this.observer.observe(element)
      )
    }

    dispatch (eventName, { detail = {}, bubbles = true, cancelable = false } = {}) {
      const event = new CustomEvent(eventName, { detail, bubbles, cancelable })
      this.dispatchEvent(event)
      return event
    }

    disconnectedCallback () {
      this.observer.disconnect()
      this.observer = undefined
      this.slot.removeEventListener('slotchange', this._onslotchange)
    }
  }

  const supportsSmoothScroll = (function () {
    let supports = false
    try {
      let div = document.createElement('div')
      div.scrollTo({
        top: 0,
        get behavior () {
          supports = true
          return 'smooth'
        }
      })
    } catch (err) {}
    return supports
  })()

  customElements.define('slide-r', Slider)
})()
