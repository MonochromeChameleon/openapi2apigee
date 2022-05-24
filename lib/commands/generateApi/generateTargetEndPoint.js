import { create } from 'xmlbuilder';
import { writeFile } from 'fs/promises';
import { join, resolve } from 'path';

export async function generateTargetEndPoint(
  apiProxy,
  { destination = resolve('api_bundles') },
  api
) {
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const root = create('TargetEndpoint');
  root.att('name', 'default');
  root.ele('Description', {}, api.info.title);
  const preFlow = root.ele('PreFlow', { name: 'PreFlow' });

  // Add steps to preflow.
  preFlow.ele('Request');
  preFlow.ele('Response');
  root.ele('Flows', {});

  const postFlow = root.ele('PostFlow', { name: 'PostFlow' });
  postFlow.ele('Request');
  postFlow.ele('Response');

  const httpTargetConn = root.ele('HTTPTargetConnection');

  if (api.openapi) {
    httpTargetConn.ele('URL', {}, api.servers[0].url);
  } else {
    httpTargetConn.ele(
      'URL',
      {},
      `${api.schemes[0]}://${api.host}${api.basePath}`
    );
  }

  const xmlString = root.end({ pretty: true, indent: '  ', newline: '\n' });
  return writeFile(join(rootDirectory, 'targets', 'default.xml'), xmlString);
}
