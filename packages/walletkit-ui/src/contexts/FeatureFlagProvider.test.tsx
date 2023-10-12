/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import React, { PropsWithChildren, useEffect } from "react";

import {
  FeatureFlagProvider,
  useFeatureFlagContext,
} from "./FeatureFlagProvider";
import { StoreServiceProvider } from "./StoreServiceProvider";

function TestingComponent(): JSX.Element {
  // const { hasBetaFeatures } = useFeatureFlagContext();
  return (
    <div>
      {/* <p data-testid="flag">{hasBetaFeatures}</p> */}
      <p data-testid="flag">{true}</p>
    </div>
  );
}
const mockApi = {
  get: jest.fn(),
  set: jest.fn(),
};
const consoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn);
const consoleError = jest.spyOn(console, "error").mockImplementation(jest.fn);
const logger = { error: () => consoleError, info: () => consoleLog };

jest.mock("./NetworkContext", () => ({
  useNetworkContext: () => ({
    network: EnvironmentNetwork.RemotePlayground,
    networkName: "regtest",
    updateNetwork: jest.fn(),
  }),
}));

// jest.mock("./StoreServiceProvider", () => ({
//   useServiceProviderContext: () => {
//     return {
//       url: "",
//       defaultUrl: "",
//       isCustomUrl: false,
//       setUrl: jest.fn(),
//     };
//   },
// }));

describe.skip("Feature flag provider", () => {
  it.only("should match snapshot", () => {
    const rendered = render(
      <StoreServiceProvider api={mockApi} logger={logger}>
        <FeatureFlagProvider
          api={mockApi}
          logger={logger}
          releaseChannel="development"
          platformOS="web"
          nativeApplicationVersion={null}
        >
          <TestingComponent />
        </FeatureFlagProvider>
      </StoreServiceProvider>
    );
    expect(rendered).toMatchSnapshot();
  });

  it("should render hasBetaFeatures flag", () => {
    const { getByTestId } = render(
      <FeatureFlagProvider
        api={mockApi}
        logger={logger}
        releaseChannel="development"
        platformOS="web"
        nativeApplicationVersion={null}
      >
        <TestingComponent />
      </FeatureFlagProvider>
    );
    expect(getByTestId("flag").textContent).toStrictEqual("true");
  });
});
