## master

Added a `noTrim` boolean prop to disable trimming of leading and trailing
whitespace in text passed to the `onBlur` and `onChange` callbacks.

**Breaking change:** replaced `html` prop with `value` prop.

Plain text should be passed for the new `value` prop.

The component will handle creating an HTML representation of the text for
display in the `contentEditable`.

**Breaking change:** the value passed to `onBlur()` and `onChange()` callbacks
is now converted to plain text with linebreaks and non-breaking space characters
where appropriate to preserve whitespace. Any HTML present in the value will no
longer be escaped.

Value returned pre-2.0.0:

```
1<br><br>&nbsp;&nbsp;&lt;2&gt;<br><br>3
```

Value returned in 2.0.0:

```
1

  <2>

3
```

## 1.1.0 / 2015-02-23

Added an `autoFocus` prop to give focus to the `contentEditable` when the
component first mounts.

Added a `focus()` method to give focus to the `contentEditable` DOM node.

## 1.0.1 / 2015-02-20 / Like a frightened turtle

Fixed shrinkage when empty in FF and IE - now ensures default `innerHTML` is set
if the `contentEditable` becomes empty.

## 1.0.0 / 2015-02-19 / Ye release

Initial release.