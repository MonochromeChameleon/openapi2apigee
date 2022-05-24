import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
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

  describe('Add schema validation policy', () => {
    it('Output validation protection policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/output-validation.xml`
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
      expect(result.Javascript.ResourceURL[0]).toBe(
        'jsc://schema-validation.js'
      );
      expect(result.Javascript.IncludeURL[0]).toBe('jsc://api.js');
      // expect(result.Javascript.IncludeURL[1]).toBe('jsc://regex-utils.js')
    });

    it('Input validation protection policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/input-validation.xml`
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
      expect(result.Javascript.ResourceURL[0]).toBe(
        'jsc://input-validation.js'
      );
      expect(result.Javascript.IncludeURL[0]).toBe('jsc://api.js');
    });

    it('Js files should be generated', async () => {
      let filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/schema-validation.js`
      );
      let file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
      filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/input-validation.js`
      );
      file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
      filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/resources/jsc/api.js`
      );
      file = await fs.lstat(filePath);
      expect(file.isFile()).toBe(true);
      // filePath = path.join(options.destination, options.apiProxy + "/apiproxy/resources/jsc/regex-utils.js");
      // file = await fs.lstat(filePath);
      // expect(file.isFile()).toBe(true)
    });

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

    it('Proxy should contain Add Validation step in PostFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });

      expect(result.ProxyEndpoint.PostFlow[0].Response[0].Step[0].Name[0]).toBe(
        'Add Output Validation'
      );
    });

    it('Proxy should contain Raise Validation Error step in PostFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });
      expect(result.ProxyEndpoint.PostFlow[0].Response[0].Step[1].Name[0]).toBe(
        'Raise Output Validation Error'
      );
    });

    it('Proxy should contain Extract Path Parameters step in PreFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });
      expect(result.ProxyEndpoint.PreFlow[0].Request[0].Step[0].Name[0]).toBe(
        'Extract Path Parameters'
      );
    });

    it('Proxy should contain Add Validation step in PreFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });

      expect(result.ProxyEndpoint.PreFlow[0].Request[0].Step[1].Name[0]).toBe(
        'Add Input Validation'
      );
    });

    it('Proxy should contain Raise Input Validation Error step in PreFlow', async () => {
      const filePath = path.join(
        options.destination,
        options.apiProxy,
        '/apiproxy/proxies/default.xml'
      );
      const fileData = await fs.readFile(filePath);
      const parser = new xml2js.Parser();
      const result = await new Promise((res, rej) => {
        parser.parseString(fileData, (err, r) => {
          if (err) rej(err);
          else res(r);
        });
      });
      expect(result.ProxyEndpoint.PreFlow[0].Request[0].Step[2].Name[0]).toBe(
        'Raise Input Validation Error'
      );
    });
  });
});
