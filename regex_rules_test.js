import { readFile } from 'fs/promises';

var print = function (m1, m2) {
  console.log(m1, m2)
}
var context = {
  setVariable: function (s, v) {
    console.log(s, v)
  },
  proxyRequest: {
    url: 'http://localhost/bla/x=create function foobar returns'
  }
}

var block = function (haystack, filters) {
  filters.some(function (jsonRegex) {
    // Create a regex from the json string.
    // print('regex',jsonRegex.rule);
    var f = new RegExp(jsonRegex.rule, jsonRegex.flags)
    // print('regex',f);
    var hit = f.exec(haystack)
    if (hit) {
      print('found', hit[0])
      context.setVariable('FILTER.block', true)
      return true
    }
  })
}

readFile('./regex_rules.js', 'utf8').then((rules) => JSON.parse(rules)).then((elements) => {
  elements.forEach(function (element) {
    var filters = element.filters
    if (element.element === 'QueryParam') {
      if (block(decodeURIComponent(context.proxyRequest.url), filters)) {
        return
      }
    }
  });
});


