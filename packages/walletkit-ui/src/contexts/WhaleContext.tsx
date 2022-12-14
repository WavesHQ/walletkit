import { useServiceProviderContext } from "@contexts/StoreServiceProvider";
import {
  WhaleApiClient,
  WhaleApiClientOptions,
  WhaleRpcClient,
} from "@defichain/whale-api-client";
import { EnvironmentNetwork } from "@waveshq/wallet-core";
import React, { createContext, useContext, useMemo } from "react";

import { useNetworkContext } from "./NetworkContext";

const WhaleApiClientContext = createContext<{
  whaleAPI: WhaleApiClient;
  whaleRPC: WhaleRpcClient;
}>(undefined as any);

function newOceanOptions({
  url,
  network,
}: {
  network: EnvironmentNetwork;
  url: string;
}): WhaleApiClientOptions {
  switch (network) {
    case EnvironmentNetwork.MainNet:
      return { url, network: "mainnet", version: "v0" };
    case EnvironmentNetwork.TestNet:
      return { url, network: "testnet", version: "v0" };
    case EnvironmentNetwork.RemotePlayground:
      return { url, network: "regtest", version: "v0" };
    case EnvironmentNetwork.LocalPlayground:
    default:
      return { url, network: "regtest", version: "v0" };
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
  const { url } = useServiceProviderContext();
  const client = useMemo(
    () => ({
      whaleAPI: newWhaleAPIClient(newOceanOptions({ network, url })),
      whaleRPC: newWhaleRpcClient(newOceanOptions({ network, url })),
    }),
    [network, url]
  );

  return (
    <WhaleApiClientContext.Provider value={client}>
      {children}
    </WhaleApiClientContext.Provider>
  );
}
