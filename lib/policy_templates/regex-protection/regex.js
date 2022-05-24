import * as builder from 'xmlbuilder';
import * as path from 'path';
import * as fs from 'fs';

/*
  Reguired format of the json file:

  [{
    "element": "Header",
    "filters": [{
      "flags": "i",
      "rule": "(?:<script.*?>)"
    }, {
      "flags": "i",
      "rule": "(?:<style.*?>.*?((@[i\\\\\\\\])|(([:=]|(&#x?0*((58)|(3A)|(61)|(3D));?)).*?([(\\\\\\\\]|(&#x?0*((40)|(28)|(92)|(5C));?)))))"
    }],
    "name": "Cookie"
    }, {
    "element": "XMLPayload",
    "filters": [{
      "flags": "i",
      "rule": "(?:<script.*?[ /+\\t]*?((src)|(xlink:href)|(href))[ /+\\t]*=)"
    }, {
      "flags": "i",
      "rule": "(?:<[i]?frame.*?[ /+\\t]*?src[ /+\\t]*=)"
    }],
    "name": null
    }, {
    "element": "QueryParam",
    "filters": [{
      "flags": "i",
      "rule": "([\\s\\\"'`;\\/0-9\\=]+on\\w+\\s*=)"
    }, {
      "flags": "i",
      "rule": "(?:(?:procedure\\s+analyse\\s*?\\()|(?:;\\s*?(declare|open)\\s+[\\w-]+)|(?:create\\s+(procedure|function)\\s*?\\w+\\s*?\\(\\s*?\\)\\s*?-)|(?:declare[^\\w]+[@#]\\s*?\\w+)|(exec\\s*?\\(\\s*?@))"
    }, {
      "flags": "i",
      "rule": "(?:(?:create\\s+function\\s+\\w+\\s+returns)|(?:;\\s*?(?:select|create|rename|truncate|load|alter|delete|update|insert|desc)\\s*?[\\[(]?\\w{2,}))"
    }],
    "name": ".*"
  }]

*/

export function regularExpressions () {
  const regexFile = path.join(process.cwd(), 'regex_rules.json')
  const regex = fs.readFileSync(regexFile, 'utf8');
  return JSON.parse(regex);
}

export function regexTemplate (options) {
  const continueOnError = options.continueOnError || 'true'
  const enabled = options.enabled || 'true'
  const {name} = options
  const displayName = options.displayName || name
  const msg = builder.create('Javascript')
  msg.att('continueOnError', continueOnError)
  msg.att('enabled', enabled)
  msg.att('timeLimit', '200')
  msg.att('name', displayName)
  msg.ele('DisplayName', {}, displayName)
  msg.ele('Properties', {})
  msg.ele('ResourceURL', `jsc://${  name  }.js`)
  msg.ele('IncludeURL', 'jsc://regex.js')
  msg.ele('IncludeURL', `jsc://${  name  }-querystring.js`)
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' })
  return xmlString
}

export function regexGenTemplate (options, name) {
  const templateOptions = options
  templateOptions.count = options.allow
  templateOptions.name = name

  return regexTemplate(templateOptions)
}
