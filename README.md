# serverless-service-blueprint

Very opinionated serverless service blueprint for faster and efficient development.

It uses Express under the hood to facilitate the request and response handling.

## Disclaimer

This is still a **WIP**! 

Use at your own risk and discretion. 

## Important Notice

Since this is a generic blueprint we had to make several compromises and make several opinionated decisions on
several topics of the blueprint, we highly recommend that you read all the specific `README.md` files so you can
know and understand what those compromises and opinionated decisions are, so you can the blueprint strengths and
shortcomings before starting you project.

Those specific `README.md` files are scattered through the folders, use the folder structure below to quickly
locate them.

Once you know what the conventions are, you will be quickly developing your next big project.

## Documentation

You can consume this very `README.md` file for an overall blueprint documentation, and also read all the specific 
`README.md` files scattered by the main folders since there are details in those files to the specific features.

You can use the folder structure below to search for those specific `README.md` files.

## Installation

```
npm install --global serverless typescript
npm install

// For local development.
sls dynamodb install
```

### Local Development

To develop in your local machine you need to install also the Serverless DynamoDb plugin:

```
sls dynamodb install
```

Then you can issue at anytime:

```
sls offline start
```

that way you will start both DynamoDB local instance and the Serverless Offline server that will
enable you to develop your service locally.

You can even call directly your lambdas by issuing:

```
// To execute locally the function `hello`.
sls invoke local -f hello 

// To execute locally the function `hello` and stream logs to console.
sls invoke local -f hello -l

// To deploy the entire service (slow).
sls deploy

// To deploy a specific function (fast).
sls deploy function -f myFuncName

// To streams to console the errors from a specific function.
sls logs -f myFuncName -t
```

#### Default Environment

Take into account the default environment is 'dev', if you want to run the service with
other environment, like 'local', you need to add it as a param, like:

```
sls offline --stage=local start
```
## Folder Structure

```
├─ config             // Segmented serverless config.
│  ├─ env             // Per environment config.
│  │  ├─ dev.yml
│  │  ├─ local.yml
│  │  ├─ prod.yml
│  │  └─ README.md    // Specific docs for the environment configuration.
│  │
│  ├─ functions       // Per handler serverless function configuration.
│  │  ├─ users.yml    // Working example.
│  │  └─ README.md    // Specific docs for the functions configuration.
│  │
│  └─ resources       // Per serverless resource configuration.
│     └─ dynamodb     // All DynamoDB related resources, like tables, one for file.
│        ├─ users.yml // Working example.
│        └─ README.md // Specific docs for the dynamodb resources configuration.
│
├─ handlers           // Handler specific files, similar to the controllers in a MVC architecture.
│  ├─ users.ts        // Working example.
│  └─ README.md       // Specific docs for the handlers.
│
├─ models             // Models specific files, the models on a MVC architecture.
│  ├─ users.ts        // Working example.
│  └─ README.md       // Specific docs for the models.
│
├─ .gitignore
├─ CHANGELOG.md       // To keep you updated with the modifications made to the blueprint.
├─ handler.ts         // Main handler file, ideally one per serverless service.
├─ LICENSE
├─ package.json
├─ README.md
├─ serverless.yml     // Main serverless configuration file.
├─ tsconfig.json
└─ webpack.config.js
```

## Basic Organization

- The entry point for the configuration is `serverless.yml` for the serverless configuration, which in turns organizes
the configuration segmented in the `/config` folder, to easy management.

- The real functionality entry point is `handler.ts`, in which we will register all models and route handlers of the
service module.

- So, as stated before, `/config` holds all the separated Serverless configuration.

- In `/handlers` you will add a single file per aggregated resource, for instance, `users.ts` and/or `links.ts`. Inside
each file you have to add one class method per defined route.

- In `/models` you will add a single file per application model that you have, for instance `user.ts` and/or `link.ts`,
the same way as you surely did before in the MVC architecture.

## Supports regular Lambda workflow

The blueprint support the basic Lambda workflow, so it works as expected, just add your functions at `handlers` folder
(check `handlers/standalone.ts` for an example) and register them with serverless at `functions/standalone.yml`.

## Workflow Explanation

1. Update the main Serverless configuration file at the `serverless.yml` file.

2. Update the separated specific  serverless configuration at the `/config` folder.

3. Add your models at `/models`, at least a stub model with the minimal required attributes (`id`, `type` and `createdAt`)
since you will needed in the route registration step.

4. Register your models `handler.ts` file.

5. Register your routes `handler.ts` file. Please note that you MUST specify the resource type that your route abstracts,
if it is a collection (a list of items), or a resource (a single item).

## API Requests & Responses

Since we use [JSON-API](https://jsonapi.org) media type for all the communication with the REST API, you have to format
your responses according with it, and also expects properly JSON-API formatted responses being build out of the box for
you.

**IMPORTANT!** The required media type to use with the requests and responses is `application/vnd.api+json`. Other than
that will throw an error.

**IMPORTANT!** The PUT HTTP method for replace resources is not supported, instead, use partial updates with PATCH.

- Example resource creation (on a Collection endpoint):

  ```
  POST /users
  
  body:
  {
    "data": {
      "type": "user",
      "attributes": {
        "username":"2"
      }
    }
  }
  
  // Response:
  {
    "jsonapi": {
      "version": "1.0"
    },
    "data": {
      "type": "user",
      "id": "0b09d380-0603-4982-888e-826d2a3f539e",
      "attributes": {
        "username": "2",
        "createdAt": "2019-04-28T16:33:49.201Z",
        "updatedAt": "2019-04-28T16:33:49.201Z"
      },
      "links": {
        "self": "/v1/users/0b09d380-0603-4982-888e-826d2a3f539e"
      }
    }
  }
  ```

- Example getting a single resource (on a Resource endpoint):

  ```
  GET /users/0b09d380-0603-4982-888e-826d2a3f539e
  
  // Response:
  {
    "jsonapi": {
        "version": "1.0"
    },
    "data": {
      "type": "user",
      "id": "0b09d380-0603-4982-888e-826d2a3f539e",
      "attributes": {
        "createdAt": "2019-04-28T16:33:49.201Z",
        "username": "2",
        "updatedAt": "2019-04-28T16:33:49.201Z"
      },
      "links": {
        "self": "/v1/users/0b09d380-0603-4982-888e-826d2a3f539e"
      }
    }
  }
  ```

- Example deleting a single resource (on a Resource endpoint):

  ```
  DELETE /users/0b09d380-0603-4982-888e-826d2a3f539e
  ```

- Example resource updating (on a resource endpoint):

  ```
  PATCH /users/0b09d380-0603-4982-888e-826d2a3f539e
  
  body:
  {
    "data": {
      "type": "user",
      "id":"0b09d380-0603-4982-888e-826d2a3f539e",
      "attributes": {
        "username":"zzz"
      }
    }
  }
  
  // Response:
  {
    "jsonapi": {
      "version": "1.0"
    },
    "data": {
      "type": "user",
      "id": "0b09d380-0603-4982-888e-826d2a3f539e",
      "attributes": {
        "username": "zzz",
        "createdAt": "2019-04-28T16:33:49.201Z",
        "updatedAt": "2019-04-28T16:33:49.201Z"
      },
      "links": {
        "self": "/v1/users/0b09d380-0603-4982-888e-826d2a3f539e"
      }
    }
  }
  ```

- Example getting a resources list (on a Collection endpoint):

  ```
  GET /users
  GET /users?page[size]=3&filter[username][$eq]=2
  GET /users?sort=+username&page[after]=eyJ0eXBlIjp7IlMiOiJ1c2VyIn0sImlkIjp7IlMiOiI1NTgyMTBlOC1iNjI5LTRjNDItOTliNC1jNWE1ODhlMzU1OTMifSwiY3JlYXRlZEF0Ijp7Ik4iOiIxNTU2NDY5NzcxNzY3In19
  
  // Response:
  {
    "jsonapi": {
      "version": "1.0"
    },
    "links": {
      "next": "eyJ0eXBlIjp7IlMiOiJ1c2VyIn0sImlkIjp7IlMiOiI1NTgyMTBlOC1iNjI5LTRjNDItOTliNC1jNWE1ODhlMzU1OTMifSwiY3JlYXRlZEF0Ijp7Ik4iOiIxNTU2NDY5NzcxNzY3In19"
    },
    "data": [
      {
        "type": "user",
        "id": "0b09d380-0603-4982-888e-826d2a3f539e",
        "attributes": {
          "createdAt": "2019-04-28T16:33:49.201Z",
          "username": "1",
          "updatedAt": "2019-04-28T16:33:49.201Z"
        },
        "links": {
          "self": "/v1/users/0b09d380-0603-4982-888e-826d2a3f539e"
        }
      },
      {
        "type": "user",
        "id": "4147a9fa-9c5b-48ad-91b0-ee641b9ccc4d",
        "attributes": {
          "createdAt": "2019-04-28T16:42:50.767Z",
          "username": "2",
          "updatedAt": "2019-04-28T16:42:50.767Z"
        },
        "links": {
          "self": "/v1/users/4147a9fa-9c5b-48ad-91b0-ee641b9ccc4d"
        }
      },
      {
        "type": "user",
        "id": "558210e8-b629-4c42-99b4-c5a588e35593",
        "attributes": {
          "createdAt": "2019-04-28T16:42:51.767Z",
          "username": "3",
          "updatedAt": "2019-04-28T16:42:51.767Z"
        },
        "links": {
          "self": "/v1/users/558210e8-b629-4c42-99b4-c5a588e35593"
        }
      }
    ]
  }
  ```
  
### A note on filters

Due the importance of filtering on collections, here are some examples you may use as examples.
For more information about all the valid operators, see https://dynamoosejs.com/api/query.

a) Implicit `$and` usage:

   `http://localhost:3000/v1/users?filter[username][$eq]=bbb&filter[createdAt][$eq]=2019-09-24T22:47:08.850Z`

b) Explicit `$and` usage:

  `http://localhost:3000/v1/users?filter[$and][username][$eq]=bbb&filter[$and][createdAt][$eq]=2019-09-24T22:47:08.850Z`

c) Other conditionals and multivalued conditionals:

  Here`$eq` is interchangeable with any other operator like `$contains` or `$between`:

  `http://localhost:3000/v1/users?filter[username][$contains]=aa`

  In a multivalued conditional like `$between` just use the regular URL array construction like (both are equivalents):

  `http://localhost:3000/v1/users?filter[createdAt][$between]=2019-09-24T22:47:10.598Z&filter[createdAt][$between]=2019-09-24T22:47:26.598Z`
  `http://localhost:3000/v1/users?filter[createdAt][$between][]=2019-09-24T22:47:10.598Z&filter[createdAt][$between][]=2019-09-24T22:47:26.598Z`

  Note the empty square brackets to build the condition array `[a, b]`.
  
d) An `$or` example on different fields:

  `http://localhost:3000/v1/users?filter[$or][username][$eq]=aaa&filter[$or][updatedAt][$eq]=2019-09-24T22:47:08.850Z`
  
e) Multiple filters on same attribute is not supported directly by the orm, just use the `$in` operator for that:

  `http://localhost:3000/v1/users?filter[username][$in]=aaa&filter[username][$in]=bbb`
  `http://localhost:3000/v1/users?filter[username][$in][]=aaa&filter[username][$in][]=bbb`

### Client generated `id`.

If you need client generated `id`s, then you first has to enable it at the model loader, by passing 
`allowClientGeneratedIds: true`, as follows:

```
 metaOptions      : {
    allowClientGeneratedIds: true
  }
```

Just check the `tags` model at `models/tag.ts` as an example.

## Routes implemented in the blueprint as examples

```
{GET|POST}         /users
{GET|PATCH|DELETE} /users/:userId

{GET|POST}         /users/:userId/posts
{GET|PATCH|DELETE} /users/:userId/posts/:postId

{GET|POST}         /posts
{GET|PATCH|DELETE} /posts/:postId

{GET}              /info
{GET}              /info/:infoId   // Test `:infoId = 'current-time'`.
```

## Testing

Run the test by executing in a console:

```
npm run test
```

## References

- Base blueprint: https://www.jamestharpe.com/serverless-typescript-getting-started
- Enforced REST API Media Type: https://jsonapi.org
- Used DynamoDB ORM: https://dynamoosejs.com
- REST API Provider: http://expressjs.com
- Validations library: https://github.com/chriso/validator.js

## License

The MIT License (MIT)

Copyright (c) Diosney Sarmiento<br>
Copyright (c) Jose Carlos Ramos<br>
Copyright (c) Vifros Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Bulk to process yet into the docs

In AWS IAM policies:

1. Login to AWS and navigate to IAM
2. Create a new user called serverless-admin
3. Give serverless-admin Programatic access
4. Attach the AdministratorAccess policy
5. Next, copy the Access key ID and Secret access key
6. serverless config credentials --provider aws --key AKIAIOSFODNN7EXAMPLE --secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY --profile serverless-admin

serverless invoke local --function getAllUsers --region us-east-1 --path test.json
