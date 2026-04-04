import {
  buildAuthSessionState,
  parseAuthSessionState,
  serializeAuthSessionState,
} from "@/lib/auth/session";

describe("auth session state", () => {
  it("builds state from relation role and all_roles", () => {
    const state = buildAuthSessionState({
      id: 17,
      email: "admin@onwynd.com",
      role: { slug: "admin" },
      all_roles: ["admin", "founder"],
    });

    expect(state).toEqual({
      primaryRole: "admin",
      allRoles: ["admin", "founder"],
      userId: 17,
      email: "admin@onwynd.com",
    });
  });

  it("falls back to patient when user roles are missing", () => {
    const state = buildAuthSessionState({
      id: 5,
      email: "member@onwynd.com",
    });

    expect(state.primaryRole).toBe("patient");
    expect(state.allRoles).toEqual(["patient"]);
  });

  it("serializes and parses session state safely", () => {
    const encoded = serializeAuthSessionState({
      primaryRole: "therapist",
      allRoles: ["therapist", "clinical_advisor"],
      userId: 22,
      email: "therapist@onwynd.com",
    });

    expect(parseAuthSessionState(encoded)).toEqual({
      primaryRole: "therapist",
      allRoles: ["therapist", "clinical_advisor"],
      userId: 22,
      email: "therapist@onwynd.com",
    });
  });

  it("returns null for malformed auth state", () => {
    expect(parseAuthSessionState("%%%")).toBeNull();
  });
});
