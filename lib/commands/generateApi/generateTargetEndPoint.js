import * as builder from 'xmlbuilder';
import * as fs from 'fs';
import * as path from 'path';

export function generateTargetEndPoint (apiProxy, options, api, cb) {
  let destination = options.destination || path.resolve('api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  const rootDirectory = `${destination  }/${  apiProxy  }/apiproxy`
  const root = builder.create('TargetEndpoint')
  root.att('name', 'default')
  root.ele('Description', {}, api.info.title)
  const preFlow = root.ele('PreFlow', {name: 'PreFlow'})

  // Add steps to preflow.
  const requestPipe = preFlow.ele('Request')
  preFlow.ele('Response')
  for (const service in api['x-a127-services']) {
    const serviceItem = api['x-a127-services'][service]
    if (serviceItem.provider === 'x-headers') {
      if (serviceItem.apply && serviceItem.apply.endPoint.indexOf('target') > -1) {
        if (
          serviceItem.apply &&
          serviceItem.apply.pipe.indexOf('request') > -1 &&
          serviceItem.options.displayName) {
          const step = requestPipe.ele('Step', {})
          step.ele('Name', {}, serviceItem.options.displayName)
        }
      }
    }
  }

  root.ele('Flows', {})

  const postFlow = root.ele('PostFlow', {name: 'PostFlow'})
  postFlow.ele('Request')
  postFlow.ele('Response')

  const httpTargetConn = root.ele('HTTPTargetConnection')

  if (api.openapi) {
    httpTargetConn.ele('URL', {}, api.servers[0].url)
  } else {
    httpTargetConn.ele('URL', {}, `${api.schemes[0]  }://${  api.host  }${api.basePath}`)
  }

  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  fs.writeFile(`${rootDirectory  }/targets/default.xml`, xmlString, (err) => {
    if (err) {
      return cb(err, {})
    }
    cb(null, {})
  })
}
