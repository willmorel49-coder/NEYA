import { expect, test } from "@playwright/test";

test("homepage shows brand name in french", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/NEYA/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("NEYA");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});
