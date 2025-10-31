import {
  Form,
  useActionData,
  createRoutesStub,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { test, beforeAll, afterEach, afterAll, vi } from "vitest";
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
import { FETCH_NUMBER_QUERY, GET_NUMBER_QUERY, Home, client } from "./App6";
import { expect } from "vitest";
import * as ApolloClientModule from "@apollo/client";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("App works with graphQL", async () => {
  const useQuerySpy = vi.spyOn(ApolloClientModule, "useQuery");

  render(
    <ApolloProvider client={client}>
      <Home />
    </ApolloProvider>
  );

  // Now you can assert on the spy
  expect(useQuerySpy).toHaveBeenCalled();
  expect(useQuerySpy).toHaveBeenCalledTimes(1);
  expect(useQuerySpy).toHaveBeenCalledWith(GET_NUMBER_QUERY);
  expect(useQuerySpy).not.toHaveBeenCalledWith(FETCH_NUMBER_QUERY);

  expect(screen.getByText("Loading...")).toBeVisible();
  await waitForElementToBeRemoved(() => screen.queryByText("Loading..."));
  expect(screen.getByText("Number: 42")).toBeVisible();

  // Clean up the spy
  useQuerySpy.mockRestore();
});
