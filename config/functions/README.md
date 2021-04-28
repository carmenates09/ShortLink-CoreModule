# config/functions

This is a regular `functions` serverless configuration declaration, so feel free to add parameters the same as
you did until now.

## Notes

- Since this boilerplate is very opinionated and uses Express under the hood, it is recommended for several reasons
that you expose only a single endpoint from Express as a Lambda handler, like `handler: handler.index`, and then
use that endpoint in every single `handler` parameter, since Express was delegated with the task to discriminate
the route handlers.

- Since there will be several endpoints segregated in one Lambda handler, it is very possible the Lambda is always
"hot" thus reducing the cold start time.

- To support the regular Lambda workflow, the `standalone.yml` and `handlers/stanadlone.ts` files are added, so you
can have regular Lambda handlers besides the `serverless-http` express handlers.
