# handlers

Here you will add your handler functions, which as you can see in the working example, are just regular functions
of a Handler class that MUST always extends the `BaseHandler` class.

You will notice that the functions expects regular params, with no `event` or `context` as the regular Lambda handlers,
and neither `req` nor `res` params like a regular Express route (which we use under the hood), this is because we
abstracted all that functionality in the lower layer and companion `serverless-json-api` library, this way you can
focus on the real functionality without to deal with responses, context, parsing params, query strings and all that.q

Don't worry, you can access from those handler functions all models, other the functions from the same handler and
even from other handlers in the same service, call remote Lambda functions, and so on (see below notes on this).

As with parameters, you will note that the function returns regular objects like you would expect from regular functions,
no specialized responses there, nor context related responses, that is a task that is relegated to the base
`serverless-json-api` library too.

This is only possible by making adding some hard conventions though the blueprint, one of those conventions is that
the enforced API media type is JSON-API. With that in mind you can expect that all API requests and responses MUST
comply with the JSON-API standard, that way we even can leave the repetitive logic like request parsing and response
building to the `serverless-json-api` library, and let you focus on the actual functionality.

Regarding errors, all the code is surrounded by an outer and global error async catching logic, so you can let your code
to throw the errors and they will bubble up to the global handler and build the proper JSON-API error response from the
thrown error.

If you use the recommended custom ORM methods like `xCreate`, `xGet`, `xDelete` and `xGerAll`, if they trigger an error,
they will have properly formatted details according to the JSON-API standard.

Of course, you can always `try-catch` your code and handle the errors however you like, and you can even rethrow the 
error if you want to.

## Notes

- Add one file per route aggregator, like `users` related handlers in one file, `posts`, and so on.

- Always extends you Handler class from the `BaseHandler` class, to have access to a lot of shortcut goodies on `this`.

- Handler functions parameters will be available on this order:

    1. route named parameters in order, if present.
    
    Ex: For the defined route `'/v1/users/:userId'` and its matching route `http://api.localhost:8000/users/2` 
    the handler function will have the parameter available like this:
    
    ```
    async getUserById(userId: string): Promise<any> {
    }
    ```
    
    If there are present more parameters in the route definition, they will be passed down in the same order as they
    were defined.
    
    See `getUserById` for an example.
    
    2. the body data, if present, which only makes sense for POST and PATCH requests. See `createUser` or `updateUserById` 
    for an example.

    3. query string parsed to an object. If there is no body data present, the query object will be next the ordered
    route parameters. See `getAllUsers` for an example.
    
- Regarding responses, you MUST return only the related data that you function is related to.

    For instance, if you have:
    
    - a `getUserById` handler, just return the user object, like `return user;` or `return await getUserById(3);`.
    
    - a `createUser` just return the promise like `return await createUser();`
    
    - and so son, is really easy as it sounds :)

    You can expect that the library will catch your data, and return a proper JSON-API response depending on the route
    that was triggered (if it was a Collection, or a Resource route).
    
- It is HIGHLY recommended that you use ALWAYS the custom ORM methods like `xCreate`, `xGet`, `xDelete` and `xGerAll`,
since they have been charged with JSON-API support in mind.

- If you ever need to throw an error, it is HIGHLY recommended that you do it using one of the documented built in 
JSON-API Erro types, like `JsonApiNotFoundError` or `JsonApiServerError` for instance, since with them you can pass
more specific details on the error and they will trigger properly formatted JSON-API error responses.

- You have access to all specific route data through `this`. You can look the `BaseHandler` class for all the supported
methods. For instance, you will have access in the function handlers to:

```
// Original Event and Context Lambda objects: 
this.scope.apiGateway.event
this.scope.apiGateway.context

// Express related data:
this.scope.req
this.scope.req.params
this.scope.req.query
this.scope.req.body

// All other custom Serverless JSON-API library data:
this.scope.serverlessJsonApi
this.scope.serverlessJsonApi.db
this.scope.serverlessJsonApi.routes
this.scope.serverlessJsonApi.handlers
this.scope.serverlessJsonApi.app

// Some shortcut methods, the same as above in similar cases:
this.db
this.serializer

this.req        // Same as `this.scope.req`
this.params     // Same as `this.scope.req.params`
this.query      // Same as `this.scope.req.query`
this.body       // Same as `this.scope.req.body`

this.getModelById
this.getModelByLoader
this.getHandlerById
```

You can inspect the `BaseHandler` class to check all the rest of supported methods and shortcuts.

- Please note that other handler methods cannot be called directly as you would do normally, since they are instanced
with context data that would not be available for you normally, so you MUST call them in a special way with 
`this.getHandlerById`, that way you will get a reference to the handler instance with the correct `this` and access to
all the previous scoped and methods and properly contextualized `this`.
