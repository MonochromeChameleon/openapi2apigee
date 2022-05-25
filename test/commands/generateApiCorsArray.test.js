import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with CORS proxy (array)', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/cors-array.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreCorsArray',
  };

  describe('generate', () => {
    it('Correct openapi file should generate proxy', async () => {
      await expect(
        generateApi(options.apiProxy, options)
      ).resolves.toBeUndefined();
    });
  });

  describe('Add cors policy', () => {
    it('Proxies should contain noRoute for options request', async () => {
      const proxiesFilePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const proxiesFileData = await fs.readFile(proxiesFilePath);
      const parser = new xml2js.Parser();

      const result = await new Promise((res, rej) => {
        parser.parseString(proxiesFileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });

      expect(result.ProxyEndpoint.RouteRule[0].$.name).toBe('noRoute');
      expect(result.ProxyEndpoint.RouteRule[0].Condition[0]).toBe(
        'request.verb == "OPTIONS"'
      );
    });

    it('Target should not contain header step in PreFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/targets/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });

      expect(result.TargetEndpoint.PreFlow[0].Request[0]).toBe('');
    });
  });
});
