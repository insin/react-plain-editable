/*!
 * react-plain-editable 2.0.0 - https://github.com/insin/react-plain-editable
 * MIT Licensed
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.PlainEditable=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null)

var DEFAULT_CONTENTEDITABLE_HTML = '<div><br></div>'

var isIE = (typeof window !== 'undefined' && 'ActiveXObject' in window)

// =================================================================== Utils ===

var brRE = /<br>/g
var linebreaksRE = /\r\n|\r|\n/g

var escapeHTML = (function()  {
  var escapeRE = /[&><\u00A0]/g
  var escapes = {'&': '&amp;', '>': '&gt;', '<': '&lt;', '\u00A0': '&nbsp;'}
  var escaper = function(match)  {return escapes[match];}
  return function(text)  {return text.replace(escapeRE, escaper);}
})()

var unescapeHTML = (function()  {
  var unescapeRE = /&(?:amp|gt|lt|nbsp);/g
  var unescapes = {'&amp;': '&', '&gt;': '>', '&lt;': '<', '&nbsp;': '\u00A0'}
  var unescaper = function(match)  {return unescapes[match];}
  return function(text)  {return text.replace(unescapeRE, unescaper);}
})()

var linebreaksToBr = (function()  {
  return function(text)  {return text.replace(linebreaksRE, '<br>');}
})()

var brsToLinebreak = (function()  {
  return function(text)  {return text.replace(brRE, '\n');}
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

// ====================================================== HTML normalisation ===

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

// Chrome 40 not wrapping first line when wrapping with block elements
var initialBreaks = /^([^<]+)(?:<div[^>]*><br[^>]*><\/div><div[^>]*>|<p[^>]*><br[^>]*><\/p><p[^>]*>)/
var initialBreak = /^([^<]+)(?:<div[^>]*>|<p[^>]*>)/

var wrappedBreaks = /<p[^>]*><br[^>]*><\/p>|<div[^>]*><br[^>]*><\/div>/g
var openBreaks = /<(?:p|div)[^>]*>/g
var breaks = /<br[^>]*><\/(?:p|div)>|<br[^>]*>|<\/(?:p|div)>/g
var allTags = /<\/?[^>]+>/g
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

var PlainEditable = React.createClass({displayName: "PlainEditable",
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

  getDefaultProps:function() {
    return {
      component: 'div',
      noTrim: false,
      placeholder: '',
      singleLine: false,
      spellCheck: 'false',
      value: ''
    }
  },

  componentDidMount:function() {
    if (this.props.autoFocus) {
      this.focus()
    }
  },

  focus:function() {
    this.getDOMNode().focus()
  },

  _onBlur:function(e) {
    var html = normaliseContentEditableHTML(e.target.innerHTML, !this.props.noTrim)
    this.props.onBlur(e, htmlToText(html))
  },

  _onInput:function(e) {
    var html = e.target.innerHTML

    // Don't allow innerHTML to become completely empty - causes shrinkage in FF
    if (!html) {
      e.target.innerHTML = DEFAULT_CONTENTEDITABLE_HTML
    }

    if (html && (this.props.singleLine || this.props.onChange)) {
      html = normaliseContentEditableHTML(html, !this.props.noTrim)
    }

    // If we're in single-line mode, replace any linebreaks which were pasted in
    // with spaces.
    if (html && this.props.singleLine && brRE.test(html)) {
      html = html.replace(brRE, ' ')
    }

    if (this.props.onChange) {
      this.props.onChange(e, htmlToText(html))
    }
  },

  _onKeyDown:function(e) {
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

  _onKeyUp:function(e) {
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

  _onFocus:function(e) {
    var $__0=  e,target=$__0.target
    var selecting = false
    if (this.props.placeholder && target.innerHTML == this.props.placeholder) {
      selectElementText(target)
      selecting = true
    }
    if (this.props.onFocus) {
      this.props.onFocus(e, selecting)
    }
  },

  render:function() {
    var $__0=
      
       
      
          
      
       
      
      
      this.props,autoFocus=$__0.autoFocus,className=$__0.className,component=$__0.component,noTrim=$__0.noTrim,onBlur=$__0.onBlur,onChange=$__0.onChange,onFocus=$__0.onFocus,onKeyDown=$__0.onKeyDown,onKeyUp=$__0.onKeyUp,placeholder=$__0.placeholder,singleLine=$__0.singleLine,spellCheck=$__0.spellCheck,value=$__0.value,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{autoFocus:1,className:1,component:1,noTrim:1,onBlur:1,onChange:1,onFocus:1,onKeyDown:1,onKeyUp:1,placeholder:1,singleLine:1,spellCheck:1,value:1})

    var html = value ? textToHTML(value, singleLine) : DEFAULT_CONTENTEDITABLE_HTML

    return React.createElement(this.props.component, React.__spread({}, 
      props, 
      {className: 'PlainEditable' + (className ? ' ' + className : ''), 
      contentEditable: true, 
      dangerouslySetInnerHTML: {__html: html}, 
      onBlur: onBlur && this._onBlur, 
      onInput: this._onInput, 
      onFocus: (onFocus || placeholder) && this._onFocus, 
      onKeyDown: (onKeyDown || singleLine || isIE) && this._onKeyDown, 
      onKeyUp: (onKeyUp || isIE) && this._onKeyUp, 
      spellCheck: spellCheck, 
      style: {minHeight: '1em'}})
    )
  }
})

module.exports = PlainEditable
},{}]},{},[1])(1)
});