import * as path from 'path';
import * as childProcess from 'child_process';
import should from 'should';

describe('openapi2apigee', function () {
  it('without arguments should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee.js')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
  it('with wrong api file should return correct exit code', function (done) {
    childProcess.exec([
      path.join(process.cwd(), 'bin/openapi2apigee.js generateApi apiname -s wrong.json -d ./apigee')
    ].join(' '), function (err) {
      should.equal(err.code, 1)
      done()
    })
  })
})
