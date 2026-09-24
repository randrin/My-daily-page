import { describe, expect, it } from "vitest";
import { sortBy, toggleSort } from "@/lib/table-sort";

describe("toggleSort", () => {
  it("démarre en ascendant puis inverse", () => {
    const first = toggleSort(null, "title");
    expect(first).toEqual({ key: "title", direction: "asc" });
    expect(toggleSort(first, "title")).toEqual({
      key: "title",
      direction: "desc",
    });
  });

  it("change de colonne en ascendant", () => {
    expect(toggleSort({ key: "title", direction: "desc" }, "status")).toEqual({
      key: "status",
      direction: "asc",
    });
  });
});

describe("sortBy", () => {
  const rows = [
    { name: "Charlie", rank: 2 },
    { name: "alice", rank: 3 },
    { name: "Bob", rank: 1 },
  ];

  it("trie le texte sans tenir compte de la casse", () => {
    expect(
      sortBy(rows, { key: "name", direction: "asc" }, (row, key) =>
        key === "name" ? row.name : row.rank,
      ).map((row) => row.name),
    ).toEqual(["alice", "Bob", "Charlie"]);
  });

  it("place les valeurs vides à la fin", () => {
    const withEmpty = [...rows, { name: "", rank: null as unknown as number }];
    expect(
      sortBy(withEmpty, { key: "rank", direction: "desc" }, (row) => row.rank)
        .map((row) => row.name),
    ).toEqual(["alice", "Charlie", "Bob", ""]);
  });
});
