import type { Plugin } from "prettier";

type Parser = { parser: string; plugins: Plugin[] };

const prettyLanguages = new Set([
  "typescript",
  "javascript",
  "json",
  "css",
  "scss",
  "less",
  "html",
  "md",
  "mdx",
]);

export const getLanguageParser = async (
  language: string
): Promise<Parser | undefined> => {
  if (language === "javascript" || language === "typescript") {
    return {
      parser: "babel",
      plugins: [await import("prettier/parser-babel")],
    };
  }
  if (language === "css" || language === "scss" || language === "less") {
    return {
      parser: "postcss",
      plugins: [await import("prettier/parser-postcss")],
    };
  }
  if (language === "html") {
    return {
      parser: "html",
      plugins: [await import("prettier/parser-html")],
    };
  }
  if (language === "md" || language === "mdx") {
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
    return JSON.stringify(JSON.parse(code), undefined, 2);
  }

  const prettier = await import("prettier/standalone");

  return prettier.format(code, await getLanguageParser(lcLanguage));
};
