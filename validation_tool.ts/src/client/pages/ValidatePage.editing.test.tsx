import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { setupValidatePageTests, TestWrapper } from "../../test_utils";

describe("ValidatePage - Editing", () => {
  setupValidatePageTests();

  test("allows editing multiple fields and updates their states", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    const addressInput = screen.getByLabelText(
      /address 1/i,
    ) as HTMLTextAreaElement;
    const companyInput = screen.getByLabelText(
      /company/i,
    ) as HTMLTextAreaElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLTextAreaElement;

    // Edit Address 1
    fireEvent.change(addressInput, { target: { value: "New Address Line 1" } });
    expect(addressInput.value).toBe("New Address Line 1");

    // Edit Company
    fireEvent.change(companyInput, {
      target: { value: "New Company Name Inc." },
    });
    expect(companyInput.value).toBe("New Company Name Inc.");

    // Clear Email field
    fireEvent.change(emailInput, { target: { value: "" } });
    expect(emailInput.value).toBe("");

    // Ensure other fields remain unchanged (implicit by only changing specified inputs,
    // but can add an explicit check if needed, though usually not necessary).
  });

  test("allows adding a new field to the current record", async () => {
    render(<TestWrapper />);
    await waitFor(() =>
      expect(screen.getByLabelText(/address 1/i)).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByPlaceholderText(/website_url/i), {
      target: { value: "website_new" },
    });
    fireEvent.change(screen.getByPlaceholderText("Value for new field"), {
      target: { value: "http://new.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add field/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/website new/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("http://new.com")).toBeInTheDocument();
    });
  });
});
