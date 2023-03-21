import { EnvironmentNetwork } from "@waveshq/walletkit-core";

import { handler } from "./RefundBot";

const DFC_PLAYGROUND_PRIVATEKEY =
  "decorate unable decide notice wear unusual detail frost tissue debate opera luggage change chest broom attract divert fine quantum citizen veteran carbon draft matter";

const DFC_INVALID_PLAYGROUND_PRIVATEKEY =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

const REFUND_PLAYGROUND_ADDRESS =
  "bcrt1qlmvmz3wvfm945txx3hsyresqep4ywylpwvqa0w";

const INVALID_REFUND_PLAYGROUND_ADDRESS = "invalidaddress";

const objectFromDatabase = {
  index: 0,
  refundAddress: REFUND_PLAYGROUND_ADDRESS,
  claimAmount: "0.1994",
  tokenSymbol: "ETH",
  urlNetwork: "https://playground.jellyfishsdk.com",
  envNetwork: EnvironmentNetwork.RemotePlayground,
  privateKey: DFC_PLAYGROUND_PRIVATEKEY,
};

const invalidMnemonickKeysObjectFromDatabase = {
  index: 0,
  refundAddress: DFC_PLAYGROUND_PRIVATEKEY,
  claimAmount: "0.1994",
  tokenSymbol: "ETH",
  urlNetwork: "https://playground.jellyfishsdk.com",
  envNetwork: EnvironmentNetwork.RemotePlayground,
  privateKey: DFC_INVALID_PLAYGROUND_PRIVATEKEY,
};

const invalidUrlNetworkObjectFromDatabase = {
  index: 0,
  refundAddress: INVALID_REFUND_PLAYGROUND_ADDRESS,
  claimAmount: "0.1994",
  tokenSymbol: "ETH",
  urlNetwork: "https://playground.jellyfishsdk.com",
  envNetwork: EnvironmentNetwork.RemotePlayground,
  privateKey: DFC_PLAYGROUND_PRIVATEKEY,
};

test("should return transaction id", async () => {
  const consoleSpy = jest.spyOn(console, "log");
  // need to manually top up the "hot wallet" address with DFI and the exact amount of ETH as declared in the object above

  try {
    await handler(objectFromDatabase);

    expect(consoleSpy).toHaveBeenCalledTimes(2); // this is being called twice as console.log is called in the broadcast fn and in jest
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/Send TxId:/)
    );
  } finally {
    consoleSpy.mockRestore();
  }
});

test("should return invalid DeFiChain private keys", async () => {
  expect(async () =>
    handler(invalidMnemonickKeysObjectFromDatabase)
  ).rejects.toThrowError("Invalid DeFiChain private keys!");
});

test("should return unable to decode address given the wrong refund address", () => {
  expect(async () =>
    handler(invalidUrlNetworkObjectFromDatabase)
  ).rejects.toThrowError(
    `Unable to decode Address - ${INVALID_REFUND_PLAYGROUND_ADDRESS}`
  );
});
