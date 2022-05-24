import { create } from 'xmlbuilder';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import * as serviceUtils from '../../util/service.js';

const ALLOWED_VERBS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'OPTIONS',
  'HEAD',
  'TRACE',
  'CONNECT',
  'PATCH',
];

function generateFlow(flows, { apiPath, method, resource, raiseFaultName }) {
  const operationId =
    resource.operationId || `${method.toUpperCase()} ${apiPath}`;
  const flow = flows.ele('Flow', { name: operationId });
  const flowCondition = `(proxy.pathsuffix MatchesPath &quot;${apiPath}&quot;) and (request.verb = &quot;${method.toUpperCase()}&quot;)`;
  flow.ele('Condition').raw(flowCondition);
  flow.ele('Description', {}, resource.summary);
  const requestPipe = flow.ele('Request');

  // Add conditions for parameters.
  if (raiseFaultName && method.toUpperCase() === 'GET' && resource.parameters) {
    const { parameters } = resource;
    let paramCondition = '';
    let cnt = 0;
    parameters.forEach((param) => {
      if (param.required && param.in === 'query') {
        const op = cnt > 0 ? ' or ' : '';
        paramCondition += `${op}(request.queryparam.${param.name} Equals null)`;
        cnt += 1;
      }
      // if (param.required && param.in === 'path') {
      //   var op = (cnt > 0) ? ' or ' : '';
      //   paramCondition +=  op + '(request.queryparam.' + param.name + ' Equals null)';
      //   cnt++;
      // }
    });
    if (paramCondition.length > 0) {
      const requestStep = requestPipe.ele('Step');
      requestStep.ele('Condition').raw(paramCondition);
      requestStep.ele('Name', {}, raiseFaultName);
    }
  }

  const responsePipe = flow.ele('Response');
  if (resource['x-a127-apply']) {
    Object.entries(resource['x-a127-apply']).forEach(
      ([service, { endPoint, pipe }]) => {
        if (endPoint.indexOf('proxy') > -1) {
          if (pipe.indexOf('request') > -1) {
            const step = requestPipe.ele('Step', {});
            step.ele('Name', {}, service);
          }
          if (pipe.indexOf('response') > -1) {
            const step = responsePipe.ele('Step', {});
            step.ele('Name', {}, service);
          }
        }
      }
    );
  }
  // Check for Security Policies in a-127
  if (resource.security) {
    Object.values(resource.security)
      .flatMap((it) => it)
      .filter((it) => ['oauth2', 'apiKeyHeader', 'apiKeyQuery'].includes(it))
      .forEach(() => {
        // Attach verify access token policy..
        const step = requestPipe.ele('Step', {});
        step.ele('Name', {}, 'verifyAccessToken');
      });
  }
}

export async function generateProxyEndPoint(
  apiProxy,
  { destination = resolve('api_bundles'), basepath, virtualhosts },
  api
) {
  let useCors;
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const root = create('ProxyEndpoint');
  root.att('name', 'default');
  root.ele('Description', {}, api.info.title);
  let preFlow = root.ele('PreFlow', { name: 'PreFlow' });

  // Add steps to preflow.
  let raiseFaultName;
  const requestPipe = preFlow.ele('Request');
  const responsePipe = preFlow.ele('Response');
  const services = serviceUtils.servicesToArray(api);
  services.forEach((serviceItem) => {
    if (serviceItem.provider === 'x-cors') {
      useCors = serviceItem.name;
      const step = responsePipe.ele('Step', {});
      step.ele('Name', {}, serviceItem.name);
      step.ele('Condition', {}, 'request.verb != "OPTIONS"');
    }
    if (
      serviceItem.provider === 'x-input-validation' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('request') > -1 &&
        serviceItem.options.displayName
      ) {
        const step = requestPipe.ele('Step', {});
        step.ele('Name', {}, 'Extract Path Parameters');
        const step2 = requestPipe.ele('Step', {});
        step2.ele('Name', {}, serviceItem.options.displayName);
      }
    }
    if (
      serviceItem.provider === 'x-raiseInputValidationFault' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('request') > -1 &&
        serviceItem.options.displayName
      ) {
        raiseFaultName = serviceItem.options.displayName;
        const step = requestPipe.ele('Step', {});
        step.ele('Condition', {}, '(INPUT.error equals true)');
        step.ele('Name', {}, raiseFaultName);
      }
    }
    if (
      serviceItem.provider === 'x-regex-protection' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('request') > -1 &&
        serviceItem.options.displayName
      ) {
        const step = requestPipe.ele('Step', {});
        step.ele('Name', {}, serviceItem.options.displayName);
      }
    }
    if (
      serviceItem.provider === 'x-raiseFault' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('request') > -1 &&
        serviceItem.options.displayName
      ) {
        raiseFaultName = serviceItem.options.displayName;
        const step = requestPipe.ele('Step', {});
        step.ele('Condition', {}, '(FILTER.block equals true)');
        step.ele('Name', {}, raiseFaultName);
      }
    }
  });

  const flows = root.ele('Flows', {});

  if (useCors) {
    preFlow = flows.ele('Flow', { name: 'OptionsPreFlight' });
    preFlow.ele('Condition', {}, 'request.verb == "OPTIONS"');
    preFlow.ele('Request');
    const preFlowResponse = preFlow.ele('Response');
    const requestStep = preFlowResponse.ele('Step');
    requestStep.ele('Name', {}, useCors);
  }

  Object.entries(api.paths)
    .flatMap(([apiPath, endpoint]) =>
      Object.entries(endpoint)
        .filter(([method]) => ALLOWED_VERBS.includes(method.toUpperCase()))
        .map(([method, resource]) => ({ apiPath, method, resource }))
    )
    .forEach((flow) => generateFlow(flows, { ...flow, raiseFaultName }));

  const postFlow = root.ele('PostFlow', { name: 'PostFlow' });
  postFlow.ele('Request');
  const postFlowPipe = postFlow.ele('Response');

  Object.values(api['x-a127-services']).forEach((serviceItem) => {
    if (
      serviceItem.provider === 'x-output-validation' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('response') > -1 &&
        serviceItem.options.displayName
      ) {
        const step = postFlowPipe.ele('Step', {});
        step.ele('Name', {}, serviceItem.options.displayName);
      }
    }
    if (
      serviceItem.provider === 'x-raiseOutputValidationFault' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('response') > -1 &&
        serviceItem.options.displayName
      ) {
        raiseFaultName = serviceItem.options.displayName;
        const step = postFlowPipe.ele('Step', {});
        step.ele('Condition', {}, '(SCHEMA.error equals true)');
        step.ele('Name', {}, raiseFaultName);
      }
    }
    if (
      serviceItem.provider === 'x-headers' &&
      serviceItem.apply.endPoint.indexOf('proxy') > -1
    ) {
      if (
        serviceItem.apply.pipe.indexOf('response') > -1 &&
        serviceItem.options.displayName
      ) {
        raiseFaultName = serviceItem.options.displayName;
        const step = postFlowPipe.ele('Step', {});
        // step.ele('Condition', {}, '(SCHEMA.error equals true)');
        step.ele('Name', {}, raiseFaultName);
      }
    }
  });

  const httpProxyConn = root.ele('HTTPProxyConnection');
  if (basepath) {
    httpProxyConn.ele('BasePath', {}, basepath);
  } else if (api.basePath !== undefined) {
    httpProxyConn.ele('BasePath', {}, api.basePath);
  } else {
    httpProxyConn.ele('BasePath', {}, `/${apiProxy}`);
  }
  const vhs = virtualhosts ? virtualhosts.split(',') : ['default', 'secure'];
  vhs.forEach((virtualhost) => {
    httpProxyConn.ele('VirtualHost', {}, virtualhost);
  });

  if (useCors) {
    const routeRule1 = root.ele('RouteRule', { name: 'noRoute' });
    routeRule1.ele('Condition', {}, 'request.verb == "OPTIONS"');
  }

  const routeRule2 = root.ele('RouteRule', { name: 'default' });
  routeRule2.ele('TargetEndpoint', {}, 'default');

  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  return writeFile(join(rootDirectory, 'proxies', 'default.xml'), xmlString);
}
