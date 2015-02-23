'use strict';

var React = require('react')

var isIE = (typeof window !== 'undefined' && 'ActiveXObject' in window)

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

var DEFAULT_CONTENTEDITABLE_HTML = '<div><br></div>'

function returnHTML(html) {
  if (html == DEFAULT_CONTENTEDITABLE_HTML) {
    return ''
  }
  return html
}

/**
 * Normalises contentEditable innerHTML, stripping all tags except <br> and
 * trimming leading and trailing whitespace and causes of whitespace. The
 * resulting normalised HTML uses <br> for linebreaks.
 */
function normaliseContentEditableHTML(html) {
  html = html.replace(initialBreaks, '$1\n\n')
             .replace(initialBreak, '$1\n')
             .replace(wrappedBreaks, '\n')
             .replace(openBreaks, '')
             .replace(breaks, '\n')
             .replace(allTags, '')
             .replace(newlines, '<br>')
             .replace(trimWhitespace, '')
  return html || DEFAULT_CONTENTEDITABLE_HTML
}

var PlainEditable = React.createClass({
  propTypes: {
    autoFocus: React.PropTypes.bool,
    className: React.PropTypes.string,
    component: React.PropTypes.any,
    html: React.PropTypes.string,
    onBlur: React.PropTypes.func,
    onChange: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      component: 'div',
      html: DEFAULT_CONTENTEDITABLE_HTML,
      placeholder: '',
      spellCheck: 'false'
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
    var html = normaliseContentEditableHTML(e.target.innerHTML)
    this.props.onBlur(e, returnHTML(html))
  },

  _onInput(e) {
    var innerHTML = e.target.innerHTML
    if (!innerHTML) {
      e.target.innerHTML = DEFAULT_CONTENTEDITABLE_HTML
    }
    if (this.props.onChange) {
      var html = normaliseContentEditableHTML(innerHTML)
      this.props.onChange(e, returnHTML(html))
    }
  },

  _onKeyDown(e) {
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
      setTimeout(function() {
        var range
        if (window.getSelection && document.createRange) {
          range = document.createRange()
          range.selectNodeContents(target)
          var selection = window.getSelection()
          selection.removeAllRanges()
          selection.addRange(range)
        }
        else if (document.body.createTextRange) {
          range = document.body.createTextRange()
          range.moveToElementText(target)
          range.select()
        }
      }, 1)
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
      html,
      onBlur, onChange, onFocus, onKeyDown, onKeyUp,
      placeholder,
      spellCheck,
      ...props
    } = this.props
    return <this.props.component
      {...props}
      className={'PlainEditable' + (className ? ' ' + className : '')}
      contentEditable
      dangerouslySetInnerHTML={{__html: html || DEFAULT_CONTENTEDITABLE_HTML}}
      onBlur={onBlur && this._onBlur}
      onInput={this._onInput}
      onFocus={(onFocus || placeholder) && this._onFocus}
      onKeyDown={(onKeyDown || isIE) && this._onKeyDown}
      onKeyUp={(onKeyUp || isIE) && this._onKeyUp}
      spellCheck={spellCheck}
      style={{minHeight: '1em'}}
    />
  }
})

module.exports = PlainEditable