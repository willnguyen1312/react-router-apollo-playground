import {
  Form,
  useActionData,
  createRoutesStub,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { test, beforeAll, afterEach, afterAll } from "vitest";
import "vitest-dom/extend-expect";
import { ApolloProvider } from "@apollo/client";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import user from "@testing-library/user-event";
import { server } from "./mocks/server";
import { Home, client } from "./App6";
import { expect } from "vitest";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("App works with graphQL", async () => {
  render(
    <ApolloProvider client={client}>
      <Home />
    </ApolloProvider>
  );
  expect(screen.getByText("Loading...")).toBeVisible();
  await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
  expect(screen.getByText("Number: 42")).toBeVisible();
});
