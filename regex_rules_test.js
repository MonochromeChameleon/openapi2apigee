import { readFile } from 'fs/promises';

const print = function print(m1, m2) {
  console.log(m1, m2);
};
const context = {
  setVariable(s, v) {
    console.log(s, v);
  },
  proxyRequest: {
    url: 'http://localhost/bla/x=create function foobar returns',
  },
};

const block = function block(haystack, filters) {
  filters.some((jsonRegex) => {
    // Create a regex from the json string.
    // print('regex',jsonRegex.rule);
    const f = new RegExp(jsonRegex.rule, jsonRegex.flags);
    // print('regex',f);
    const hit = f.exec(haystack);
    if (hit) {
      print('found', hit[0]);
      context.setVariable('FILTER.block', true);
    }
    return hit;
  });
};

readFile('./regex_rules.js', 'utf8')
  .then((rules) => JSON.parse(rules))
  .then((elements) => {
    elements.forEach((element) => {
      const { filters } = element;
      if (element.element === 'QueryParam') {
        if (block(decodeURIComponent(context.proxyRequest.url), filters)) {
          console.log('WHAT');
        }
      }
    });
  });
