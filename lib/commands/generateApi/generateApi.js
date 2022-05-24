import parser from 'swagger-parser'
import { EasyZip } from 'easy-zip'
import * as path from 'path'
import { generateSkeleton } from './generateSkeleton.js'
import { generateProxy } from './generateProxy.js'
import { generatePolicies } from './generatePolicies.js'
import { generateProxyEndPoint } from './generateProxyEndPoint.js'
import { generateTargetEndPoint } from './generateTargetEndPoint.js'

export async function generateApi (apiProxy, options) {
  let destination = options.destination || path.resolve('api_bundles')
  if (destination.substring(-1) === '/') {
    destination = destination.substring(0, destination.length - 1)
  }
  const srcDirectory = `${destination}/${apiProxy}/apiproxy/`
  const destDirectory = `${destination}/${apiProxy}/apiproxy.zip`

  const api = await new Promise((res, rej) => {
    parser.parse(options.source, async (err, a) => {
      if (err) rej(err);
      else res(a);
    })
  })

  console.log('Source specification is via: %s %s', (api.openapi ? 'OAS' : 'Swagger'), (api.openapi ? api.openapi : api.swagger))
  console.log('API name: %s, Version: %s', api.info.title, api.info.version)

  await generateSkeleton(apiProxy, options)
  await generateProxy(apiProxy, options, api)
  await generateProxyEndPoint(apiProxy, options, api)
  await generateTargetEndPoint(apiProxy, options, api)
  await generatePolicies(apiProxy, options, api)

  const zip5 = new EasyZip()
  await new Promise((res, rej) => {
    zip5.zipFolder(srcDirectory, (err) => {
      if (err) rej(err);
      else res();
    })
  })

  await new Promise((res, rej) => {
    zip5.writeToFile(destDirectory, (err) => {
      if (err) rej(err);
      else res();
    })
  })
}
