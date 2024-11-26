import { graphql as executeGraphQL, buildSchema } from "graphql";
import { graphql, HttpResponse } from "msw";

const schema = buildSchema(` 
  type Query {
    value: Int!
  }
`);

let value = 0;
export const handlers = [
  // query
  graphql.query("GetNumber", async ({ query, variables }) => {
    // Wait 250ms
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const { errors, data } = await executeGraphQL({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        value: value++,
      },
    });

    return HttpResponse.json({ errors, data });
  }),

  graphql.query("Error", async () => {
    return HttpResponse.json({
      errors: [{ message: "Error" }],
      data: {
        value: "^o^",
      },
    });
  }),

  // mutation
  graphql.mutation("Hello", async () => {
    // return HttpResponse.json({ errors: [], data: { message: "Hello" } });
    // Return an error
    return HttpResponse.json({ errors: [{ message: "Error" }], data: null });
  }),
];
