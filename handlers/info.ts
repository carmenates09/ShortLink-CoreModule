import {
  BaseHandler,
  JsonApiNotFoundError,
  JsonApiNotImplementedError
} from '@vifros/serverless-json-api';

import { Info } from '../classes/info';

import {
  InfoMap,
  InfoTypes
} from '../interfaces/info';

export class InfoHandler extends BaseHandler {
  constructor() {
    super();
  }

  async getInfoById(infoId: InfoTypes): Promise<InfoMap> {
    if (!Info.infoTypes.has(infoId)) {
      throw new JsonApiNotFoundError({
        parameter: 'infoId'
      });
    }

    switch (infoId) {
      case InfoTypes.CurrentTime:
        return Info.getCurrentTime();

      default:
        throw new JsonApiNotImplementedError();
    }
  }

  // TODO @diosney: Add support for statically processed queries against passed local data.
  async getAllInfo(query?: any): Promise<any> {
    let infoData: InfoMap[] = [];
    infoData.push(Info.getCurrentTime());

    return infoData;
  }
}
