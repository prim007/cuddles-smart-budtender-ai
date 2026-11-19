import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HashNavigation from "./HashNavigation";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("chat anchor navigation", () => {
  it("reaches a chat section that appears after lazy loading", async () => {
    const scroll = vi.fn();
    render(<MemoryRouter initialEntries={["/#demo"]}><HashNavigation /></MemoryRouter>);
    const target = document.createElement("section");
    target.id = "demo";
    target.scrollIntoView = scroll;
    document.body.append(target);
    await waitFor(() => expect(scroll).toHaveBeenCalledWith({ block: "start", behavior: "auto" }));
    target.remove();
  });
});