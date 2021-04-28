import { IDbModelLoaderMap } from '@vifros/serverless-json-api';

export const infoModelLoader: IDbModelLoaderMap = {
  id               : 'info',
  serializerOptions: {
    links: {
      self: function (data) {
        return '/v1/info/' + data.id;
      }
    }
  }
};
