import * as uuid from 'uuid';
const shortid = require('shortid');

import {
  defaultThroughput,
  IDbModelLoaderMap,
  JsonApi
} from '@vifros/serverless-json-api';

export const linkModelLoader: IDbModelLoaderMap = {
  id               : 'link',
  tableName        : process.env.SERVICE_DYNAMODB_TABLE_LINKS,
  schema           : {
    id       : {
      type    : String,
      hashKey : true,
      readonly: true,
      default : () => {
        return uuid.v4();
      }
    },
    type     : {
      type        : String,
      readonly    : true,
      default     : 'link',
      forceDefault: true,
      index       : [
        {
          global    : true,
          name      : 'typeCreatedAtGlobalIndex',
          rangeKey  : 'createdAt',
          project   : true,
          throughput: defaultThroughput
        },
        {
          global    : true,
          name      : 'typeShortLinkGlobalIndex',
          rangeKey  : 'shortLink',
          project   : true,
          throughput: defaultThroughput
        }
      ]
    },
    shortLink    : {
      type    : String,
      default : () => {
        console.log(909, "yo")
        return "w8CRFnhZ0" //shortid.generate();
      },
      forceDefault: true,
      required: true,
      validations: {
        itExists: async function (value, db): Promise<boolean | string> {
          console.log(146, value)
          const Link = db.getModelByLoader(linkModelLoader);

          let link = await Link.xGet({
            shortLink: value
          });
          return !!link;
        }
      }

    },
    originalLink : {
      type       : String,
      required   : true
    },
    description : {
      type       : String,
      required   : false
    },
    createdAt: {
      type: Number
    },
    updatedAt: {
      type: Number
    }
  },
  schemaOptions    : {
    throughput: defaultThroughput
  },
  serializerOptions: {
    links: {
      self: function (data) {
        let extras: any = JsonApi.getExtras(data);

        let url = '/v1';

        return (extras && extras.isNested)
               ? `${url}/users/${data.authorId}/posts/${data.id}`
               : `${url}/links/${data.id}`;
      }
    }
  }
};
