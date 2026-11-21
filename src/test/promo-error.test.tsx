import { describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { promoErrorDescription } from "@/lib/promoError";
import EmailCapture from "@/components/EmailCapture";
import SignupBanner from "@/components/SignupBanner";
import SignupPromoModal from "@/components/SignupPromoModal";

const mocks = vi.hoisted(() => ({ toast: vi.fn(), invoke: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/GoogleAnalytics", () => ({
  trackEvent: vi.fn(), trackSignupComplete: vi.fn(), trackLeadCaptured: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: { getSession: vi.fn(async () => ({ data: { session: { user: { email: "owner@example.com" } } } })) },
  functions: { invoke: mocks.invoke },
} }));

function httpError(status: number, body: unknown) {
  return new FunctionsHttpError(new Response(JSON.stringify(body), { status }));
}

describe("discount account-error handling", () => {
  beforeEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it.each([401, 403])("reads actionable %i response data without consuming the original response", async (status) => {
    const error = httpError(status, { error: `account-error-${status}` });
    expect(await promoErrorDescription(error, "fallback")).toBe(`account-error-${status}`);
    expect(error.context.bodyUsed).toBe(false);
  });

  it("keeps internal server details out of the form", async () => {
    expect(await promoErrorDescription(httpError(500, { error: "private-details" }), "fallback")).toBe("fallback");
  });

  it("handles network errors and malformed account responses safely", async () => {
    expect(await promoErrorDescription(new Error("network"), "fallback")).toBe("fallback");
    expect(await promoErrorDescription(httpError(403, { error: 123 }), "fallback")).toBe("fallback");
    expect(await promoErrorDescription(new FunctionsHttpError(new Response("invalid-json", { status: 403 })), "fallback")).toBe("fallback");
  });

  it.each([
    ["chat capture", EmailCapture],
    ["inline banner", SignupBanner],
    ["popup", SignupPromoModal],
  ] as const)("%s passes the rejected account response to the user and allows correction", async (_name, Form) => {
    mocks.invoke.mockResolvedValue({ error: httpError(403, { error: "account-email-mismatch" }) });
    render(<Form />);
    if (Form === SignupPromoModal) fireEvent.mouseLeave(document, { clientY: 0 });
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "other@example.com" } });
    const form = input.closest("form");
    if (!form) throw new Error("Discount form missing");
    fireEvent.submit(form);
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({
      description: "account-email-mismatch", variant: "destructive",
    })));
    expect(mocks.invoke).toHaveBeenCalledWith("send-promo-code", expect.objectContaining({
      body: expect.objectContaining({ email: "other@example.com" }),
    }));
    await waitFor(() => expect(input).toBeEnabled());
    fireEvent.change(input, { target: { value: "owner@example.com" } });
    expect(input).toHaveValue("owner@example.com");
  });
});