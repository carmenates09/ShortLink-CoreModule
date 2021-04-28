# config/env

## Notes

- All variables get parsed by `serverless` and added to the object `process.env`, so to access the 
environment variables from the handler files just do:

    ```
    process.env.SERVICE_STAGE
    ```

- The `SERVICE_STAGE` variable seems to be repeated without effect in all files, but actually it will
get the correct value depending of the selected environment, so you can probe it in your handler file
with `process.env.SERVICE_STAGE`.

## Caveats

The environment variables MUST be a key pair of string to string, as stated in the official docs at:

https://serverless.com/framework/docs/providers/aws/guide/functions/#environment-variables

A nested object would be more succinct but it will be serialized as `[Object object]` by the internal
`.toString()` serverless call, which will render the environment config useless.

### Related Bug Reports

- https://github.com/serverless/serverless/issues/3080
- https://github.com/serverless/serverless/issues/4843
- https://github.com/serverless/serverless/issues/5209
