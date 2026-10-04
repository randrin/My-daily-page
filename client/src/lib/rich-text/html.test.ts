import { describe, expect, it } from "vitest";
import {
  isEmptyRichText,
  normalizeRichText,
  stripRichText,
  toRichHtml,
} from "@/lib/rich-text/html";

describe("rich text html", () => {
  it("traite un éditeur vide comme vide", () => {
    expect(isEmptyRichText("<p></p>")).toBe(true);
    expect(isEmptyRichText("<p><br></p>")).toBe(true);
    expect(isEmptyRichText("   ")).toBe(true);
  });

  it("conserve le texte formaté", () => {
    expect(isEmptyRichText("<p><strong>Lead</strong></p>")).toBe(false);
    expect(stripRichText("<p><em>Hello</em> world</p>")).toBe("Hello world");
  });

  it("supprime un script collé", () => {
    expect(toRichHtml('<p>ok<script>alert(1)</script></p>')).not.toContain(
      "<script>",
    );
  });

  it("convertit le texte brut existant en HTML", () => {
    expect(toRichHtml("Bonjour\n\nMonde")).toBe("<p>Bonjour</p><p>Monde</p>");
  });

  it("normalise un champ vide en chaîne vide", () => {
    expect(normalizeRichText("<p><br /></p>")).toBe("");
  });
});
