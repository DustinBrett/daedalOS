import type { Plugin } from "prettier";

type Parser = { parser: string; plugins: Plugin[] };

const prettyLanguages = new Set([
  "json",
  "javascript",
  "typescript",
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
  if (language === "javascript" || language === "typescript") {
    return {
      parser: "babel",
      plugins: [await import("prettier/parser-babel")],
    };
  }
  if (["css", "sass", "less"].includes(language)) {
    return {
      parser: language,
      plugins: [await import("prettier/parser-postcss")],
    };
  }
  if (language === "html") {
    return {
      parser: "html",
      plugins: [await import("prettier/parser-html")],
    };
  }
  if (language === "xml") {
    return {
      parser: "xml",
      plugins: [(await import("@prettier/plugin-xml")) as Plugin],
    };
  }
  if (language === "markdown") {
    return {
      parser: "markdown",
      plugins: [await import("prettier/parser-markdown")],
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
