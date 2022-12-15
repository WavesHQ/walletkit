import {
  WhaleApiClient,
  WhaleApiClientOptions,
  WhaleRpcClient,
} from "@defichain/whale-api-client";

import { EnvironmentNetwork } from "./environment";

export function newOceanOptions (
  network: EnvironmentNetwork
): WhaleApiClientOptions {
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

export function newWhaleAPIClient (
  options: WhaleApiClientOptions
): WhaleApiClient {
  return new WhaleApiClient(options);
}

export function newWhaleRpcClient (
  options: WhaleApiClientOptions
): WhaleRpcClient {
  return new WhaleRpcClient(
    `${options.url}/${options.version}/${options.network}/rpc`
  );
}
