import * as fs from 'fs/promises'
import { fileURLToPath } from 'url'
import * as serviceUtils from '../../util/service.js'
import * as quota from '../../policy_templates/quota/quota.js'
import * as spike from '../../policy_templates/spikeArrest/spikeArrest.js'
import * as cache from '../../policy_templates/cache/responseCache.js'
import * as cors from '../../policy_templates/cors/cors.js'
import * as headers from '../../policy_templates/headers/headers.js'
import * as regex from '../../policy_templates/regex-protection/regex.js'
import * as extractVars from '../../policy_templates/vars/extract-vars.js'
import {
  validationsGenTemplate,
  validationsSchema,
} from '../../policy_templates/validations/valid.js'
import * as raiseFault from '../../policy_templates/raise-fault/raise.js'
import * as verifyApiKey from '../../policy_templates/security/apikey.js'
import * as oauth2 from '../../policy_templates/security/verifyAccessToken.js'
import { dirname, join, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function generateService(service, { rootDirectory }, api) {
  // Perform operation on file here.
  const xmlStrings = []
  const serviceName = service.name
  const { provider } = service
  const serviceOptions = service.options
  let xmlString = ''
  if (provider.indexOf('quota') > -1) {
    // Add Quota Policy
    xmlString = quota.quotaGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('spike') > -1) {
    // Add spike Policy
    xmlString = spike.spikeArrestGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('cache') > -1) {
    // Add cache Policies
    xmlString = cache.responseCacheGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('cors') > -1) {
    // Add cors Policies
    xmlString = cors.corsGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('headers') > -1) {
    // Add header Policies
    xmlString = headers.headersGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('regex') > -1) {
    // Add regex Policies
    xmlString = regex.regexGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
    // filter
    await fs.mkdir(`${rootDirectory}/resources/jsc`, { recursive: true })
    const js = join(__dirname, '../../resource_templates/jsc/JavaScriptFilter.js')
    await fs.copyFile(js, join(rootDirectory, 'resources/jsc/', `${serviceName}.js`))
    // regex
    const qs = join(__dirname, '../../resource_templates/jsc/querystringDecode.js')
    await fs.copyFile(qs, join(rootDirectory, 'resources/jsc/', `${serviceName}-querystring.js`))
    const x = regex.regularExpressions()
    await fs.writeFile(join(rootDirectory, 'resources/jsc/regex.js'), `var elements = ${JSON.stringify(x)};`, 'utf8')
  }
  if (provider.indexOf('raiseFault') > -1) {
    // Add RaiseFault Policy
    xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('input-validation') > -1) {
    serviceOptions.resourceUrl = 'jsc://input-validation.js'
    xmlString = validationsGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
    const extractVarsOptions = {
      name: 'Extract-Path-Parameters',
      displayName: 'Extract Path Parameters',
      api,
    }
    xmlString = extractVars.extractVarsGenTemplate(extractVarsOptions, extractVarsOptions.name)
    xmlStrings.push({ xmlString, serviceName: 'extractPathParameters' })
  }
  if (provider.indexOf('output-validation') > -1) {
    serviceOptions.resourceUrl = 'jsc://schema-validation.js'
    xmlString = validationsGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if ((provider.indexOf('input-validation') > -1 || provider.indexOf('output-validation') > -1)) {
    await fs.mkdir(`${rootDirectory}/resources/jsc`, { recursive: true })
    // output validation
    await fs.copyFile(
      join(__dirname, '../../resource_templates/jsc/bundle-policify.js'),
      `${rootDirectory}/resources/jsc/bundle-policify.js`,
    )
    await fs.copyFile(
      join(__dirname, '../../resource_templates/jsc/SchemaValidation.js'),
      `${rootDirectory}/resources/jsc/schema-validation.js`,
    )
    // var ru = join(__dirname, '../../resource_templates/jsc/Regex.js');
    // fs.createReadStream(ru).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/regex-utils.js'));
    // input validation
    await fs.copyFile(
      join(__dirname, '../../resource_templates/jsc/InputValidation.js'),
      `${rootDirectory}/resources/jsc/input-validation.js`,
    )
    // api

    const x = validationsSchema(api)
    await fs.writeFile(
      `${rootDirectory}/resources/jsc/api.js`,
      `var api = ${JSON.stringify(x)};`,
      'utf8',
    )
  }

  if (provider.indexOf('raiseInputValidationFault') > -1) {
    // Add RaiseFault Policy
    xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('raiseOutputValidationFault') > -1) {
    // Add RaiseFault Policy
    xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('oauth') > -1 && (serviceName === 'apiKeyQuery' || serviceName === 'apiKeyHeader')) {
    // Add cache Policies
    xmlString = verifyApiKey.apiKeyGenTemplate(serviceOptions, serviceName)
    xmlStrings.push({ xmlString, serviceName })
  }
  if (provider.indexOf('oauth') > -1 && (serviceName === 'oauth2')) {
    // Add cache Policies
    xmlString = oauth2.verifyAccessTokenGenTemplate(serviceOptions, 'verifyAccessToken')
    xmlStrings.push({ xmlString, serviceName })
  }

  let writeCnt = 0
  return Promise.all(xmlStrings.map((xmlString) => fs.writeFile(`${rootDirectory}/policies/${xmlString.serviceName}.xml`, xmlString.xmlString)));
}

export async function generatePolicies (apiProxy, { destination = resolve('api_bundles') }, api) {
  if (!api['x-a127-services']) {
    return
  }

  const rootDirectory = join(destination, apiProxy, 'apiproxy')
  const services = serviceUtils.servicesToArray(api)
  return Promise.all(services.map((service) => generateService(service, { rootDirectory }, api)))
}
