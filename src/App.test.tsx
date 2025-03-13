import {
  Form,
  useActionData,
  createRoutesStub,
  useLoaderData,
} from "react-router-dom";
import { test, expect } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import user from "@testing-library/user-event";

test("actions work", async () => {
  let RoutesStub = createRoutesStub([
    {
      path: "/",
      Component() {
        let actionData = useActionData();
        console.log("actionData: ", actionData);
        let data = useLoaderData();
        console.log("data: ", data);
        return (
          <Form method="post">
            <button type="submit">Submit</button>
            {data ? <pre>Message: {data.message}</pre> : null}
          </Form>
        );
      },
      loader() {
        return { message: "hello" };
      },
      action() {
        return { takada: "hello" };
      },
    },
  ]);

  render(<RoutesStub />);

  screen.debug();

  //   user.click(screen.getByTestId("submit"));
  //   const btn = screen.getByRole("button", { name: "Submit" });
  //   user.click(btn);
  //   await waitFor(() => screen.findByText("Message: hello"));
});
