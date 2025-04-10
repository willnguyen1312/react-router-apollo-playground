import {
  Form,
  useActionData,
  createRoutesStub,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { test } from "vitest";
import "vitest-dom/extend-expect";

import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";

test("loaders work", async () => {
  let RoutesStub = createRoutesStub([
    {
      path: "/",
      HydrateFallback: () => null,
      Component() {
        let data = useLoaderData();
        return <pre data-testid="data">Message: {data.message}</pre>;
      },
      loader() {
        return Response.json({ message: "hello" });
      },
    },
  ]);

  render(<RoutesStub />);

  await waitFor(() => screen.findByText("Message: hello"));
});

test("actions work", async () => {
  let RoutesStub = createRoutesStub([
    {
      path: "/",
      Component() {
        let data = useActionData() as { message: string } | undefined;
        return (
          <Form method="post">
            <button type="submit">Submit</button>
            {data ? <pre>Message: {data.message}</pre> : null}
          </Form>
        );
      },
      action() {
        return Response.json({ message: "hello" });
      },
    },
  ]);

  render(<RoutesStub />);

  user.click(screen.getByText("Submit"));
  await waitFor(() => screen.findByText("Message: hello"));
});

test("params work", async () => {
  let RoutesStub = createRoutesStub([
    {
      path: "/test/:id",
      HydrateFallback: () => null,
      Component() {
        let params = useParams();
        let data = useLoaderData();
        return (
          <pre data-testid="data">
            Message: {data.message} {params.id}
          </pre>
        );
      },
      loader() {
        // console.log(params);
        // console.log(request.url);
        // console.log(context);
        return Response.json({ message: "hello" });
      },
    },
  ]);

  render(<RoutesStub initialEntries={["/test/123"]} />);

  await waitFor(() => screen.findByText("Message: hello 123"));
});
