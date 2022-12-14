import { EnvironmentNetwork } from "./environment";
import { newOceanOptions, newWhaleAPIClient, newWhaleRpcClient } from "./whale";

describe("whale", () => {
  it("should match ocean options for local playground", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.LocalPlayground);
    expect(oceanOptions).toMatchObject({
      url: "http://localhost:19553",
      network: "regtest",
      version: "v0",
    });
  });

  it("should match ocean options for remote playground", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.RemotePlayground);
    expect(oceanOptions).toMatchObject({
      url: "https://playground.jellyfishsdk.com",
      network: "regtest",
      version: "v0",
    });
  });

  it("should match ocean options for testnet", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    expect(oceanOptions).toMatchObject({
      url: "https://testnet.ocean.jellyfishsdk.com",
      network: "testnet",
      version: "v0",
    });
  });

  it("should match ocean options for mainnet", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.MainNet);
    expect(oceanOptions).toMatchObject({
      url: "https://ocean.defichain.com",
      network: "mainnet",
      version: "v0",
    });
  });

  it("should create new instance of whale api client", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    const whaleApiClient = newWhaleAPIClient(oceanOptions);
    expect(whaleApiClient).toBeDefined();
  });

  it("should create new instance of whale rpc client", () => {
    const oceanOptions = newOceanOptions(EnvironmentNetwork.TestNet);
    const whaleApiClient = newWhaleRpcClient(oceanOptions);
    expect(whaleApiClient).toBeDefined();
  });
});
