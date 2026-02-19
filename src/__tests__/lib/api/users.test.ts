jest.mock("@/lib/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import {
  getCurrentUser,
  updateProfile,
  getPublicProfile,
} from "@/lib/api/users";
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

  describe("updateProfile", () => {
    it("calls apiClient.put with /users/me and returns response.data", async () => {
      const updatedUser = { id: "1", displayName: "NewName" };
      (apiClient.put as jest.Mock).mockResolvedValue({ data: updatedUser });

      const result = await updateProfile({ displayName: "NewName" });

      expect(apiClient.put).toHaveBeenCalledWith("/users/me", {
        displayName: "NewName",
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe("getPublicProfile", () => {
    it("calls apiClient.get with /users/:id and returns response.data", async () => {
      const profile = { id: "abc", displayName: "PublicUser" };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: profile });

      const result = await getPublicProfile("abc");

      expect(apiClient.get).toHaveBeenCalledWith("/users/abc");
      expect(result).toEqual(profile);
    });
  });
});
