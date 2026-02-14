jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { getCurrentUser } from "@/lib/api/users";
import { apiClient } from "@/lib/api/client";

describe("api/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCurrentUser", () => {
    it("calls apiClient.get with /users/me and returns response.data", async () => {
      const userData = {
        id: "1",
        email: "user@example.com",
        username: "testuser",
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: userData });

      const result = await getCurrentUser();

      expect(apiClient.get).toHaveBeenCalledWith("/users/me");
      expect(result).toEqual(userData);
    });
  });
});
