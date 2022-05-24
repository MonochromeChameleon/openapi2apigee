import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with schema validation', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/schema-validation.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreSchemaValidation',
  };

  describe('generate', () => {
    it('Correct swagger file should generate proxy', async () => {
      await expect(
        generateApi(options.apiProxy, options)
      ).resolves.toBeUndefined();
    });
  });

  describe('Add schema validation policy', () => {
    it('Raise fault policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/raiseOutputValidationFault.xml`
      );
      const file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);

      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });

      // Check Header name and value
      console.log(
        'RaiseFault.FaultResponse[0]',
        result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0]
      );
      expect(result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0]).toBe(
        'Server Error'
      );
      expect(result.RaiseFault.FaultResponse[0].Set[0].StatusCode[0]).toBe(
        '500'
      );
    });
  });
});
