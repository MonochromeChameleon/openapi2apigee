import parser from 'swagger-parser';
import { generateSkeleton } from './generateSkeleton.js';
import { generateProxy } from './generateProxy.js';
import { generatePolicies } from './generatePolicies.js';
import { generateProxyEndPoint } from './generateProxyEndPoint.js';
import { generateTargetEndPoint } from './generateTargetEndPoint.js';

export async function generateApi(apiProxy, options) {
  const api = await new Promise((res, rej) => {
    parser.parse(options.source, async (err, a) => {
      if (err) rej(err);
      else res(a);
    });
  });

  console.log(
    'Source specification is via: %s %s',
    api.openapi ? 'OAS' : 'Swagger',
    api.openapi ? api.openapi : api.swagger
  );
  console.log('API name: %s, Version: %s', api.info.title, api.info.version);

  await generateSkeleton(apiProxy, options);
  await generateProxy(apiProxy, options, api);
  await generateProxyEndPoint(apiProxy, options, api);
  await generateTargetEndPoint(apiProxy, options, api);
  await generatePolicies(apiProxy, options, api);
}
