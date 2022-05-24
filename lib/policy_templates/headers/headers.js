import * as builder from 'xmlbuilder';

export function headersTemplate(options) {
  const { name } = options;
  const displayName = options.displayName || name;
  const { headers } = options;
  const msg = builder.create('AssignMessage');
  msg.att('name', displayName);
  msg.ele('DisplayName', {}, displayName);
  msg.ele('AssignTo', {
    createNew: false,
    type: options.assignTo || 'request',
  });
  const addHeaders = msg.ele('Set').ele('Headers');
  Object.keys(headers).forEach((header) => {
    addHeaders.ele('Header', { name: header }, headers[header].default);
  });
  const xmlString = msg.end({ pretty: true, indent: '  ', newline: '\n' });
  return xmlString;
}

export function headersGenTemplate(options, name) {
  const templateOptions = options;
  templateOptions.count = options.allow;
  templateOptions.name = name;

  return headersTemplate(templateOptions);
}
