import * as path from 'path';
import * as fs from 'fs/promises';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with CORS proxy', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/cors.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreCors',
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

      expect(result).toHaveProperty('ProxyEndpoint');
      expect(result).toHaveProperty('ProxyEndpoint.RouteRule');
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

      expect(result).toHaveProperty('TargetEndpoint');
      expect(result).toHaveProperty('TargetEndpoint.PreFlow');

      expect(result.TargetEndpoint.PreFlow[0].Request[0]).toHaveLength(0);
    });

    describe('virtualhosts option', () => {
      it('missing -v flag should generate both default and secure', async () => {
        options.apiProxy = 'petStoreVirtualBoth';
        await generateApi(options.apiProxy, options);

        const proxiesFilePath = path.join(
          options.destination,
          options.apiProxy,
          '/apiproxy/proxies/default.xml'
        );
        const proxiesFileData = await fs.readFile(proxiesFilePath);
        const parser = new xml2js.Parser();
        const result = await new Promise((res, rej) => {
          parser.parseString(proxiesFileData, (err, r) =>
            err ? rej(err) : res(r)
          );
        });

        expect(result).toHaveProperty('ProxyEndpoint.HTTPProxyConnection');
        const vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
        expect(vhost).toEqual(['default', 'secure']);
      });

      it("-v 'secure' should generate secure virtual host", async () => {
        options.apiProxy = 'petStoreVirtualVirtual';
        options.virtualhosts = 'secure';
        await generateApi(options.apiProxy, options);

        const proxiesFilePath = path.join(
          options.destination,
          options.apiProxy,
          '/apiproxy/proxies/default.xml'
        );
        const proxiesFileData = await fs.readFile(proxiesFilePath);
        const parser = new xml2js.Parser();
        const result = await new Promise((res, rej) => {
          parser.parseString(proxiesFileData, (err, r) =>
            err ? rej(err) : res(r)
          );
        });

        expect(result).toHaveProperty('ProxyEndpoint.HTTPProxyConnection');
        const vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
        expect(vhost).toEqual(['secure']);
      });

      it("-v 'default' should generate default virtual host", async () => {
        options.apiProxy = 'petStoreVirtualDefault';
        options.virtualhosts = 'default';
        await generateApi(options.apiProxy, options);

        const proxiesFilePath = path.join(
          options.destination,
          options.apiProxy,
          '/apiproxy/proxies/default.xml'
        );
        const proxiesFileData = await fs.readFile(proxiesFilePath);
        const parser = new xml2js.Parser();
        const result = await new Promise((res, rej) => {
          parser.parseString(proxiesFileData, (err, r) =>
            err ? rej(err) : res(r)
          );
        });
        expect(result).toHaveProperty('ProxyEndpoint.HTTPProxyConnection');
        const vhost = result.ProxyEndpoint.HTTPProxyConnection[0].VirtualHost;
        expect(vhost).toEqual(['default']);
      });
    });
  });
});
