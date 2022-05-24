import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with headers', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/headers.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreHeaders',
  };

  describe('generate', () => {
    it('Correct OpenApi file should generate proxy', async () => {
      await expect(
        generateApi(options.apiProxy, options)
      ).resolves.toBeUndefined();
    });
  });

  describe('Add header policy', () => {
    it('Headers token policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/add-headers-token.xml`
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

      const headers = result.AssignMessage.Set[0].Headers[0];
      // Check Header name and value
      expect(headers.Header[0].$.name).toBe('x-token');
      expect(headers.Header[0]._).toBe('random_token');
    });

    it('Headers x-api-key policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/add-headers-x-api-key.xml`
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

      const headers = result.AssignMessage.Set[0].Headers[0];
      // Check Header name and value
      expect(headers.Header[0].$.name).toBe('x-api-key');
      expect(headers.Header[0]._).toBe('random_api_key');
    });

    it('Headers securit headers policy should be generated', async () => {
      const filePath = path.join(
        options.destination,
        `${options.apiProxy}/apiproxy/policies/add-headers-security.xml`
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

      const headers = result.AssignMessage.Set[0].Headers[0];
      // Check Header name and value
      expect(headers.Header[0].$.name).toBe('Strict-Transport-Security');
      expect(headers.Header[0]._).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(headers.Header[1].$.name).toBe('X-XSS-Protection');
      expect(headers.Header[1]._).toBe('1; mode=block');
      expect(headers.Header[2].$.name).toBe('X-Content-Type-Options');
      expect(headers.Header[2]._).toBe('nosniff');
      expect(headers.Header[3].$.name).toBe('X-Frame-Options');
      expect(headers.Header[3]._).toBe('deny');
    });
  });
});
