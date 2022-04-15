describe("Start Page", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should be visible", async () => {
    await expect(element(by.id("Start Page"))).toBeVisible();
  });

  it("should have 'Login' and 'Sign Up' buttons", async () => {
    await expect(element(by.id("Login Page Button"))).toBeVisible();
    await expect(element(by.id("Sign Up Page Button"))).toBeVisible();
  });
});
