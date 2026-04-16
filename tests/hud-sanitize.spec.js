/**
 * Security tests for the showHUD SVG sanitizer.
 *
 * showHUD(label, { icon }) accepts raw SVG markup from the caller. The
 * sanitizer uses DOMParser with image/svg+xml and drops dangerous
 * elements / event handlers before adopting the node. Any regression
 * here is an XSS hole for consumers who pass user-controlled icons
 * (rare but legitimate, e.g. emoji pickers, theme editors).
 */
import { test, expect } from "@playwright/test";

test.describe("HUD SVG sanitizer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/hud.html");
    await page.waitForLoadState("load");
  });

  test("strips <script> inside SVG", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const rendered = await page.evaluate(() => {
      window.__XSS_FIRED__ = false;
      window.showHUD("hi", {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>window.__XSS_FIRED__=true</script><circle cx="12" cy="12" r="8"/></svg>',
      });
      const svg = document.querySelector("#hud-container svg");
      return {
        fired: window.__XSS_FIRED__,
        scriptCount: svg?.querySelectorAll("script").length ?? -1,
        circles: svg?.querySelectorAll("circle").length ?? -1,
      };
    });

    expect(rendered.fired).toBe(false);
    expect(rendered.scriptCount).toBe(0);
    expect(rendered.circles).toBe(1);
    expect(errors).toEqual([]);
  });

  test("strips on* event handlers", async ({ page }) => {
    const result = await page.evaluate(() => {
      window.__XSS_FIRED__ = false;
      window.showHUD("hi", {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" onload="window.__XSS_FIRED__=true"><circle cx="12" cy="12" r="8" onclick="window.__XSS_FIRED__=true"/></svg>',
      });
      const svg = document.querySelector("#hud-container svg");
      return {
        fired: window.__XSS_FIRED__,
        svgOnload: svg?.getAttribute("onload"),
        circleOnclick: svg?.querySelector("circle")?.getAttribute("onclick"),
      };
    });

    expect(result.fired).toBe(false);
    expect(result.svgOnload).toBeNull();
    expect(result.circleOnclick).toBeNull();
  });

  test("strips <foreignObject> and href-bearing elements", async ({ page }) => {
    const result = await page.evaluate(() => {
      window.showHUD("hi", {
        icon: `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <foreignObject width="24" height="24">
              <iframe src="javascript:window.__XSS_FIRED__=true"></iframe>
            </foreignObject>
            <a href="javascript:alert(1)"><circle cx="12" cy="12" r="4"/></a>
            <use href="#anything"/>
            <circle cx="6" cy="6" r="2"/>
          </svg>
        `,
      });
      const svg = document.querySelector("#hud-container svg");
      return {
        foreignObject: svg?.querySelectorAll("foreignObject").length,
        iframes: svg?.querySelectorAll("iframe").length,
        anchors: svg?.querySelectorAll("a").length,
        use: svg?.querySelectorAll("use").length,
        circles: svg?.querySelectorAll("circle").length,
        fired: window.__XSS_FIRED__,
      };
    });

    expect(result.foreignObject).toBe(0);
    expect(result.iframes).toBe(0);
    expect(result.anchors).toBe(0);
    expect(result.use).toBe(0);
    // Outer circle was inside stripped <a>, inner circle survives
    expect(result.circles).toBeGreaterThanOrEqual(1);
    expect(result.fired).toBeFalsy();
  });

  test("falls back to default icon when input is non-SVG garbage", async ({
    page,
  }) => {
    const hasDefault = await page.evaluate(() => {
      window.showHUD("hi", {
        icon: "not svg at all <img src=x onerror=alert(1)>",
      });
      const svg = document.querySelector("#hud-container svg");
      return {
        present: !!svg,
        ariaHidden: svg?.getAttribute("aria-hidden"),
      };
    });

    expect(hasDefault.present).toBe(true);
    expect(hasDefault.ariaHidden).toBe("true");
  });

  test("label content is text-only (no HTML injection via label)", async ({
    page,
  }) => {
    const result = await page.evaluate(() => {
      window.__XSS_FIRED__ = false;
      window.showHUD("<img src=x onerror='window.__XSS_FIRED__=true'>");
      const labelEl = document.querySelector("#hud-container .hud-label");
      return {
        text: labelEl?.textContent,
        innerHTML: labelEl?.innerHTML,
        fired: window.__XSS_FIRED__,
      };
    });

    // Label is set via textContent, so raw HTML appears as literal text
    expect(result.text).toBe("<img src=x onerror='window.__XSS_FIRED__=true'>");
    expect(result.innerHTML).not.toContain("<img");
    expect(result.fired).toBe(false);
  });
});
