import * as ZSchema from 'z-schema';
import * as openapiUtilPath from 'openapi-utils-path-for-uri';
import * as openapiUtilParam from 'openapi-utils-param-to-schema';
import * as openapiUtilSchema from 'openapi-utils-schema-from-api';

ZSchema = new ZSchema({
  breakOnFirstError: true,
  noExtraKeywords: true,
  ignoreUnknownFormats: false,
  reportPathAsArray: true
})

export const policify = {
  validateSchema: function (injected, schema) {
    return ZSchema.validate(injected, schema)
  },
  getLastError: function () {
    return ZSchema.getLastError()
  },
  getResourceForPath: openapiUtilPath.pathForUri,
  paramToSchema: openapiUtilParam.paramToSchema,
  schemaFromApi: openapiUtilSchema.schemaFromApi
}

