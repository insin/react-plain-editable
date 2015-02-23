/*!
 * react-plain-editable 1.1.0 - https://github.com/insin/react-plain-editable
 * MIT Licensed
 */
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.PlainEditable=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null)

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

var PlainEditable = React.createClass({displayName: "PlainEditable",
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

  getDefaultProps:function() {
    return {
      component: 'div',
      html: DEFAULT_CONTENTEDITABLE_HTML,
      placeholder: '',
      spellCheck: 'false'
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
    var html = normaliseContentEditableHTML(e.target.innerHTML)
    this.props.onBlur(e, returnHTML(html))
  },

  _onInput:function(e) {
    var innerHTML = e.target.innerHTML
    if (!innerHTML) {
      e.target.innerHTML = DEFAULT_CONTENTEDITABLE_HTML
    }
    if (this.props.onChange) {
      var html = normaliseContentEditableHTML(innerHTML)
      this.props.onChange(e, returnHTML(html))
    }
  },

  _onKeyDown:function(e) {
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

  render:function() {
    var $__0=
      
       
      
          
      
      
      
      this.props,autoFocus=$__0.autoFocus,className=$__0.className,component=$__0.component,html=$__0.html,onBlur=$__0.onBlur,onChange=$__0.onChange,onFocus=$__0.onFocus,onKeyDown=$__0.onKeyDown,onKeyUp=$__0.onKeyUp,placeholder=$__0.placeholder,spellCheck=$__0.spellCheck,props=(function(source, exclusion) {var rest = {};var hasOwn = Object.prototype.hasOwnProperty;if (source == null) {throw new TypeError();}for (var key in source) {if (hasOwn.call(source, key) && !hasOwn.call(exclusion, key)) {rest[key] = source[key];}}return rest;})($__0,{autoFocus:1,className:1,component:1,html:1,onBlur:1,onChange:1,onFocus:1,onKeyDown:1,onKeyUp:1,placeholder:1,spellCheck:1})
    return React.createElement(this.props.component, React.__spread({}, 
      props, 
      {className: 'PlainEditable' + (className ? ' ' + className : ''), 
      contentEditable: true, 
      dangerouslySetInnerHTML: {__html: html || DEFAULT_CONTENTEDITABLE_HTML}, 
      onBlur: onBlur && this._onBlur, 
      onInput: this._onInput, 
      onFocus: (onFocus || placeholder) && this._onFocus, 
      onKeyDown: (onKeyDown || isIE) && this._onKeyDown, 
      onKeyUp: (onKeyUp || isIE) && this._onKeyUp, 
      spellCheck: spellCheck, 
      style: {minHeight: '1em'}})
    )
  }
})

module.exports = PlainEditable
},{}]},{},[1])(1)
});