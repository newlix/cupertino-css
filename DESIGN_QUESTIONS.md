# Design Questions

## 1. Card padding p-4 (16px) → p-5 (20px) (card.css)

Card uses 16px padding with 12px radius. The padding:radius ratio (1.33x) is tight — content optically bites into corners. Apple's System Settings cards use ~1.67x ratio.

**Options:**
- (a) Increase to `p-5` (20px) for better breathing room (1.67x ratio)
- (b) Keep current — tight density is intentional for compact UI

## 2. Button default radius 12px → 8px (button.css)

Default button uses `--radius` (12px) — same as card. When buttons are inside cards, they share the same corner radius as their container, breaking the visual hierarchy rule (nested elements should have smaller radius).

Apple's web properties (apple.com, iCloud) use ~8px on buttons.

**Options:**
- (a) Change default to `--radius-sm` (8px), btn-small to `--radius-xs` (5px), btn-large to `--radius` (12px)
- (b) Keep current — 12px rounded look is part of the brand identity
