import {
  WhaleApiClient,
  WhaleApiClientOptions,
  WhaleRpcClient,
} from "@defichain/whale-api-client";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import React, { createContext, useContext, useMemo } from "react";

import { useNetworkContext } from "./NetworkContext";

const WhaleApiClientContext = createContext<{
  whaleAPI: WhaleApiClient;
  whaleRPC: WhaleRpcClient;
}>(undefined as any);

function newOceanOptions(network: EnvironmentNetwork): WhaleApiClientOptions {
  switch (network) {
    case EnvironmentNetwork.LocalPlayground:
      return {
        url: "http://localhost:19553",
        network: "regtest",
        version: "v0",
      };
    case EnvironmentNetwork.RemotePlayground:
      return {
        url: "https://playground.jellyfishsdk.com",
        network: "regtest",
        version: "v0",
      };
    case EnvironmentNetwork.TestNet:
      return {
        url: "https://testnet.ocean.jellyfishsdk.com",
        network: "testnet",
        version: "v0",
      };
    case EnvironmentNetwork.MainNet:
    default:
      return {
        url: "https://ocean.defichain.com",
        network: "mainnet",
        version: "v0",
      };
  }
}

function newWhaleAPIClient(options: WhaleApiClientOptions): WhaleApiClient {
  return new WhaleApiClient(options);
}

function newWhaleRpcClient(options: WhaleApiClientOptions): WhaleRpcClient {
  return new WhaleRpcClient(
    `${options.url}/${options.version}/${options.network}/rpc`
  );
}

export function useWhaleApiClient(): WhaleApiClient {
  return useContext(WhaleApiClientContext).whaleAPI;
}

export function useWhaleRpcClient(): WhaleRpcClient {
  return useContext(WhaleApiClientContext).whaleRPC;
}

export function WhaleProvider({
  children,
}: React.PropsWithChildren<any>): JSX.Element | null {
  const { network } = useNetworkContext();
  const client = useMemo(
    () => ({
      whaleAPI: newWhaleAPIClient(newOceanOptions(network)),
      whaleRPC: newWhaleRpcClient(newOceanOptions(network)),
    }),
    [network]
  );

  return (
    <WhaleApiClientContext.Provider value={client}>
      {children}
    </WhaleApiClientContext.Provider>
  );
}
