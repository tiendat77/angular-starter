// BottomSheetContainerComponent is intentionally NOT exported here - per the design spec
// (docs/superpowers/specs/2026-09-28-ui-bottom-sheet-design.md, §2.1), it's an internal
// implementation detail attached only via ComponentPortal, never referenced directly by
// consumers. Import it from './bottom-sheet-container.component' within this library's own
// files (e.g. bottom-sheet.service.ts) instead of re-exporting it publicly.
export * from './bottom-sheet-config';
export * from './bottom-sheet-ref';
export * from './bottom-sheet-snap';
export * from './bottom-sheet.provider';
export * from './bottom-sheet.service';
export * from './bottom-sheet.types';
