import * as builder from 'xmlbuilder';
import * as fs from 'fs';
import * as path from 'path';

export function generateProxy (apiProxy, options, api, cb) {
  let destination = options.destination || path.resolve('api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  const rootDirectory = `${destination  }/${  apiProxy  }/apiproxy`
  const root = builder.create('APIProxy')
  root.att('revison', 1)
  root.att('name', apiProxy)
  root.ele('CreatedAt', {}, Math.floor(Date.now() / 1000))
  root.ele('Description', {}, api.info.title)
  const proxyEndPoints = root.ele('ProxyEndpoints', {})
  proxyEndPoints.ele('ProxyEndpoint', {}, 'default')
  const targetEndPoints = root.ele('TargetEndpoints', {})
  targetEndPoints.ele('TargetEndpoint', {}, 'default')
  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  fs.writeFile(`${rootDirectory  }/${  apiProxy  }.xml`, xmlString, (err) => {
    if (err) {
      return cb(err, {})
    }
    cb(null, {})
  })
}
