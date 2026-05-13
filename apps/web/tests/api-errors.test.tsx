import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApiError, ApiErrorDisplay } from "@/lib/api-errors";

describe("ApiError", () => {
  it("creates error with status and message", () => {
    const err = new ApiError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.name).toBe("ApiError");
  });

  it("isUnauthorized returns true for 401", () => {
    expect(new ApiError(401, "Unauthorized").isUnauthorized).toBe(true);
    expect(new ApiError(403, "Forbidden").isUnauthorized).toBe(false);
  });

  it("isForbidden returns true for 403", () => {
    expect(new ApiError(403, "Forbidden").isForbidden).toBe(true);
  });

  it("isRateLimited returns true for 429", () => {
    expect(new ApiError(429, "Too many").isRateLimited).toBe(true);
  });

  it("isServerError returns true for 5xx", () => {
    expect(new ApiError(500, "ISE").isServerError).toBe(true);
    expect(new ApiError(502, "Bad gateway").isServerError).toBe(true);
    expect(new ApiError(400, "Bad req").isServerError).toBe(false);
  });
});

describe("ApiErrorDisplay", () => {
  it("renders nothing when error is null", () => {
    const { container } = render(<ApiErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error message for 401", () => {
    render(<ApiErrorDisplay error={new ApiError(401, "Unauthorized")} />);
    expect(screen.getByText(/session has expired/i)).toBeInTheDocument();
  });

  it("renders error message for 403", () => {
    render(<ApiErrorDisplay error={new ApiError(403, "Forbidden")} />);
    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
  });

  it("renders error message for 429", () => {
    render(<ApiErrorDisplay error={new ApiError(429, "Rate limited")} />);
    expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
  });

  it("renders error message for 500", () => {
    render(<ApiErrorDisplay error={new ApiError(500, "Server error")} />);
    expect(screen.getByText(/something went wrong on our end/i)).toBeInTheDocument();
  });

  it("renders generic message for other errors", () => {
    render(<ApiErrorDisplay error={new ApiError(0, "Network failure")} />);
    expect(screen.getByText("Network failure")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<ApiErrorDisplay error={new ApiError(500, "Error")} onRetry={onRetry} />);

    const retryBtn = screen.getByText("Retry");
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ApiErrorDisplay error={new ApiError(500, "Error")} />);
    expect(screen.queryByText("Retry")).not.toBeInTheDocument();
  });
});
