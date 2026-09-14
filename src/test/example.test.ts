import { describe, it, expect, vi, beforeEach } from "vitest";
import { productApi } from "@/services/productApi";

describe("productApi.getAllCategories", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch categories from the API endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ["Doce", "Bombom", "Chocolate"],
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await productApi.getAllCategories();

    expect(fetchMock).toHaveBeenCalledWith("https://localhost:44309/api/Category");
    expect(result).toEqual(["Doce", "Bombom", "Chocolate"]);
  });
});
