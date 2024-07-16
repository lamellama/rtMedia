// backend.test.js

import { test, expect } from "@wordpress/e2e-test-utils-playwright";
const { URLS } = require("../../utils/urls.js");
import Backend from "../../page_model/backend.js";
import Activity from "../../page_model/activity.js";

test.describe("INTEGRATION WITH BUDDYPRESS FEATURES", () => {
    let backend;
    let activity;

    test.beforeEach(async ({ page, admin }) => {
        backend = new Backend(page);
        activity = new Activity(page);
        await admin.visitAdminPage("admin.php?page=rtmedia-settings#rtmedia-bp");
    });

    test("Enable media toggle and validate from the frontend", async ({ page, admin }) => {

        await backend.enableAnySettingAndSave("#rtm-form-checkbox-7");
        await activity.gotoUserProfile();
        const profileSidebar = await page.locator("#member-primary-nav").textContent();
        expect(profileSidebar).toContain('Media');
    });
    test("Enable media in group toggle and validate from the frontend", async ({ page, admin }) => {
        await backend.enableAnySettingAndSave("#rtmedia-enable-on-group");
        await page.goto(URLS.homepage + "/groups/create/step/group-details/");
        const groupTab = await page.locator("#group-create-tabs").textContent();
        expect(groupTab).toContain('Media');
    });

    test("Enable Allow upload from activity stream and validate from the frontend", async ({ page, admin }) => {
        await backend.enableAnySettingAndSave("#rtmedia-bp-enable-activity");
        await activity.gotoActivityPage();
        await page.locator("#whats-new").click();
        await activity.acceptTermsConsditon();
        const postUpload = page.locator('#rtmedia-add-media-button-post-update');
        await expect(postUpload).toBeVisible();
    });

    test("Enable Create activity for media comments and validate from the frontend", async ({ page, admin }) => {
        await backend.enableAnySettingAndSave("#rtmedia-enable-comment-activity");
        const image = ['uploads/img.jpg'];
        await activity.upploadImages(image);
        await page.reload();
        await page.locator("//ul[contains(@class, 'rtm-activity-photo-list')]").first().click();
        await page.waitForTimeout(2000);
        await page.locator("//div[contains(@class, 'rtm-media-single-comments')]//textarea[@id='comment_content']").fill("This is a test comment")
        await page.locator("//input[@id='rt_media_comment_submit']").click();

        await activity.gotoActivityPage();
        const commentActivity = await page.locator("//li[contains(@class, 'activity-item')]").first().textContent();
        expect(commentActivity).toContain("This is a test comment");
    });

    test("Enable Create activity for media Likes and validate from the frontend", async ({ page, admin }) => {
        await backend.enableAnySettingAndSave("#rtmedia-enable-like-activity");
        const image = ['uploads/img.jpg'];
        await activity.upploadImages(image);
        await page.reload();
        await page.locator("//ul[contains(@class, 'rtm-activity-photo-list')]").first().click();
        await page.waitForTimeout(2000);
        await page.waitForSelector("//div[contains(@class, 'rtmedia-actions-before-comments')]//button[contains(@class, 'rtmedia-like')]");
        await page.locator("//div[contains(@class, 'rtmedia-actions-before-comments')]//button[contains(@class, 'rtmedia-like')]").click();
        await activity.gotoActivityPage();
        const likeAcitivity = await page.locator("//li[contains(@class, 'activity-item')]").first().textContent();
        expect(likeAcitivity).toContain("liked");
    });
});