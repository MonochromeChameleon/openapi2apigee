#!/usr/bin/env node
/* eslint-disable no-console */

import { readFileSync } from 'fs';

import program from 'commander';
import { generateApi } from '../lib/commands/generateApi/generateApi.js';

let executed = false;

const { version: v } = JSON.parse(readFileSync('./package.json', 'utf8'));
program.version(v);

program
  .usage('<command> <options>')
  .command('generateApi <apiProxy>')
  .option('-s, --source <source>', 'openapi File Source.')
  .option('-d, --destination <destination>', 'API Bundle destination location.')
  .option('-n, --netrc', 'Use credentials in $HOME/.netrc (required)')
  .description('Generates Apigee API Bundle')
  .action((apiProxy, options) => {
    executed = true;
    generateApi(apiProxy, options)
      .then(() => {
        if (options.destination) {
          console.log(
            `Apigee API bundle generated in location ${options.destination}`
          );
        } else {
          console.log('Apigee API bundle generated in current directory. ');
        }
      })
      .catch((err) => {
        console.log(err);
        // eslint-disable-next-line no-process-exit
        process.exit(1);
      });
  });

program.on('--help', () => {
  console.log('\n  Examples:');
  console.log('');
  console.log('    $ openapi2apigee generateApi --help');

  console.log('');
  console.log('    $ export ORG=your-org');
  console.log('    $ export ENV=your-env');
  console.log('');
  console.log('Swagger 2.0');
  console.log(
    '    $ export SRC=https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/yaml/petstore.yaml'
  );
  console.log(
    '    $ openapi2apigee generateApi petstore-v2 -s $SRC -d ./examples_proxies'
  );
  console.log(
    '    $ openapi2apigee generateApi petstore-v2 -s $SRC -d ./examples_proxies -n -b $URI -o $ORG -e $ENV -v secure -D '
  );
  console.log('');
  console.log('OAS 3.0.0');
  console.log(
    '    $ export SRC=https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore.yaml'
  );
  console.log(
    '    $ openapi2apigee generateApi petstore-v3 -s $SRC -d ./examples_proxies'
  );
  console.log(
    '    $ openapi2apigee generateApi petstore-v3 -s $SRC -d ./examples_proxies -n -b $URI -o $ORG -e $ENV -v secure -D'
  );
  console.log('');
});

program.parse(process.argv);

if (!process.argv.slice(2).length || !executed) {
  program.outputHelp();
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
