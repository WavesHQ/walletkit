/* eslint-disable no-console */
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
import {
  EnvironmentNetwork,
  getJellyfishNetwork,
} from "@waveshq/walletkit-core/src";
import { BigNumber } from "bignumber.js";

import {
  createWallet,
  getAddressScript,
  getWhaleClient,
} from "./DeFiChainCore";

export interface HandlerProps {
  index: number; // index of wallet's derived from parent private keys
  refundAddress: string;
  claimAmount: string; // the amount that the user wants to be refunded
  tokenSymbol: string;
  urlNetwork: string;
  envNetwork: EnvironmentNetwork;
  privateKey: string;
}

export async function handler(props: HandlerProps): Promise<void> {
  try {
    const {
      index,
      refundAddress,
      claimAmount,
      tokenSymbol,
      urlNetwork,
      privateKey,
      envNetwork,
    } = props;

    const client = getWhaleClient(urlNetwork, envNetwork);
    const network = getJellyfishNetwork(envNetwork);
    const account = new WhaleWalletAccount(
      client,
      createWallet(urlNetwork, envNetwork, privateKey, index),
      network
    );

    // Not needed as long as index does not match the refund address,
    // Checks for invalid arguments from the database
    if (Number(index) < 0) {
      throw new Error("not a valid index");
    }

    if (
      new BigNumber(claimAmount).isLessThanOrEqualTo(0) ||
      new BigNumber(claimAmount).isNaN()
    ) {
      throw new Error("invalid claim amount");
    }

    if (tokenSymbol === undefined) {
      throw new Error("token symbol undefined");
    }

    // Gives back the id of the tokenSymbol
    const tokenId = (await account.client.tokens.list()).find(
      (token) => token.symbol === tokenSymbol
    )?.id;

    if (tokenId === undefined) {
      throw new Error("token ID is undefined");
    }

    const from = await account.getScript();
    const to = getAddressScript(refundAddress, envNetwork);
    // Allows support for UTXO transactions
    const builder = await account.withTransactionBuilder();

    const isDFI = tokenSymbol === "DFI"; // Assumed DFI UTXO

    let txn: TransactionSegWit;
    if (isDFI) {
      // Sends DFI UTXO, not Tokens back to refundAddress
      txn = await builder.utxo.send(new BigNumber(claimAmount), to, from);
    } else {
      // Only sends Tokens
      txn = await builder.account.accountToAccount(
        {
          from,
          to: [
            {
              script: to,
              balances: [
                {
                  token: Number(tokenId),
                  amount: new BigNumber(claimAmount),
                },
              ],
            },
          ],
        },
        from
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow, no-inner-declarations
    async function broadcast(txn: TransactionSegWit): Promise<void> {
      const hex: string = new CTransactionSegWit(txn).toHex();
      const txId: string = await client.rawtx.send({ hex });

      return console.log(`Send TxId: ${txId}`); // added return for unit testing
    }
    await broadcast(txn);
  } catch (error) {
    console.log((error as Error).message);
  }
}
