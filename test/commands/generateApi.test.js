import * as path from 'path';
import * as fs from 'fs/promises';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';
import { generateSkeleton } from '../../lib/commands/generateApi/generateSkeleton.js';

function randomText() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 10; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

describe('generateApi', () => {
  describe('generate', () => {
    it('Incorrect openapi file should generate error..', async () => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi2.yaml'),
        destination: path.resolve('api_bundles'),
      };
      await expect(() => generateApi('petStore', options)).rejects.toThrow();
    });
    it('Correct openapi file should not generate error..', async () => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles'),
      };
      await expect(generateApi('petStore', options)).resolves.toBeUndefined();
    });
  });

  describe('generateSkeleton', () => {
    it('generate Skeleton should create folder structure', async () => {
      const options = {
        source: path.resolve('test/commmands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles'),
        apiProxy: randomText(),
      };

      await generateSkeleton(options.apiProxy, options);

      const rootFolder = await fs.lstat(
        path.join(options.destination, options.apiProxy)
      );
      const proxiesFolder = await fs.lstat(
        path.join(options.destination, `${options.apiProxy}/apiproxy/proxies`)
      );
      const targetsFolder = await fs.lstat(
        path.join(options.destination, `${options.apiProxy}/apiproxy/targets`)
      );
      const policiesFolder = await fs.lstat(
        path.join(options.destination, `${options.apiProxy}/apiproxy/policies`)
      );
      expect(rootFolder.isDirectory()).toBe(true);
      expect(proxiesFolder.isDirectory()).toBe(true);
      expect(targetsFolder.isDirectory()).toBe(true);
      expect(policiesFolder.isDirectory()).toBe(true);
    });

    it('destination path ending with / should generate Skeleton Folder', async () => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles/'),
        apiProxy: randomText(),
      };
      await generateSkeleton(options.apiProxy, options);
      const rootFolder = await fs.lstat(
        path.join(options.destination, options.apiProxy)
      );
      const proxiesFolder = await fs.lstat(
        path.join(options.destination, `${options.apiProxy}/apiproxy/proxies`)
      );
      const targetsFolder = await fs.lstat(
        path.join(options.destination, `${options.apiProxy}/apiproxy/proxies`)
      );
      expect(rootFolder.isDirectory()).toBe(true);
      expect(proxiesFolder.isDirectory()).toBe(true);
      expect(targetsFolder.isDirectory()).toBe(true);
    });
  });
});
