import { Lambda } from 'aws-sdk';

import {
  APIGatewayEvent,
  APIGatewayProxyHandler,
  Context
} from 'aws-lambda';

import { mediaType } from '@vifros/serverless-json-api';

import { InfoTypes } from '../interfaces/info';

const lambda = new Lambda();

export const exampleStandAlone: APIGatewayProxyHandler | any = async function (event: APIGatewayEvent, context: Context) {
  // Add here your regular Lambda code.
  // Return any value or throw an error since the function is `async`.
  //
  // To test it via CLI just execute:
  // serverless invoke local --function exampleStandAlone --region us-east-1
  // serverless invoke local --function getInfoById --region us-east-1 --data '{ "httpMethod":"GET", "path":"/v1/info/current-time" }'

  // Example calling a more complex Lambda like the `serverless-http` exposed handlers.
  // See https://docs.aws.amazon.com/lambda/latest/dg/lambda-services.html.
  // See https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html.
  try {
    const result: any = await lambda
      .invoke({
        FunctionName  : 'getInfoById',
        InvocationType: 'RequestResponse', // Valid Values: Event | RequestResponse | DryRun
        Payload       : JSON.stringify({
          httpMethod: 'GET',
          path      : `/v1/info/${InfoTypes.CurrentTime}`,
          headers   : {
            'Content-Type': mediaType
          }
          // In this case `queryStringParameters` is not needed, but for GET to collections may be needed.
          // queryStringParameters: {
          //   sort: '-username'
          // },
          // In this case `body` is not needed, but for POSTs and PATCHes it will.
          // body: data
        })
      })
      .promise();

    console.log('result', result.StatusCode, result.Payload);
  }
  catch (error) {
    // TODO @diosney: Return correct errors.
    console.log(error)
  }
};
