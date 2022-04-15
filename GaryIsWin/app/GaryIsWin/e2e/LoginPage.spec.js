describe("Login Page", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id("Login Page Button")).tap();
  });

  it("should be visible", async () => {
    await expect(element(by.id("Login Page"))).toBeVisible();
  });

  it("should have 'Login' and 'Back' buttons", async () => {
    await expect(element(by.id("Login Button"))).toBeVisible();
    await expect(element(by.id("Back Button"))).toBeVisible();
  });

  it("should show Start Page after tap", async () => {
    await element(by.id("Back Button")).tap();
    await expect(element(by.id("Start Page"))).toBeVisible();
  });

  it("should show Home Page on success", async () => {
    await element(by.id("username")).typeText("test2");
    await element(by.id("password")).typeText("passwprd");
    await element(by.id("Login Button")).tap();
    await expect(element(by.id("Home Page"))).toBeVisible();
    await element(by.id("Settings Page Button")).tap();
    await element(by.id("Sign Out Button")).tap();
  });
});
