import { render, screen } from "@testing-library/react";
import LoginLayout, { metadata as loginMetadata } from "@/app/login/layout";
import RegisterLayout, {
  metadata as registerMetadata,
} from "@/app/register/layout";
import MapLayout, { metadata as mapMetadata } from "@/app/map/layout";
import ProfileLayout, {
  metadata as profileMetadata,
} from "@/app/profile/layout";
import SubmitVideoLayout, {
  metadata as submitMetadata,
} from "@/app/videos/new/layout";

describe("Route layouts", () => {
  describe("metadata exports", () => {
    it("login layout exports correct title", () => {
      expect(loginMetadata).toEqual({ title: "Sign In" });
    });

    it("register layout exports correct title", () => {
      expect(registerMetadata).toEqual({ title: "Register" });
    });

    it("map layout exports correct title", () => {
      expect(mapMetadata).toEqual({ title: "Map" });
    });

    it("profile layout exports correct title", () => {
      expect(profileMetadata).toEqual({ title: "My Profile" });
    });

    it("submit video layout exports correct title", () => {
      expect(submitMetadata).toEqual({ title: "Submit Video" });
    });
  });

  describe("layout rendering", () => {
    it("login layout renders children", () => {
      render(
        <LoginLayout>
          <span>child</span>
        </LoginLayout>
      );
      expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("register layout renders children", () => {
      render(
        <RegisterLayout>
          <span>child</span>
        </RegisterLayout>
      );
      expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("map layout renders children", () => {
      render(
        <MapLayout>
          <span>child</span>
        </MapLayout>
      );
      expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("profile layout renders children", () => {
      render(
        <ProfileLayout>
          <span>child</span>
        </ProfileLayout>
      );
      expect(screen.getByText("child")).toBeInTheDocument();
    });

    it("submit video layout renders children", () => {
      render(
        <SubmitVideoLayout>
          <span>child</span>
        </SubmitVideoLayout>
      );
      expect(screen.getByText("child")).toBeInTheDocument();
    });
  });
});
