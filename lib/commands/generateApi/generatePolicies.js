import * as fs from 'fs/promises'
import { join, resolve } from 'path'
import * as cors from '../../policy_templates/cors/cors.js'

import { corsConfig } from '../policyConfig/cors.js'

export async function generatePolicies (
  apiProxy,
  { destination = resolve('api_bundles') }
) {
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  await fs.writeFile(`${rootDirectory}/policies/${corsConfig.name}.xml`, cors.corsGenTemplate(corsConfig.options, corsConfig.name));
}
