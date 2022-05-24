import { create } from 'xmlbuilder';
import { writeFile } from 'fs/promises';
import * as serviceUtils from '../../util/service.js';
import { join, resolve } from 'path'

export async function generateProxyEndPoint (apiProxy, { destination = resolve('api_bundles'), basepath, virtualhosts }, api) {
  let useCors
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const root = create('ProxyEndpoint')
  root.att('name', 'default')
  root.ele('Description', {}, api.info.title)
  let preFlow = root.ele('PreFlow', {name: 'PreFlow'})

  // Add steps to preflow.
  let raiseFaultName
  let requestPipe = preFlow.ele('Request')
  let responsePipe = preFlow.ele('Response')
  const services = serviceUtils.servicesToArray(api)
  services.forEach((serviceItem) => {
    if (serviceItem.provider === 'x-cors') {
      useCors = serviceItem.name
      const step = responsePipe.ele('Step', {})
      step.ele('Name', {}, serviceItem.name)
      step.ele('Condition', {}, 'request.verb != "OPTIONS"')
    }
    if (serviceItem.provider === 'x-input-validation' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('request') > -1 &&
          serviceItem.options.displayName) {
        const step = requestPipe.ele('Step', {})
        step.ele('Name', {}, 'Extract Path Parameters')
        const step2 = requestPipe.ele('Step', {})
        step2.ele('Name', {}, serviceItem.options.displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseInputValidationFault' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('request') > -1 &&
          serviceItem.options.displayName) {
        raiseFaultName = serviceItem.options.displayName
        const step = requestPipe.ele('Step', {})
        step.ele('Condition', {}, '(INPUT.error equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
    if (serviceItem.provider === 'x-regex-protection' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('request') > -1 &&
          serviceItem.options.displayName) {
        const step = requestPipe.ele('Step', {})
        step.ele('Name', {}, serviceItem.options.displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseFault' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('request') > -1 &&
          serviceItem.options.displayName) {
        raiseFaultName = serviceItem.options.displayName
        const step = requestPipe.ele('Step', {})
        step.ele('Condition', {}, '(FILTER.block equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
  })

  const flows = root.ele('Flows', {})

  if (useCors) {
    preFlow = flows.ele('Flow', { name: 'OptionsPreFlight' })
    preFlow.ele('Condition', {}, 'request.verb == "OPTIONS"')
    preFlow.ele('Request')
    const preFlowResponse = preFlow.ele('Response')
    const requestStep = preFlowResponse.ele('Step')
    requestStep.ele('Name', {}, useCors)
  }

  const allowedVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT', 'PATCH']
  for (const apiPath in api.paths) {
    for (const resource in api.paths[apiPath]) {
      if (allowedVerbs.indexOf(resource.toUpperCase()) >= 0) {
        const resourceItem = api.paths[apiPath][resource]
        resourceItem.operationId = resourceItem.operationId || `${resource.toUpperCase()  } ${  apiPath}`
        const flow = flows.ele('Flow', {name: resourceItem.operationId})
        const flowCondition = `(proxy.pathsuffix MatchesPath &quot;${  apiPath  }&quot;) and (request.verb = &quot;${  resource.toUpperCase()  }&quot;)`
        flow.ele('Condition').raw(flowCondition)
        flow.ele('Description', {}, resourceItem.summary)
        requestPipe = flow.ele('Request')

        // Add conditions for parameters.
        if (raiseFaultName && resource.toUpperCase() === 'GET' && resourceItem.parameters) {
          const {parameters} = resourceItem
          let paramCondition = ''
          let cnt = 0
          parameters.forEach((param) => {
            if (param.required && param.in === 'query') {
              const op = (cnt > 0) ? ' or ' : ''
              paramCondition += `${op  }(request.queryparam.${  param.name  } Equals null)`
              cnt++
            }
            // if (param.required && param.in === 'path') {
            //   var op = (cnt > 0) ? ' or ' : '';
            //   paramCondition +=  op + '(request.queryparam.' + param.name + ' Equals null)';
            //   cnt++;
            // }
          })
          if (paramCondition.length > 0) {
            const requestStep = requestPipe.ele('Step')
            requestStep.ele('Condition').raw(paramCondition)
            requestStep.ele('Name', {}, raiseFaultName)
          }
        }

        responsePipe = flow.ele('Response')
        if (resourceItem['x-a127-apply']) {
          for (const service in resourceItem['x-a127-apply']) {
            if (resourceItem['x-a127-apply'][service].endPoint.indexOf('proxy') > -1) {
              if (resourceItem['x-a127-apply'][service].pipe.indexOf('request') > -1) {
                const step = requestPipe.ele('Step', {})
                step.ele('Name', {}, service)
              }
              if (resourceItem['x-a127-apply'][service].pipe.indexOf('response') > -1) {
                const step = responsePipe.ele('Step', {})
                step.ele('Name', {}, service)
              } // pipe request / response if ends here
            }  // proxy check ends here
          } // for loop ends here
        } // check for normal policies ends here
        // Check for Security Policies in a-127
        if (resourceItem.security) {
          for (const security in resourceItem.security) {
            for (const stepName in resourceItem.security[security]) {
              if (stepName === 'oauth2' || stepName === 'apiKeyHeader' || stepName === 'apiKeyQuery') {
                // Attach verify access token policy..
                const step = requestPipe.ele('Step', {})
                step.ele('Name', {}, 'verifyAccessToken')
              }
            }
          }
        }
      }  // methods check ends here
    }  // for loop for resources ends here
  }  // for loop for paths ends here

  const postFlow = root.ele('PostFlow', {name: 'PostFlow'})
  postFlow.ele('Request')
  const postFlowPipe = postFlow.ele('Response')

  for (const srv in api['x-a127-services']) {
    const serviceItem = api['x-a127-services'][srv]
    if (serviceItem.provider === 'x-output-validation' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('response') > -1 &&
          serviceItem.options.displayName) {
        const step = postFlowPipe.ele('Step', {})
        step.ele('Name', {}, serviceItem.options.displayName)
      }
    }
    if (serviceItem.provider === 'x-raiseOutputValidationFault' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('response') > -1 &&
          serviceItem.options.displayName) {
        raiseFaultName = serviceItem.options.displayName
        const step = postFlowPipe.ele('Step', {})
        step.ele('Condition', {}, '(SCHEMA.error equals true)')
        step.ele('Name', {}, raiseFaultName)
      }
    }
    if (serviceItem.provider === 'x-headers' &&
        serviceItem.apply.endPoint.indexOf('proxy') > -1) {
      if (serviceItem.apply.pipe.indexOf('response') > -1 &&
          serviceItem.options.displayName) {
        raiseFaultName = serviceItem.options.displayName
        const step = postFlowPipe.ele('Step', {})
        // step.ele('Condition', {}, '(SCHEMA.error equals true)');
        step.ele('Name', {}, raiseFaultName)
      }
    }
  }

  const httpProxyConn = root.ele('HTTPProxyConnection')
  if (basepath) {
    httpProxyConn.ele('BasePath', {}, basepath)
  } else if (api.basePath !== undefined) {
    httpProxyConn.ele('BasePath', {}, api.basePath)
  } else {
    httpProxyConn.ele('BasePath', {}, `/${  apiProxy}`)
  }
  const vhs = (virtualhosts) ? virtualhosts.split(',') : ['default', 'secure']
  vhs.forEach((virtualhost) => {
    httpProxyConn.ele('VirtualHost', {}, virtualhost)
  })

  if (useCors) {
    const routeRule1 = root.ele('RouteRule', {name: 'noRoute'})
    routeRule1.ele('Condition', {}, 'request.verb == "OPTIONS"')
  }

  const routeRule2 = root.ele('RouteRule', {name: 'default'})
  routeRule2.ele('TargetEndpoint', {}, 'default')

  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' })
  return writeFile(join(rootDirectory, 'proxies', 'default.xml'), xmlString);
}
