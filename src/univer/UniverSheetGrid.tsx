import { useEffect, useRef } from "react";
import { createUniver, LocaleType, defaultTheme, type IWorkbookData } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import { UniverSheetsFilterPreset } from "@univerjs/preset-sheets-filter";
import { UniverSheetsSortPreset } from "@univerjs/preset-sheets-sort";
import { UniverSheetsFindReplacePreset } from "@univerjs/preset-sheets-find-replace";
import { UniverSheetsDataValidationPreset } from "@univerjs/preset-sheets-data-validation";
import { UniverSheetsConditionalFormattingPreset } from "@univerjs/preset-sheets-conditional-formatting";

import sheetsCoreFrFR from "@univerjs/preset-sheets-core/locales/fr-FR";
import sheetsFilterFrFR from "@univerjs/preset-sheets-filter/locales/fr-FR";
import sheetsSortFrFR from "@univerjs/preset-sheets-sort/locales/fr-FR";
import sheetsFindReplaceFrFR from "@univerjs/preset-sheets-find-replace/locales/fr-FR";
import sheetsDataValidationFrFR from "@univerjs/preset-sheets-data-validation/locales/fr-FR";
import sheetsConditionalFormattingFrFR from "@univerjs/preset-sheets-conditional-formatting/locales/fr-FR";

import sheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import sheetsFilterEnUS from "@univerjs/preset-sheets-filter/locales/en-US";
import sheetsSortEnUS from "@univerjs/preset-sheets-sort/locales/en-US";
import sheetsFindReplaceEnUS from "@univerjs/preset-sheets-find-replace/locales/en-US";
import sheetsDataValidationEnUS from "@univerjs/preset-sheets-data-validation/locales/en-US";
import sheetsConditionalFormattingEnUS from "@univerjs/preset-sheets-conditional-formatting/locales/en-US";

import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/preset-sheets-filter/lib/index.css";
import "@univerjs/preset-sheets-sort/lib/index.css";
import "@univerjs/preset-sheets-find-replace/lib/index.css";
import "@univerjs/preset-sheets-data-validation/lib/index.css";
import "@univerjs/preset-sheets-conditional-formatting/lib/index.css";

import { useLang } from "../i18n/useLang";

// Each preset ships its own locale pack (UI strings for its own menus/panels) — unlike
// Fortune-sheet, specifying `locale: LocaleType.FR_FR` alone isn't enough; Univer throws
// "[LocaleService]: Locale not initialized" without the actual translation data too. These are
// plain objects, so a shallow merge (not a special helper) is enough to combine them.
const LOCALE_FR_FR = {
  ...sheetsCoreFrFR,
  ...sheetsFilterFrFR,
  ...sheetsSortFrFR,
  ...sheetsFindReplaceFrFR,
  ...sheetsDataValidationFrFR,
  ...sheetsConditionalFormattingFrFR,
};

const LOCALE_EN_US = {
  ...sheetsCoreEnUS,
  ...sheetsFilterEnUS,
  ...sheetsSortEnUS,
  ...sheetsFindReplaceEnUS,
  ...sheetsDataValidationEnUS,
  ...sheetsConditionalFormattingEnUS,
};

interface UniverSheetGridProps {
  // Read once, on mount, same as Fortune-sheet's `data` prop was — Univer has no official React
  // wrapper (confirmed: imperative DI-container architecture, mounted into a plain DOM node),
  // so this component owns the whole lifecycle itself rather than being a thin prop-driven view.
  workbookData: IWorkbookData;
  onChange?: (data: IWorkbookData) => void;
  onActiveSheetChange?: (sheetId: string) => void;
}

// No forwardRef/imperative API exposed (unlike the old FortuneSheetGrid) — nothing in this
// migration's scope needs one. Univer's formula engine computes on load by itself (confirmed:
// the headless spike needed no explicit trigger), so there's no Fortune-sheet-style
// calculateFormula() call to wire up, and the manual Save button only needs whatever's already
// queued by onChange, not a fresh imperative pull.
export function UniverSheetGrid({ workbookData, onChange, onActiveSheetChange }: UniverSheetGridProps) {
  const { lang } = useLang();
  // A stable *outer* wrapper owned by React — never touched by Univer directly. Each mount of
  // the effect below creates its own plain `container` div and appends it here, rather than
  // handing Univer this ref's own node straight, so that a lang-triggered recreate can swap in
  // a brand-new container and synchronously detach the old one before the next instance's first
  // paint (no visible double-render), while the *old* instance's internal cleanup — which is
  // what's unsafe to run synchronously inside a React commit, see the effect's cleanup below —
  // can be deferred without that deferral leaving stale DOM on screen in the meantime.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Refs for the callbacks so the mount effect (intentionally empty deps — this should mount
  // exactly once) always calls whatever the latest render's callback is, without re-mounting
  // the whole Univer instance every time a parent re-renders with new function identities.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onActiveSheetChangeRef = useRef(onActiveSheetChange);
  onActiveSheetChangeRef.current = onActiveSheetChange;

  // Toggling the app's language mid-session tears down and recreates the whole Univer instance
  // (it has no runtime "switch locale" API — the locale is fixed at createUniver() time), which
  // would otherwise revert the grid to whatever `workbookData` was at the *initial* page load:
  // that prop is deliberately read once and never updated afterward (Univer owns live edits
  // internally past mount — see the prop's own comment below), so re-reading it on a lang change
  // would silently discard any in-session edits even though they're already safely autosaved.
  // Seeding from this ref instead of the prop keeps a lang-triggered recreate visually seamless:
  // the cleanup below captures the live snapshot right before disposing, so the next mount picks
  // up exactly where the old instance left off.
  const currentSnapshotRef = useRef<IWorkbookData>(workbookData);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Styled to match exactly what the single container div used to be (flex item in a column
    // flex context, nothing more) — NOT `display: flex` and NOT `height: 100%`, both tried
    // initially and both wrong: Univer manages its own internal layout (toolbar + canvas
    // stacking) inside whatever node it's given, and imposing an outer flex/height context
    // directly on that node fights with Univer's own sizing, producing a real, continuous
    // ResizeObserver feedback loop — confirmed live: a toolbar dropdown's measured x position
    // oscillating between two values roughly every 150ms, visibly "shaking" on screen. The outer
    // `wrapperRef` below is what now supplies the column-flex context this container needs to
    // grow into — see its own comment.
    const container = document.createElement("div");
    container.style.flex = "1";
    container.style.minHeight = "0";
    container.style.width = "100%";
    wrapperRef.current.appendChild(container);

    const locale = lang === "fr" ? LocaleType.FR_FR : LocaleType.EN_US;
    const localeData = lang === "fr" ? LOCALE_FR_FR : LOCALE_EN_US;

    const { univer, univerAPI } = createUniver({
      locale,
      locales: { [locale]: localeData },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({ container }),
        UniverSheetsFilterPreset(),
        UniverSheetsSortPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsDataValidationPreset(),
        UniverSheetsConditionalFormattingPreset(),
      ],
    });

    univerAPI.createUniverSheet(currentSnapshotRef.current);

    // SheetValueChanged fires per edit action (typing, paste, fill, sort, ...) — rather than try
    // to interpret `effectedRanges` ourselves, just pull the whole current workbook snapshot via
    // save() each time (FWorkbook's own getSnapshot() is deprecated in favor of this — same
    // return shape, just the current name), same shape our own diffing (extractCellValues/
    // diffCellValues in univer/adapter.ts) already expects, matching the pattern the old
    // Fortune-sheet onChange prop used (a full-sheet snapshot per change), just event-driven
    // instead of prop-driven.
    const valueChangedDisposable = univerAPI.addEvent(univerAPI.Event.SheetValueChanged, () => {
      const workbook = univerAPI.getActiveWorkbook();
      if (workbook && onChangeRef.current) {
        onChangeRef.current(workbook.save());
      }
    });

    const activeSheetDisposable = univerAPI.addEvent(univerAPI.Event.ActiveSheetChanged, (params) => {
      if (onActiveSheetChangeRef.current && params.activeSheet) {
        onActiveSheetChangeRef.current(params.activeSheet.getSheetId());
      }
    });

    return () => {
      const workbook = univerAPI.getActiveWorkbook();
      if (workbook) currentSnapshotRef.current = workbook.save();
      valueChangedDisposable.dispose();
      activeSheetDisposable.dispose();
      // Detach the DOM synchronously — an instant, clean cutover, so a lang-triggered recreate
      // never briefly shows two grids stacked while the old one waits to be torn down.
      container.remove();
      // But defer univer.dispose() itself, which is what's actually unsafe to call synchronously
      // here: Univer mounts its own internal React root into `container` (confirmed — it's a
      // DI-container architecture with its own UI layer, see the component's own top comment),
      // and dispose() unmounts that root. This cleanup function runs synchronously as part of
      // React's own commit, so calling another root's unmount() from inside it is exactly the
      // scenario React warns about ("Attempted to synchronously unmount a root while React was
      // already rendering") — easy to trigger for real once this effect started re-running on a
      // lang change (e.g. toggling FR/EN from Settings while a workbook is open) rather than only
      // on route-away unmount. A zero-delay setTimeout pushes just the teardown to its own task,
      // after our own root has fully finished committing; the container is already detached by
      // then, so there's nothing left for it to visually disturb.
      setTimeout(() => univer.dispose(), 0);
    };
    // workbookData is deliberately excluded — see currentSnapshotRef's comment above; only a
    // lang change should ever re-run this effect after the initial mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // flexDirection: column so the appended container's own `flex: 1` (set in the effect above)
  // grows it to fill the available height, the same role `.editor-grid-card` (this component's
  // real parent, in EditorPage.css) already plays one level up — matches what the single
  // container div effectively had for free before this wrapper existed.
  return (
    <div ref={wrapperRef} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%" }} />
  );
}
