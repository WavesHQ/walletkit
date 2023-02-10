import { Authentication, authentication } from "./authentication";

describe("authentication reducer", () => {
  let initialState: { authentication?: Authentication<any> };

  beforeEach(() => {
    initialState = {
      authentication: {
        consume: () => new Promise<void>(() => {}),
        onAuthenticated: () => new Promise<void>(() => {}),
        message: "Enter passcode to continue",
        loading: "Verifying access",
      },
    };
  });

  it("should handle initial state", () => {
    expect(authentication.reducer(undefined, { type: "unknown" })).toEqual({});
  });

  it("should handle prompt", () => {
    const payload: Authentication<any> = {
      consume: () => new Promise<void>(() => {}),
      onAuthenticated: () => new Promise(() => {}),
      message: "Enter change passcode to continue",
      loading: "Verifying access",
    };

    const actual = authentication.reducer(
      initialState,
      authentication.actions.prompt(payload)
    );
    expect(actual.authentication).toMatchObject(payload);
  });

  it("should handle dismiss state", () => {
    const actual = authentication.reducer(
      initialState,
      authentication.actions.dismiss()
    );
    expect(actual.authentication).toStrictEqual(undefined);
  });
});
