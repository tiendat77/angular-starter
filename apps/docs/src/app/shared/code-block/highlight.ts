import hljs from 'highlight.js/lib/core';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

export type CodeLanguage = 'html' | 'ts' | 'css' | 'scss' | 'json';

hljs.registerLanguage('xml', xml);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('json', json);

const HLJS_LANGUAGE: Record<CodeLanguage, string> = {
  html: 'xml',
  ts: 'typescript',
  css: 'css',
  scss: 'scss',
  json: 'json',
};

/** Returns HTML-escaped markup with `hljs-*` token spans for the given language. */
export function highlightCode(code: string, language: CodeLanguage): string {
  return hljs.highlight(code, { language: HLJS_LANGUAGE[language], ignoreIllegals: true }).value;
}
