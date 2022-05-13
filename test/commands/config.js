import * as path from 'path';
import * as fs from 'fs';

console.log('Remove generated bundles...')
fs.rmSync(path.resolve('api_bundles'), { recursive: true, force: true });
