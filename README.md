# react-plain-editable

A `PlainEditable` [React](http://facebook.github.io/react) component which uses
`contentEditable` to edit plain text.

**Note:** `contentEditable` seems like an inconsistent mess across browsers and
this has only been tested in the latest stable Firefox (35), Chrome (40) and
Internet Explorer (11) with a `<div>` container with an unaltered CSS `display`
style.

Pull requests and compatilbility issue reports to help improve this component
are welcome!

## [Live Demo](http://insin.github.io/react-plain-editable/)

You can also see `PlainEditable` in action in
[ideas-md](http://insin.github.io/ideas-md), a float-to-the-top ideas log app.

## Install

### npm

`PlainEditable` can be used on the server, or bundled for the client using an
npm-compatible packaging system such as [Browserify](http://browserify.org/) or
[webpack](http://webpack.github.io/).

```
npm install react-plain-editable --save
```

### Browser bundle

The browser bundle exposes a global `PlainEditable` variable and expects to find a
global `React` variable to work with.

You can find it in the [/dist directory](https://github.com/insin/react-plain-editable/tree/master/dist).

## Usage

Provide `PlainEditable` with at least an `onBlur` or an `onChange` callback
function to get input data back at the desired time, and provide any initial
value as a `value` prop.

```html
var Editor = React.createClass({
  _onBlur(e, value) {
    this.props.onChange(value)
  },

  render() {
    <PlainEditable onBlur={this._onBlur} value={this.props.value}/>
  }
})
```

For Internet Explorer (and any other browser which generates `<p>` elements in a
`contentEditable`), you must set up a CSS rule to make `<p>` elements have the
same visual effect as a `<br>`:

```css
.PlainEditable p {
  margin: 0;
}
```

## API

### `PlainEditable` component

`PlainEditable` is implemented as an "uncontrolled" component which uses
`contentEditable` to edit a given value - i.e. changes to the initial `value`
prop passed to it will not be reflected.

It expects to be given a plain text value and will provide edited input back as
plain text via its `onBlur` and `onChange` callbacks.

Leading & trailing whitespance is trimmed in the returned text by default. This
can be disabled by using the `noTrim` prop.

Multi-line editing is enabled by default. You can restrict editing to a single
line by using the `singleLine` prop.

The component attempts to work around the most obvious `contentEditable` quirks,
but bugs are likely due to the nature of how `contentEditable` has been
implemented across various browsers.

#### Props

*Note: any props passed in addition to those documented below will be passed to
the component created in `PlainEditable`'s `render()` method - if you need to
give your `contentEditable` an `id`, `data-`, or any other additional props,
just pass them as you normally would.*

##### `value: String`

Initial value to be displayed in the `contentEditable`.

`PlainEditable` is currently implemented as an "uncontrolled" component - i.e.
changes to the initial `value` prop given to it will not be reflected in the
`contentEditable`.

##### `onBlur: Function(event: SyntheticEvent, value: String)`
##### `onChange: Function(event: SyntheticEvent, value: String)`

These callback props are used to receive edited values from the
`contentEditable` via the `value` argument when the appropriate event fires.

If `onChange` is given, the `input` event is used to trigger the callback on
every change.

Since Internet Explorer doesn't currently support `input` on `contentEditable`s,
the `keydown` and `keyup` events are used to trigger the `onChange` callback for
it instead.

##### `autoFocus: Boolean`

If `true` when the component mounts, the `contentEditable` will be given focus.

##### `className: String`

An additional CSS class to append to the default `PlainEditable` CSS class.

##### `component: String|ReactCompositeComponent` (default: `'div'`)

The HTML tag name or React component to be created for use as a
`contentEditable` in `PlainEditable`'s `render()` method.

##### `noTrim: Boolean`

Pass this prop to disable trimming of leading and trailing whitespace in text
passed to the `onBlur` and `onChange` callbacks.

```html
<PlainEditable onBlur={this._onBlur} noTrim/>
```

##### `onFocus: Function(event: SyntheticEvent, selecting: Boolean)`

This callback prop is accepted because this event is already used with the
`contentEditable` to implement selection of `placeholder` content.

The `selecting` argument will be `true` if the `contentEditable`'s contents will
be selected after giving the browser a chance to complete other operations.

##### `onKeyDown: Function(event: SyntheticEvent)`
##### `onKeyUp: Function(event: SyntheticEvent)`

These callback props are accepted because these events are already used with the
`contentEditable` to make `onChange` work in IE.

If you're using IE and you prevent the evant's default action using
`event.preventDefault()`, `onChange` will not be triggered.

##### `placeholder: String`

If provided, the contents of the `contentEditable` will be selected if they
match this prop when it gains focus.

This can be used to make it more convenient for users to edit an initial value
you provide as a placeholder.

##### `singleLine: Boolean`

Pass this prop to disable entry of linebreaks into the `contentEditable` by
pressing the Enter key, will force a `blur()`.

Linebreaks can still be pasted in, but will be replaced with spaces in text
passed to the `onBlur` and `onChange` callbacks.

```html
<PlainEditable onBlur={this._onBlur} singleLine/>
```

##### `spellcheck: String` (default: `'false'`)

Coinfig for the `contentEditable`'s `spellcheck` prop, which is disabled by
default.

#### Methods

##### `focus()`

Gives focus to the `contentEditable` DOM node.

## MIT Licensed