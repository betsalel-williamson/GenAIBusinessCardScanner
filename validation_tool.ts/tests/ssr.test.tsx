import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { JSDOM } from "jsdom";
import { StaticRouter } from "react-router";
import App from "../src/client/App";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { act } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const handlers = [
  http.get("/api/files", () => {
    return HttpResponse.json([
      { filename: "test1.json", status: "source", type: "batch" },
      { filename: "test2.json", status: "in_progress", type: "record" },
    ]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SSR Hydration", () => {
  it("should not produce hydration warnings", async () => {
    const url = "/";

    // Capture console.error output
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Simulate server-side rendering
    const ssrHtml = ReactDOMServer.renderToString(
      <React.StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </React.StrictMode>,
    );

    // Simulate client-side hydration
    const dom = new JSDOM(
      `<!DOCTYPE html><html><body><div id="root">${ssrHtml}</div></body></html>`,
      { url: "http://localhost/" },
    );
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;

    // Set the client-side URL to match the server-rendered URL
    global.window.history.pushState({}, "test", url);

    const rootElement = document.getElementById("root") as HTMLElement;

    await act(async () => {
      hydrateRoot(
        rootElement,
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>,
      );
    });

    // Log all captured console.error calls for debugging
    console.log("Captured console.error calls:", consoleErrorSpy.mock.calls);

    // Assert that no console.error calls (which would include hydration warnings) were logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
