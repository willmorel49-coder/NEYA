import { expect, test } from "@playwright/test";

test("coherence cardiaque opt-in screen shows safety copy", async ({
  page,
}) => {
  await page.goto("/exercices/coherence-cardiaque");
  await expect(
    page.getByRole("heading", { name: "Cohérence cardiaque" }),
  ).toBeVisible();
  await expect(page.getByText(/ne remplace pas un suivi/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Commencer" }),
  ).toBeVisible();
  await expect(page.getByText("3114")).toBeVisible();
});
