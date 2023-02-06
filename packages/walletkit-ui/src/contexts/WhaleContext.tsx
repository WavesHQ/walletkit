import { WhaleApiClient, WhaleRpcClient } from "@defichain/whale-api-client";
import {
  newOceanOptions,
  newWhaleAPIClient,
  newWhaleRpcClient,
} from "@waveshq/walletkit-core";
import React, { createContext, useContext, useMemo } from "react";

import { useNetworkContext } from "./NetworkContext";
import { useServiceProviderContext } from "./StoreServiceProvider";

const WhaleApiClientContext = createContext<{
  whaleAPI: WhaleApiClient;
  whaleRPC: WhaleRpcClient;
}>(undefined as any);

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
      whaleAPI: newWhaleAPIClient(newOceanOptions(network, url)),
      whaleRPC: newWhaleRpcClient(newOceanOptions(network, url)),
    }),
    [network, url]
  );

  return (
    <WhaleApiClientContext.Provider value={client}>
      {children}
    </WhaleApiClientContext.Provider>
  );
}
