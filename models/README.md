# models

This is the same as the models in a MVC architecture, by setting the model Schema you will have access to an array of
features like validations both builtin and custom, getters and setters for value conversion, easy query methods to use
compared with the ugly DynamoDB ones, and so on.

To know mostly of the available options that you can set to the schema, refer to the underlying used [Dynamoose ORM](https://dynamoosejs.com/api/schema),
and for the ORM query method structure, refer to https://dynamoosejs.com/api/model.

We also tweaked the ORM behavior a little bit and added support for a better way of handling validations, so not use the
Dynamoose documented validations, but ours, which are modeled after [Sequelize validations](http://docs.sequelizejs.com/manual/models-definition.html#validations)
so you can use it as a guide to add validations.

We use under the hood the awesome `https://github.com/chriso/validator.js` library, so you can see the full array of
supported builtin validations there.

In order to use our custom validations, you need to use our custom methods for CRUD operations, named: `xCreate`, `xGet`,
`xGetAll` and `xDelete`.

Also, there are some added custom validations in the form of properties, which are:

  - `readonly`, which trigger an error if you pass the attribute to be modified, so this is mostly useful when setting
  too the `default` property.

## Notes

- Add here one file per model in your service, for example `user`, `post`, and so on.

- The following MUST be specified attributes for all schemas to the blueprint to work properly:

    - `id`, used for uniqueness across items on same table.
    
    - `type` used for the generic querying and filtering interfaces.
    
    - `createdAt` used as the default sorting order in the generic and filtering interfaces.

- The same as with `config/resources/dynamodb`, you MUST add an index for the `createdAt` attribute with `type` as the
hash key, since it will be used as a range key for the default sorting functionality.

  The index MUST be named exactly as it was defined in the DynamoDB Resource config section.

- So, in short, you need so set the same indexes on both the DynamoDB Resources config section and in the model Schema
definition. See the `user` schema for an example.

- Similar as above, you MUST add one extra index for each sorting attribute that you will query later, for instance, if
you want to sort by `username`, you MUST add and index on type as hash key, and `username` as the range key.

  The index MUST be named exactly as it was defined in the DynamoDB Resource config section.

- For validations you add a property on the attribute named `validations`, which MUST be an object keyed with the
validation name according to `https://github.com/chriso/validator.js`.

  If the validation DOES NOT need a parameter to be passed in (excluding `string` which is internally passed as the
attribute value), you MUST set its value to `true` in order for it to be enabled. Ex: `isAlpha: true`.

  If the validation DOES require parameters, just set its value as an array with the parameters ordered as needed.
Ex: `isIP: [4]`.

- If need a custom validation that it is not available in `https://github.com/chriso/validator.js`, just add a function
whose parameters are `(value, db)` and with return type of `boolean | string`.

  `value` is the attribute value being validated.
  
  `db` an object exposing `getModelByLoader` which allows you to access other available models.
  
  If you return `true`, the validation passes.
  
  If you return `false`, a `string` or thrown an error inside the custom validation, the validation won't pass and a 
  validation error will be returned, whose message will be the string, or the `message` attribute of the thrown error.
  
  The custom validation is an async function, so you can make any async logic you want there if you use the `async/await`
  pattern.

- If you have an attribute whose a `default` value is always set, and you don't want that is never modified, just add
the `readonly` property to the attribute definition.

- We RECOMMEND you to ALWAYS set the `At` suffix on Date related attributes, like `createdAt`, that way you can easily
identify them. 

- ALWAYS set the Date related attributes as Number type, that will easy later querying operations. If you want it to be
an ISO8601 in your code, do not worry, just add a pair of getter and setter on your attribute, to convert it back and
forth.

- To get the instantiated model back from your handlers, just get it with the model id already set in the loader by 
yourself:

  ```
  const User = this.getModelByLoader(userModelLoader);
  const User = this.getModelById(userModelLoader.id);
  
  // Or the static one, that we advise you to NEVER use it for obvious reasons:
  const User = this.getModelById('user');
  ``` 

- For querying your models, you can use the native [Dynamoose ORM methods](https://dynamoosejs.com/api/model) (we advise
you avoid it as long as you can and use our custom methods), or use our custom specialized methods, with add extra 
functionality to overcome some Dynamoose and DynamoDB limitations.

  Below there are the custom CRUD methods with its syntax:

  - `xCreate(data)`: Inserts a new model item into the database. Just pass the model data with the attribute values 
to be set.

  - `xGet(keyMap)`: Gets a single item from the database. You MUST pass an object whose keys are the attributes that form
the key, like `{ id: 'some-id' }`, for instance.

  - `xUpdate(keyMap, data): Updates a single item from the database. You MUST pass an object whose keys are the attributes 
that form the key, like `{ id: 'some-id' }`, for instance, and then the data to be updated.

  - `xDelete(keyMap)`: Deletes a single item from the database. You MUST pass an object whose keys are the attributes 
that form the key, like `{ id: 'some-id' }`, for instance.

  - `xGetAll(queryObject)`: Gets all items that fulfill the passed down `queryObject` parameter. The query parameter
complies with [JSON-API query parameter](https://jsonapi.org/format), so you can read the JSON-API to know about sorting, 
pagination, sparse fields, and filtering.

- Here are some examples on how to build the query object for `xGetAll(queryObject)`:
  
  - If you want to sort by a specific field, just pass:
  
    ```
    {
      sort: '-username' // Or `+username` or `username`, default is ascending, like if you specified `+username`.
    }
    ```
    Default sorting value is `sort: 'createdAt'`, ascending.
    
    **IMPORTANT!** Remember that you MUST add a Global Secondary Index for each attribute that you want to sort over.

  - If you want to paginate, we only support [cursor based pagination](https://jsonapi.org/profiles/ethanresnick/cursor-pagination)
  so you can read over there for allowed values.
  
    In short, the default pagination is 10, and the hard pagination limit is 25.
    
    You can specify the values as following:
    
    ```
    {
      page: {
        // Default is 10, hard limit is 25.
        size : 5,
          
        // If you want to start over some cursor, just add `after`.
        // IMPORTANT! The cursor must be a valid previously generated cursor from the API. See the `links[next]` in responses.
        // If not set start at the very first item, with no offset at all.
        after: 'some-cursor-value-here'
      }
    }
    ```
  
  - If you want only a small attributes subset, just add a sparse fieldset option to the query:
  
    ```
    {
      fields: 'id,username'
    }
    ```
    
    And it will return only those specified fields in the response, that way you can limit the response size to only the
    needed fields.
  
  - If you need to further filter the items by some custom criteria, just use the following syntax examples.
  
    **IMPORTANT:** Multiple operators by field is not supported.
  
    - The conditional supported operators are `$and`, `$or` and `$not`.
    
    - The filter supported operators are `$null`, `$eq`, `$lt`, `$le`, `$ge`, `$gt`, `$beginsWith`, `$between`, `$contains`,
     `$in`.
    
    The following is interpreted as an AND between the attributes:
    
    ```
    {
      filter: {
        username : {
          $eq: 'some-username'
        },
        givenName: {
          $eq: 'some-given-name'
        }
      }
    }
    ```
    
    That is equivalent to specify directly the `$and` conditional operator:
    
    ```
    {
      filter: {
        $and: {
          {
            username : {
              $eq: 'some-username'
            },
            givenName: {
              $eq: 'some-given-name'
            }
          }
        }
      }
    }
    ```
    
    You can query too with an `$or` conditional operator:
    
    ```
    {
      filter: {
        $or: {
          {
            username : {
              $eq: 'some-username'
            },
            givenName: {
              $eq: 'some-given-name'
            }
          }
        }
      }
    }
    ```
  
    You can even negate values with `$not`:
    
    ```
    {
      filter: {
        username : {
          $not: {
            $eq: 'some-username'
          }
        }
      }
    }
    ```
