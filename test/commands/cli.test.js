import { join } from 'path';
import { exec } from 'child_process';

describe('openapi2apigee', () => {
  it('without arguments should return correct exit code', async () => {
    await expect(
      new Promise((res, rej) => {
        exec(join(process.cwd(), 'bin/openapi2apigee.js'), (err) => {
          if (err) rej(err);
          else res();
        });
      })
    ).rejects.toThrow();
  });
  it('with wrong api file should return correct exit code', async () => {
    await expect(
      new Promise((res, rej) => {
        exec(
          join(
            process.cwd(),
            'bin/openapi2apigee.js generateApi apiname -s wrong.json -d ./apigee'
          ),
          (err) => {
            if (err) rej(err);
            else res();
          }
        );
      })
    ).rejects.toThrow();
  });
});
