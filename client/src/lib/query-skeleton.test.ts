import { describe, expect, it } from "vitest";
import { showQuerySkeleton } from "@/lib/query-skeleton";

describe("showQuerySkeleton", () => {
  it("affiche le skeleton au premier chargement", () => {
    expect(
      showQuerySkeleton({ isPending: true, isFetching: true, data: undefined }),
    ).toBe(true);
  });

  it("garde le skeleton si une nouvelle query n’a pas encore de data", () => {
    expect(
      showQuerySkeleton({ isPending: false, isFetching: true, data: undefined }),
    ).toBe(true);
  });

  it("ne clignote pas quand les données existent déjà", () => {
    expect(
      showQuerySkeleton({
        isPending: false,
        isFetching: true,
        data: { items: [] },
      }),
    ).toBe(false);
  });
});
