import { EnvironmentNetwork } from "@waveshq/walletkit-core/src";

import { handler, HandlerProps } from "./RefundBot";

const DFC_PLAYGROUND_PRIVATEKEY =
  "decorate unable decide notice wear unusual detail frost tissue debate opera luggage change chest broom attract divert fine quantum citizen veteran carbon draft matter";

const DFC_INVALID_PLAYGROUND_PRIVATEKEY =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

const REFUND_PLAYGROUND_ADDRESS =
  "bcrt1qlmvmz3wvfm945txx3hsyresqep4ywylpwvqa0w";

const INVALID_REFUND_PLAYGROUND_ADDRESS = "invalidaddress";

const mockedRefundDFIObject = {
  index: 0,
  refundAddress: REFUND_PLAYGROUND_ADDRESS,
  claimAmount: "0.5",
  tokenSymbol: "DFI",
  urlNetwork: "https://playground.jellyfishsdk.com",
  envNetwork: EnvironmentNetwork.RemotePlayground,
  privateKey: DFC_PLAYGROUND_PRIVATEKEY,
};

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
  refundAddress: REFUND_PLAYGROUND_ADDRESS,
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

test("should return transaction id when succesfully refunded ETH tokens (with manual topup of UTXO)", async () => {
  await spiedConsoleWithReturnResponse(
    objectFromDatabase,
    expect.stringMatching(/Send TxId:/)
  );
});

// Received: [Error: 400 - BadRequest (/v0/regtest/rawtx/send): txn-mempool-conflict (code 18)]
test("should return transaction id when succesfully refunded DFI UTXO (with manual topup of UTXO)", async () => {
  await spiedConsoleWithReturnResponse(
    mockedRefundDFIObject,
    expect.stringMatching(/Send TxId:/)
  );
});

test("should return invalid DeFiChain private keys", async () => {
  await spiedConsoleWithReturnErrorResponse(
    invalidMnemonickKeysObjectFromDatabase,
    "Invalid DeFiChain private keys!"
  );
});

test("should return unable to decode address given the wrong refund address", async () => {
  await spiedConsoleWithReturnErrorResponse(
    invalidUrlNetworkObjectFromDatabase,
    `Unable to decode Address - ${INVALID_REFUND_PLAYGROUND_ADDRESS}`
  );
});

async function spiedConsoleWithReturnResponse(
  mockedObject: HandlerProps,
  errorMessage: string
): Promise<void> {
  const consoleSpy = jest.spyOn(console, "log");
  try {
    await handler(mockedObject);
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage);
  } finally {
    consoleSpy.mockRestore();
  }
}
async function spiedConsoleWithReturnErrorResponse(
  mockedObject: HandlerProps,
  errorMessage: string
): Promise<void> {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation();

  try {
    await handler(mockedObject);
  } catch (err) {
    expect(err).toBeDefined();
    expect(consoleSpy).toHaveBeenCalledWith(errorMessage);
  }
  consoleSpy.mockRestore();
}
