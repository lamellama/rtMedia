import { test, expect } from "@wordpress/e2e-test-utils-playwright";
import Backend from "../../test_utils/backend.js";
import Activity from "../../test_utils/activity.js";

test.describe("Comment media BUDDYPRESS FEATURES", () => {
    let backend;
    let activity;

    test.beforeEach(async ({ page, admin }) => {
        backend = new Backend(page);
        activity = new Activity(page);
        await admin.visitAdminPage("admin.php?page=rtmedia-settings#rtmedia-bp");

    });

    test("Validated comment media in the frontend activity page", async ({ page }) => {
        await backend.enableAnySettingAndSave("//label[@for='rtm-form-checkbox-9']");
        await activity.gotoActivityPage();
        await page.locator("#whats-new").fill("This is a demo post");
        await page.locator("#aw-whats-new-submit").click();
        await page.locator("//a[@data-bp-tooltip='Comment']").first().click();

        const commentUpload = page.locator("//button[@class='rtmedia-comment-media-upload']").first();
        await expect(commentUpload).toBeEnabled();
    })
});