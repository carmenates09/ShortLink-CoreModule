import {
  BaseHandler,
  JsonApiNotFoundError
} from '@vifros/serverless-json-api';

import { linkModelLoader } from '../models/link';

export class LinksHandler extends BaseHandler {
  constructor() {
    super();
  }

  async createLink(data: any): Promise<any> {
    const Link = this.getModelByLoader(linkModelLoader);
    return await Link.xCreate(data);
  }

  async getLinkById(linkId: string): Promise<any> {
    const Link = this.getModelByLoader(linkModelLoader);
    let link   = await Link.xGet({
      id: linkId
    });

    if (!link) {
      throw new JsonApiNotFoundError({
        parameter: 'linkId'
      });
    }

    return link;
  }

  async getLinkByShortLink(shortLink: string): Promise<any> {
    const Link = this.getModelByLoader(linkModelLoader);
    let link   = await Link.xGet({
      shortLink: shortLink
    });

    if (!link) {
      throw new JsonApiNotFoundError({
        parameter: 'shortLink'
      });
    }

    return link;
  }

  async deleteLinkById(linkId: string): Promise<void> {
    // TODO @diosney: Add support for a soft delete.
    const Link = this.getModelByLoader(linkModelLoader);

    await Link.xDelete({
      id: linkId
    });
  }

  async updateLinkById(linkId: string, linkData: any): Promise<any> {
    const Link = this.getModelByLoader(linkModelLoader);
    return await Link.xUpdate({
      id: linkId
    }, linkData);
  }

  async getAllLinks(query?: any): Promise<any> {
    const Link = this.getModelByLoader(linkModelLoader);
    return await Link.xGetAll(query);
  }
}
