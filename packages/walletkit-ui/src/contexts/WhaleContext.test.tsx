/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import React from "react";

import * as NetworkContext from "./NetworkContext";
import { useWhaleApiClient, WhaleProvider } from "./WhaleContext";

const networkContext = jest.spyOn(NetworkContext, "useNetworkContext");

describe("Whale Context test", () => {
  const networkDetails = [
    {
      url: "https://ocean.defichain.com",
      network: "mainnet",
      name: EnvironmentNetwork.MainNet,
    },
    {
      url: "https://testnet.ocean.jellyfishsdk.com",
      network: "testnet",
      name: EnvironmentNetwork.TestNet,
    },
    {
      url: "https://playground.jellyfishsdk.com",
      network: "regtest",
      name: EnvironmentNetwork.RemotePlayground,
    },
    {
      url: "http://localhost:19553",
      network: "regtest",
      name: EnvironmentNetwork.LocalPlayground,
    },
    {
      url: "http://devnet.ocean.jellyfishsdk.com:3000",
      network: "devnet",
      name: EnvironmentNetwork.DevNet,
    },
  ];

  networkDetails.forEach((networkDetail) => {
    describe(`Whale Context test for ${networkDetail.name}`, () => {
      it("should match snapshot", () => {
        networkContext.mockImplementation(
          () =>
            ({
              network: networkDetail.name,
            } as any)
        );
        function WhaleProviderComponent(): JSX.Element {
          const client = useWhaleApiClient() as any;
          expect(Object.keys(client)).toEqual(
            expect.arrayContaining([
              "options",
              "rpc",
              "address",
              "poolpairs",
              "transactions",
              "tokens",
              "masternodes",
              "blocks",
              "oracles",
              "prices",
              "stats",
              "rawtx",
              "fee",
              "loan",
            ])
          );
          const options = {
            version: "v0",
            timeout: 60000,
            url: networkDetail.url,
            network: networkDetail.network,
          };
          expect(client.options).toMatchObject(options);
          return (
            <div>
              <span>{JSON.stringify(client.options)}</span>
            </div>
          );
        }

        const rendered = render(
          <WhaleProvider>
            <WhaleProviderComponent />
          </WhaleProvider>
        );
        expect(rendered).toMatchSnapshot();
      });
    });
  });
});
