// Compile-only smoke test for js/cider.d.ts. Not run by Playwright — this
// file is type-checked by the ci:types step (`tsc --noEmit`). If the shape
// of window.CiderUI drifts from the .d.ts declarations, this fails to
// compile and CI surfaces the mismatch.
//
// Intentionally uses `any`-ish casts for DOM nodes since we're only
// asserting the *types* expose the expected method surface, not runtime
// behaviour.

/// <reference path="../js/cider.d.ts" />

import type {
  ComponentLifecycle,
  DialogAPI,
  HUDAPI,
  HUDInstance,
  SliderAPI,
} from "../js/cider.d.ts";

declare const dialogEl: HTMLDialogElement;
declare const inputEl: HTMLInputElement;

// Global functions
window.openDialog(dialogEl);
window.closeDialog(dialogEl);
window.openActionSheet(dialogEl);
window.closeActionSheet(dialogEl);
const hud: HUDInstance = window.showHUD("Saved");
hud.dismiss();
hud.element.classList.add("x");

// Scoped API
const dialog: DialogAPI = window.CiderUI.dialog;
dialog.init();
dialog.init(document);
dialog.open(dialogEl);
dialog.close(dialogEl);
dialog.destroy(dialogEl);

const tabs: ComponentLifecycle = window.CiderUI.tabs;
tabs.init();

const slider: SliderAPI = window.CiderUI.slider;
slider.update(inputEl);

const hudApi: HUDAPI = window.CiderUI.hud;
hudApi.show("Hello", { duration: 2000, icon: "<svg/>" });
hudApi.destroy();
