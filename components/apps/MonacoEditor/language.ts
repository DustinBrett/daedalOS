import { type Plugin } from "prettier";

type Parser = { parser: string; plugins: Plugin[] };
type PrettierPlugin = { default: Plugin };

export type PrettierError = Error &
  Partial<{
    cause: {
      msg: string;
    };
    loc: {
      start: {
        column: number;
        line: number;
      };
    };
  }>;

const prettyLanguages = new Set([
  "json",
  "css",
  "sass",
  "less",
  "html",
  "markdown",
  "xml",
]);

const getLanguageParser = async (
  language: string
): Promise<Parser | undefined> => {
  if (["css", "sass", "less"].includes(language)) {
    return {
      parser: language,
      plugins: [await import("prettier/plugins/postcss")],
    };
  }
  if (language === "html") {
    return {
      parser: "html",
      plugins: [await import("prettier/plugins/html")],
    };
  }
  if (language === "xml") {
    return {
      parser: "xml",
      plugins: [
        ((await import("@prettier/plugin-xml")) as PrettierPlugin).default,
      ],
    };
  }
  if (language === "markdown") {
    return {
      parser: "markdown",
      plugins: [await import("prettier/plugins/markdown")],
    };
  }

  return undefined;
};

export const isPrettyLanguage = (language: string): boolean =>
  prettyLanguages.has(language.toLowerCase());

export const prettyPrint = async (
  language: string,
  code: string
): Promise<string> => {
  const lcLanguage = language.toLowerCase();

  if (lcLanguage === "json") {
    try {
      return JSON.stringify(JSON.parse(code), undefined, 2);
    } catch {
      return code;
    }
  }

  const prettier = await import("prettier/standalone");

  return prettier.format(code, await getLanguageParser(lcLanguage));
};
