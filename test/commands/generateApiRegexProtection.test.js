import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with regex-protection', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/regex-protection.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreRegexProtection',
  };

  describe('generate', () => {
    it('Correct swagger file should generate proxy', async () => {
      await expect(
        generateApi(options.apiProxy, options)
      ).resolves.toBeUndefined();
    });
  });

  describe('Add regex-protection policy', () => {
    it('Regexp protection policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/regex-protection.xml`
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

      expect(result.Javascript.ResourceURL[0]).toBe(
        'jsc://regex-protection.js'
      );
      expect(result.Javascript.IncludeURL[0]).toBe('jsc://regex.js');
      expect(result.Javascript.IncludeURL[1]).toBe(
        'jsc://regex-protection-querystring.js'
      );
    });

    it('Js files should be generated', async () => {
      let filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/regex-protection.js`
      );
      let file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
      filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/regex-protection-querystring.js`
      );
      file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
      filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/regex.js`
      );
      file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
    });

    it('Raise fault policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/raiseFault.xml`
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

      expect(result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0]).toBe(
        'Bad Request'
      );
      expect(result.RaiseFault.FaultResponse[0].Set[0].StatusCode[0]).toBe(
        '400'
      );
    });
  });
});
