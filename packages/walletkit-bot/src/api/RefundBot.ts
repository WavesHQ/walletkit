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

interface RequiredPropsFromDB {
  index: number; // wallet address' index from the DB
  refundAddress: string;
  claimAmount: string; // the amount that the user wants to be refunded
  tokenSymbol: string; // index of token is dependent on the network
  urlNetwork: string;
  envNetwork: EnvironmentNetwork;
  privateKey: string;
}

export async function handler(props: RequiredPropsFromDB): Promise<void> {
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

  // checks for invalid arguments from the database
  if (Number(index) < 0) {
    throw new Error("not a valid index");
  }

  if (new BigNumber(claimAmount).isLessThanOrEqualTo(0)) {
    throw new Error("invalid claim amount");
  }

  if (tokenSymbol === undefined) {
    throw new Error("token symbol undefined");
  }

  // gives back the id of the sent token symbol
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

  const txn: TransactionSegWit = await builder.account.accountToAccount(
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

  // eslint-disable-next-line @typescript-eslint/no-shadow
  async function broadcast(txn: TransactionSegWit): Promise<void> {
    const hex: string = new CTransactionSegWit(txn).toHex();
    const txId: string = await client.rawtx.send({ hex });

    console.log(`Send TxId: ${txId}`);
  }
  await broadcast(txn);
}