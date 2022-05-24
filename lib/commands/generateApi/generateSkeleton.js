import { join, resolve } from 'path'
import { mkdir } from 'fs/promises'

export async function generateSkeleton (apiProxy, { destination = resolve('api_bundles') }) {
  const rootDirectory = join(destination, apiProxy, 'apiproxy');
  const subFolders = ['proxies', 'targets', 'policies'].map((sf) => join(rootDirectory, sf));

  return Promise.all(subFolders.map((sf) => mkdir(sf, { recursive: true })));
}
