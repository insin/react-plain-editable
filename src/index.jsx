'use strict';

var React = require('react')

var DEFAULT_CONTENTEDITABLE_HTML = '<div><br></div>'

var isIE = (typeof window !== 'undefined' && 'ActiveXObject' in window)

// =================================================================== Utils ===

var brRE = /<br>/g
var linebreaksRE = /\r\n|\r|\n/g

var escapeHTML = (() => {
  var escapeRE = /[&><\u00A0]/g
  var escapes = {'&': '&amp;', '>': '&gt;', '<': '&lt;', '\u00A0': '&nbsp;'}
  var escaper = (match) => escapes[match]
  return (text) => text.replace(escapeRE, escaper)
})()

var unescapeHTML = (() => {
  var unescapeRE = /&(?:amp|gt|lt|nbsp);/g
  var unescapes = {'&amp;': '&', '&gt;': '>', '&lt;': '<', '&nbsp;': '\u00A0'}
  var unescaper = (match) => unescapes[match]
  return (text) => text.replace(unescapeRE, unescaper)
})()

var linebreaksToBr = (() => {
  return (text) => text.replace(linebreaksRE, '<br>')
})()

var brsToLinebreak = (() => {
  return (text) => text.replace(brRE, '\n')
})()

function selectElementText(el) {
  setTimeout(function() {
    var range
    if (window.getSelection && document.createRange) {
      range = document.createRange()
      range.selectNodeContents(el)
      var selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }
    else if (document.body.createTextRange) {
      range = document.body.createTextRange()
      range.moveToElementText(el)
      range.select()
    }
  }, 1)
}

function htmlToText(html) {
  if (html == DEFAULT_CONTENTEDITABLE_HTML) {
    return ''
  }
  return unescapeHTML(brsToLinebreak(html))
}

function textToHTML(text, singleLine) {
  if (singleLine && linebreaksRE.test(text)) {
    text = text.replace(linebreaksRE, ' ')
  }
  return linebreaksToBr(escapeHTML(text))
}

// ====================================================== HTML normalisation ===

// Chrome 40 not wrapping first line when wrapping with block elements
var initialBreaks = /^([^<]+)(?:<div[^>]*><br[^>]*><\/div><div[^>]*>|<p[^>]*><br[^>]*><\/p><p[^>]*>)/
var initialBreak = /^([^<]+)(?:<div[^>]*>|<p[^>]*>)/

var wrappedBreaks = /<p[^>]*><br[^>]*><\/p>|<div[^>]*><br[^>]*><\/div>/g
var openBreaks = /<(?:p|div)[^>]*>/g
var breaks = /<br[^>]*><\/(?:p|div)>|<br[^>]*>|<\/(?:p|div)>/g
var allTags = /<\/?[^>]+>\s*/g
var newlines = /\r\n|\n|\r/g

// Leading and trailing whitespace, <br>s & &nbsp;s
var trimWhitespace = /^(?:\s|&nbsp;|<br[^>]*>)*|(?:\s|&nbsp;|<br[^>]*>)*$/g

/**
 * Normalises contentEditable innerHTML, stripping all tags except <br> and
 * trimming leading and trailing whitespace and causes of whitespace. The
 * resulting normalised HTML uses <br> for linebreaks.
 */
function normaliseContentEditableHTML(html, trim) {
  html = html.replace(initialBreaks, '$1\n\n')
             .replace(initialBreak, '$1\n')
             .replace(wrappedBreaks, '\n')
             .replace(openBreaks, '')
             .replace(breaks, '\n')
             .replace(allTags, '')
             .replace(newlines, '<br>')

  if (trim) {
    html = html.replace(trimWhitespace, '')
  }

  return html
}

// =============================================================== Component ===

var PlainEditable = React.createClass({
  propTypes: {
    autoFocus: React.PropTypes.bool,
    className: React.PropTypes.string,
    component: React.PropTypes.any,
    noTrim: React.PropTypes.bool,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    placeholder: React.PropTypes.string,
    singleLine: React.PropTypes.bool,
    value: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      component: 'div',
      noTrim: false,
      placeholder: '',
      singleLine: false,
      spellCheck: 'false',
      value: ''
    }
  },

  componentDidMount() {
    if (this.props.autoFocus) {
      this.focus()
    }
  },

  focus() {
    this.getDOMNode().focus()
  },

  _onBlur(e) {
    var html = normaliseContentEditableHTML(e.target.innerHTML, !this.props.noTrim)
    this.props.onBlur(e, htmlToText(html))
  },

  _onInput(e) {
    var innerHTML = e.target.innerHTML
    if (!innerHTML) {
      e.target.innerHTML = DEFAULT_CONTENTEDITABLE_HTML
    }

    var html
    if (innerHTML && (this.props.singleLine || this.props.onChange)) {
      html = normaliseContentEditableHTML(innerHTML, !this.props.noTrim)
    }

    // If we're in single-line mode, replace any linebreaks which were pasted in
    // with spaces.
    if (html && this.props.singleLine && brRE.test(html)) {
      html = html.replace(brRE, ' ')
      e.target.innerHTML = html
    }

    if (this.props.onChange) {
      this.props.onChange(e, htmlToText(html))
    }
  },

  _onKeyDown(e) {
    if (this.props.singleLine && e.key == 'Enter') {
      e.preventDefault()
      e.target.blur()
      return
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e)
    }
    if (e.defaultPrevented === true) {
      return
    }
    if (isIE) {
      this._onInput(e)
    }
  },

  _onKeyUp(e) {
    if (this.props.onKeyUp) {
      this.props.onKeyUp(e)
    }
    if (e.defaultPrevented === true) {
      return
    }
    if (isIE) {
      this._onInput(e)
    }
  },

  _onFocus(e) {
    var {target} = e
    var selecting = false
    if (this.props.placeholder && target.innerHTML == this.props.placeholder) {
      selectElementText(target)
      selecting = true
    }
    if (this.props.onFocus) {
      this.props.onFocus(e, selecting)
    }
  },

  render() {
    var {
      autoFocus,
      className, component,
      noTrim,
      onBlur, onChange, onFocus, onKeyDown, onKeyUp,
      placeholder,
      singleLine, spellCheck,
      value,
      ...props
    } = this.props

    var html = value ? textToHTML(value, singleLine) : DEFAULT_CONTENTEDITABLE_HTML

    return <this.props.component
      {...props}
      className={'PlainEditable' + (className ? ' ' + className : '')}
      contentEditable
      dangerouslySetInnerHTML={{__html: html}}
      onBlur={onBlur && this._onBlur}
      onInput={this._onInput}
      onFocus={(onFocus || placeholder) && this._onFocus}
      onKeyDown={(onKeyDown || singleLine || isIE) && this._onKeyDown}
      onKeyUp={(onKeyUp || isIE) && this._onKeyUp}
      spellCheck={spellCheck}
      style={{minHeight: '1em'}}
    />
  }
})

module.exports = PlainEditable