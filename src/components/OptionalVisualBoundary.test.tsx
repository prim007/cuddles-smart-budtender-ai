import { lazy, Suspense } from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OptionalVisualBoundary } from "./OptionalVisualBoundary";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("optional visual loading", () => {
  it("keeps the page usable when a lazy module fails to import", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const FailedScene = lazy(() => Promise.reject(new TypeError("Importing a module script failed.")));
    render(
      <main>
        <a href="/for-individuals">Individuals</a>
        <OptionalVisualBoundary fallback={<img alt="Static mascot" />}>
          <Suspense fallback={null}><FailedScene /></Suspense>
        </OptionalVisualBoundary>
      </main>,
    );
    expect(await screen.findByRole("img", { name: "Static mascot" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Individuals" })).toHaveAttribute("href", "/for-individuals");
  });

  it("shows a successfully loaded visual instead of the fallback", async () => {
    const Scene = lazy(() => Promise.resolve({ default: () => <div data-testid="scene" /> }));
    render(
      <OptionalVisualBoundary fallback={<img alt="Static mascot" />}>
        <Suspense fallback={null}><Scene /></Suspense>
      </OptionalVisualBoundary>,
    );
    expect(await screen.findByTestId("scene")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Static mascot" })).not.toBeInTheDocument();
  });
});