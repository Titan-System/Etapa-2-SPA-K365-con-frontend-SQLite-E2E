const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page, request }) => {
  await request.delete("/api/cart");
  await page.goto("/");
});

test("muestra el catálogo de productos consumiendo la API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Productos disponibles" })).toBeVisible();
  await expect(page.getByTestId("product-card")).toHaveCount(6);
  await expect(page.getByText("Coca-Cola 2.25L")).toBeVisible();
});

test("permite agregar productos y actualiza el total del carrito", async ({ page }) => {
  await page.getByRole("button", { name: "Agregar" }).first().click();

  await expect(page.getByTestId("cart-item")).toHaveCount(1);
  await expect(page.getByText("Coca-Cola 2.25L").last()).toBeVisible();
  await expect(page.locator("#cart-total")).toContainText("$ 4.200");
  await expect(page.locator("#cart-badge")).toHaveText("1");
});

test("mantiene el carrito después de recargar la página porque usa SQLite", async ({ page }) => {
  await page.getByRole("button", { name: "Agregar" }).first().click();
  await page.reload();

  await expect(page.getByTestId("cart-item")).toHaveCount(1);
  await expect(page.locator("#cart-total")).toContainText("$ 4.200");
});

test("permite eliminar un producto del carrito", async ({ page }) => {
  await page.getByRole("button", { name: "Agregar" }).first().click();
  await page.getByRole("button", { name: "Eliminar" }).click();

  await expect(page.getByTestId("cart-item")).toHaveCount(0);
  await expect(page.locator("#cart-total")).toContainText("$ 0");
});

test("valida el flujo de compra completo", async ({ page }) => {
  await page.getByRole("button", { name: "Agregar" }).first().click();
  await page.getByRole("button", { name: "Agregar" }).nth(1).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page.getByText(/Compra #\d+ confirmada/)).toBeVisible();
  await expect(page.getByTestId("cart-item")).toHaveCount(0);
  await expect(page.locator("#cart-total")).toContainText("$ 0");
});
