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
    // Wait 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
    // const { errors, data } = await executeGraphQL({
    //   schema,
    //   source: query,
    //   variableValues: variables,
    //   rootValue: {
    //     value: value++,
    //   },
    // });

    // Sleep 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return HttpResponse.json({
      data: {
        value: value++,
      },
      errors: [{ message: "Error message" }],
    });
  }),

  graphql.query("Error", () => {
    return HttpResponse.json(
      {
        errors: [{ message: "Error message" }],
        data: {
          // Partial data
          value: "Error value",
        },
      },
      // { status: 500 }
    );
  }),

  // mutation
  graphql.mutation("Hello", () => {
    // return HttpResponse.json({ errors: [], data: { message: "Hello" } });
    // Return an error
    return HttpResponse.json({ errors: [{ message: "Error" }], data: null });
  }),
];
