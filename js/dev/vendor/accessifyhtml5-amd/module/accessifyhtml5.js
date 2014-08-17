/**jshint
*/

/* global
  define,
  exports,
  module
*/

/**
 * accessifyhtml5.js - v2.0.2 - 2014-01-05
 * https://github.com/michsch/accessifyhtml5.js
 * original: https://github.com/yatil/accessifyhtml5.js
 * Copyright (c) 2013 Eric Eggert, Michael Schulze (AMD wrapper); Licensed MIT license
*/

(function(root, factory, sr) {
  'use strict';
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof root.jQuery === 'function') {
    root.jQuery[sr.toLowerCase()] = factory();
  } else {
    root[sr] = factory();
  }
  return true;
})((typeof window === 'object' && window) || this, function() {
  'use strict';
  return function(defaults, more_fixes) {
    var ATTR_SECURE, Doc, ID_PREFIX, attr, by_match, el_label, elems, error, fix, fixes, i, key, mo, n_label, obj, result, value;
    fixes = {
      article: {
        role: 'article'
      },
      aside: {
        role: 'complementary'
      },
      nav: {
        role: 'navigation'
      },
      main: {
        role: 'main'
      },
      output: {
        'aria-live': 'polite'
      },
      section: {
        role: 'region'
      },
      '[required]': {
        'aria-required': 'true'
      }
    };
    result = {
      ok: [],
      warn: [],
      fail: []
    };
    error = result.fail;
    ATTR_SECURE = new RegExp('aria-[a-z]+|role|tabindex|title|alt|data-[\\w-]+|lang|' + 'style|maxlength|placeholder|pattern|required|type|target|accesskey|longdesc');
    ID_PREFIX = 'acfy-id-';
    n_label = 0;
    Doc = document;
    if (Doc.querySelectorAll) {
      if (defaults) {
        if (defaults.header) {
          fixes[defaults.header] = {
            role: 'banner'
          };
        }
        if (defaults.footer) {
          fixes[defaults.footer] = {
            role: 'contentinfo'
          };
        }
        if (defaults.main) {
          fixes[defaults.main] = {
            role: 'main'
          };
          fixes.main = {
            role: ''
          };
        }
      }
      if (more_fixes && more_fixes._CONFIG_ && more_fixes._CONFIG_.ignore_defaults) {
        fixes = more_fixes;
      } else {
        for (mo in more_fixes) {
          fixes[mo] = more_fixes[mo];
        }
      }
      for (fix in fixes) {
        if (fix.match(/^_(CONFIG|[A-Z]+)_/)) {
          continue;
        }
        if (fixes.hasOwnProperty(fix)) {
          try {
            elems = Doc.querySelectorAll(fix);
          } catch (ex) {
            error.push({
              sel: fix,
              attr: null,
              val: null,
              msg: 'Invalid syntax for `document.querySelectorAll` function',
              ex: ex
            });
          }
          obj = fixes[fix];
          if (!elems || elems.length < 1) {
            result.warn.push({
              sel: fix,
              attr: null,
              val: null,
              msg: 'Not found'
            });
          }
          i = 0;
          while (i < elems.length) {
            for (key in obj) {
              if (obj.hasOwnProperty(key)) {
                attr = key;
                value = obj[key];
                if (attr.match(/_?note/)) {
                  continue;
                }
                if (!attr.match(ATTR_SECURE)) {
                  error.push({
                    sel: fix,
                    attr: attr,
                    val: null,
                    msg: 'Attribute not allowed',
                    re: ATTR_SECURE
                  });
                  continue;
                }
                if (!(typeof value).match(/string|number|boolean/)) {
                  error.push({
                    sel: fix,
                    attr: attr,
                    val: value,
                    msg: 'Value-type not allowed'
                  });
                  continue;
                }
                by_match = attr.match(/(describ|label)l?edby/);
                if (by_match) {
                  try {
                    el_label = Doc.querySelector(value);
                  } catch (ex) {
                    error.push({
                      sel: fix,
                      attr: attr,
                      val: value,
                      msg: "Invalid selector syntax (2) - see 'val'",
                      ex: ex
                    });
                  }
                  if (!el_label) {
                    error.push({
                      sel: fix,
                      attr: attr,
                      val: value,
                      msg: "Labelledby ref not found - see 'val'"
                    });
                    continue;
                  }
                  if (!el_label.id) {
                    el_label.id = ID_PREFIX + n_label;
                  }
                  value = el_label.id;
                  attr = 'aria-' + ('label' === by_match[1] ? 'labelledby' : 'describedby');
                  n_label++;
                }
                if (!elems[i].hasAttribute(attr)) {
                  elems[i].setAttribute(attr, value);
                  result.ok.push({
                    sel: fix,
                    attr: attr,
                    val: value,
                    msg: "Added"
                  });
                } else {
                  result.warn.push({
                    sel: fix,
                    attr: attr,
                    val: value,
                    msg: 'Already present, skipped'
                  });
                }
              }
            }
            i++;
          }
        }
      }
    }
    result.input = fixes;
    return result;
  };
}, 'AccessifyHTML5');
