import { create } from 'xmlbuilder';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { corsConfig } from '../policyConfig/cors.js'

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

function generateFlow(flows, { apiPath, method, resource }) {
  const operationId =
    resource.operationId || `${method.toUpperCase()} ${apiPath}`;
  const flow = flows.ele('Flow', { name: operationId });
  const flowCondition = `(proxy.pathsuffix MatchesPath &quot;${apiPath}&quot;) and (request.verb = &quot;${method.toUpperCase()}&quot;)`;
  flow.ele('Condition').raw(flowCondition);
  flow.ele('Description', {}, resource.summary);
  const requestPipe = flow.ele('Request');

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
  const useCors = 'add-cors';
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const root = create('ProxyEndpoint');
  root.att('name', 'default');
  root.ele('Description', {}, api.info.title);
  let preFlow = root.ele('PreFlow', { name: 'PreFlow' });

  // Add steps to preflow.
  const responsePipe = preFlow.ele('Response');
  const step = responsePipe.ele('Step', {});
  step.ele('Name', {}, corsConfig.name);
  step.ele('Condition', {}, 'request.verb != "OPTIONS"');

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
    .forEach((flow) => generateFlow(flows, flow));

  const postFlow = root.ele('PostFlow', { name: 'PostFlow' });
  postFlow.ele('Request');

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
