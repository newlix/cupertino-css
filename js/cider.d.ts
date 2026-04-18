/**
 * Type declarations for ciderui's interactive components.
 *
 * All components attach to `window.CiderUI.*` and auto-initialise on
 * DOMContentLoaded and `htmx:afterSettle`. Manual `init(root?)` calls
 * are only needed when injecting markup from non-htmx sources.
 */

export interface ComponentLifecycle {
  /** (Re-)scan `root` (default: document) for unitialised instances and wire them. */
  init(root?: Document | HTMLElement): void;
  /** Tear down a specific instance. Element must have been `init`-ed previously. */
  destroy(el?: HTMLElement): void;
}

export interface DialogAPI extends ComponentLifecycle {
  open(dialog: HTMLDialogElement): void;
  close(dialog: HTMLDialogElement): void;
}

/** Action sheets reuse <dialog> under the hood. */
export type ActionSheetAPI = DialogAPI;

export interface HUDShowOptions {
  /** Auto-dismiss after N ms. Default 1500. Pass <=0 for persistent HUD. */
  duration?: number;
  /** Raw SVG markup. Sanitised (script/foreignObject stripped, on* attrs removed). */
  icon?: string;
}

export interface HUDInstance {
  /** Play the dismiss animation and remove the HUD. Safe to call multiple times. */
  dismiss(): void;
  element: HTMLElement;
}

export interface HUDAPI {
  init(): void;
  show(label: string, options?: HUDShowOptions): HUDInstance;
  destroy(): void;
}

export interface SliderAPI extends ComponentLifecycle {
  /** Force re-computation of the fill/thumb position from the element's value. */
  update(el: HTMLInputElement | HTMLElement): void;
}

export interface ToastShowOptions {
  /** Short label (required; can pass a string directly to showToast). */
  title?: string;
  /** Secondary supporting text below the title. */
  message?: string;
  /** Visual treatment — changes icon + accent colour. */
  variant?: "info" | "success" | "error";
  /** Auto-dismiss after N ms. Default 4000. Pass <=0 for sticky. */
  duration?: number;
}

export interface ToastInstance {
  dismiss(): void;
  element: HTMLElement;
}

export interface ToastAPI {
  init(): void;
  show(titleOrOptions: string | ToastShowOptions): ToastInstance;
  destroy(): void;
}

export interface CiderUIGlobal {
  actionSheet: ActionSheetAPI;
  dialog: DialogAPI;
  hud: HUDAPI;
  picker: ComponentLifecycle;
  popover: ComponentLifecycle;
  sidebar: ComponentLifecycle;
  slider: SliderAPI;
  stepper: ComponentLifecycle;
  tabs: ComponentLifecycle;
  toast: ToastAPI;
  tokenField: ComponentLifecycle;
  verificationCode: ComponentLifecycle;
}

declare global {
  interface Window {
    CiderUI: CiderUIGlobal;
    openDialog(dialog: HTMLDialogElement): void;
    closeDialog(dialog: HTMLDialogElement): void;
    openActionSheet(dialog: HTMLDialogElement): void;
    closeActionSheet(dialog: HTMLDialogElement): void;
    showHUD(label: string, options?: HUDShowOptions): HUDInstance;
    showToast(titleOrOptions: string | ToastShowOptions): ToastInstance;
  }
}

export {};
