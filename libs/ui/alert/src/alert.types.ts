export type UiAlertAppearance = 'soft' | 'outline' | 'dash' | 'solid';

/** `none` renders no role (a static note); omitted (`null`) picks `alert` for error/warning, else `status`. */
export type UiAlertRole = 'alert' | 'status' | 'none';
