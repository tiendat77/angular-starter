import { firstValueFrom, isObservable, Observable } from 'rxjs';

/** Schemes a link may use. Everything else with a scheme (`javascript:`, `data:`, ...) is refused. */
const ALLOWED_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);

const SCHEME = /^([a-z][a-z0-9+.-]*):/i;
/** `host:1234`, which looks like a scheme but is a bare address with a port. */
const HOST_WITH_PORT = /^[a-z0-9.-]+:\d+(?:[/?#]|$)/i;
/** `example.com`, `www.example.com/path`, `sub.example.co.uk?q=1` (no spaces, a dot, a 2+ letter ending). */
const BARE_DOMAIN = /^[^\s/?#:]+\.[a-z]{2,}(?::\d+)?(?:[/?#]\S*)?$/i;
const LOCALHOST = /^localhost(?::\d+)?(?:[/?#]\S*)?$/i;

/**
 * Turns what the user typed into a link that is safe to store, or `null` when it is not one.
 *
 * - `http(s)://`, `mailto:`, `tel:`, `/relative` and `#anchor` are kept as they are.
 * - A bare address such as `example.com/path` or `localhost:4200` gets `https://`.
 * - Anything else is refused: other schemes (`javascript:`, `data:`, `file:`), protocol-relative
 *   `//host`, text with spaces.
 */
export function normalizeLinkUrl(input: string): string | null {
  const value = input.trim();
  if (!value || /\s/.test(value)) {
    return null;
  }

  if (value.startsWith('//')) {
    return null;
  }
  if (value.startsWith('/') || value.startsWith('#')) {
    return value;
  }

  const scheme = SCHEME.exec(value);
  if (scheme && !HOST_WITH_PORT.test(value)) {
    if (!ALLOWED_SCHEMES.has(scheme[1].toLowerCase())) {
      return null;
    }
    // `mailto:` / `tel:` need something after the colon; http(s) need a host
    const rest = value.slice(scheme[0].length);
    const isWeb = /^https?$/i.test(scheme[1]);
    return isWeb ? (/^\/\/[^\s/?#]+/.test(rest) ? value : null) : rest ? value : null;
  }

  return BARE_DOMAIN.test(value) || LOCALHOST.test(value) ? `https://${value}` : null;
}

export type UiEditorImageProblem = 'type' | 'size';

/** Checks a picked file before it is uploaded; `null` means it is fine. The type is checked first. */
export function validateImage(
  file: Pick<File, 'type' | 'size'>,
  allowedTypes: readonly string[],
  maxSize: number
): UiEditorImageProblem | null {
  const type = file.type.toLowerCase();
  if (!allowedTypes.some((allowed) => allowed.toLowerCase() === type)) {
    return 'type';
  }
  return file.size > maxSize ? 'size' : null;
}

/**
 * Normalises what an `uploadImage` handler returns (promise or observable) to a promise of the URL.
 *
 * Chains with `.then` instead of `await`: awaiting a zone.js promise natively makes a rejection
 * look unhandled for one tick, which zone reports as an uncaught error.
 */
export function resolveImageUrl(result: Promise<string> | Observable<string>): Promise<string> {
  const pending = isObservable(result) ? firstValueFrom(result) : Promise.resolve(result);
  return pending.then((url) => {
    if (!url) {
      throw new Error('The upload handler returned an empty url.');
    }
    return url;
  });
}
