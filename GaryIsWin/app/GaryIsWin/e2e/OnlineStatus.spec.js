const {
  otherDevice,
  otherExpect,
  otherElement,
  otherBy,
} = require("./devices");

describe("Friend Status Indicator", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await otherDevice.reloadReactNative();
  });

  it("should indicate when friend becomes online", async () => {
    await element(by.id("Login Page Button")).tap();
    await element(by.id("username")).typeText("test2");
    await element(by.id("password")).typeText("passwprd");
    await element(by.id("Login Button")).tap();
    await expect(element(by.id("Home Page"))).toBeVisible();
    await element(by.id("Friends Page Button")).tap();
    await expect(element(by.id("Friends Page"))).toBeVisible();
    const player2 = element(by.text("test3"));
    await expect(player2).toExist();
    await expect(player2).toHaveId("is offline");

    await otherElement(otherBy.id("Login Page Button")).tap();
    await otherElement(otherBy.id("username")).typeText("test3");
    await otherElement(otherBy.id("password")).typeText("password");
    await otherElement(otherBy.id("Login Button")).tap();
    await otherExpect(otherElement(otherBy.id("Home Page"))).toBeVisible();
    await otherElement(otherBy.id("Friends Page Button")).tap();
    await otherExpect(otherElement(otherBy.id("Friends Page"))).toBeVisible();
    const player1 = otherElement(otherBy.text("test2"));
    await otherExpect(player1).toExist();
    await otherExpect(player1).toHaveId("is online");

    await expect(player2).toHaveId("is online");
  });
});
