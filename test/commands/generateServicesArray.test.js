import * as path from 'path';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with schema validation', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/services-array.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreServicesArray',
  };

  describe('generate', () => {
    it('Correct swagger file should generate proxy', async () => {
      await expect(
        generateApi(options.apiProxy, options)
      ).resolves.toBeUndefined();
    });
  });
});
