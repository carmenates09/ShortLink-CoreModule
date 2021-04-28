import 'source-map-support/register';

import { APIGatewayProxyHandler } from 'aws-lambda';

import {
  ServerlessJsonApi,
  IAppRouteConfig,
  HttpMethods,
  BaseHandler,
  EndpointTypes
} from '@vifros/serverless-json-api';

import { InfoHandler }  from './handlers/info';
import { LinksHandler } from './handlers/links';

import { linkModelLoader } from './models/link';
import { infoModelLoader } from './models/info';

export * from './handlers/standalone';

const serverlessJsonApi: ServerlessJsonApi = new ServerlessJsonApi(
  new Map<string, typeof BaseHandler>([
    ['infoHandler', InfoHandler],
    ['linksHandler', LinksHandler],
  ]),
  new Set([
    infoModelLoader,
    linkModelLoader,
  ]));

const infoHandler  = serverlessJsonApi.getHandler('infoHandler') as InfoHandler;
const linksHandler = serverlessJsonApi.getHandler('linksHandler') as LinksHandler;

serverlessJsonApi.registerRoutes(new Set<IAppRouteConfig>([
  //
  // Info.
  //
  {
    method        : HttpMethods.GET,
    route         : '/v1/info',
    handler       : infoHandler.getAllInfo.bind(infoHandler),
    endpointType  : EndpointTypes.Collection,
    relatedModelId: infoModelLoader.id
  },
  {
    method        : HttpMethods.GET,
    route         : '/v1/info/:infoId',
    handler       : infoHandler.getInfoById.bind(infoHandler),
    endpointType  : EndpointTypes.Resource,
    relatedModelId: infoModelLoader.id
  },

  //
  // Links.
  //
  {
    method        : HttpMethods.POST,
    route         : '/v1/links',
    handler       : linksHandler.createLink.bind(linksHandler),
    endpointType  : EndpointTypes.Collection,
    relatedModelId: linkModelLoader.id
  },
  {
    method        : HttpMethods.GET,
    route         : '/v1/links',
    handler       : linksHandler.getAllLinks.bind(linksHandler),
    endpointType  : EndpointTypes.Collection,
    relatedModelId: linkModelLoader.id
  },
  {
    method        : HttpMethods.GET,
    route         : '/v1/links/:linkId',
    handler       : linksHandler.getLinkById.bind(linksHandler),
    endpointType  : EndpointTypes.Resource,
    relatedModelId: linkModelLoader.id
  },
  {
    method        : HttpMethods.DELETE,
    route         : '/v1/links/:linkId',
    handler       : linksHandler.deleteLinkById.bind(linksHandler),
    endpointType  : EndpointTypes.Resource,
    relatedModelId: linkModelLoader.id
  },
  {
    method        : HttpMethods.PATCH,
    route         : '/v1/links/:linkId',
    handler       : linksHandler.updateLinkById.bind(linksHandler),
    endpointType  : EndpointTypes.Resource,
    relatedModelId: linkModelLoader.id
  },
]));

export const index: APIGatewayProxyHandler | any = serverlessJsonApi.mainHandler;
