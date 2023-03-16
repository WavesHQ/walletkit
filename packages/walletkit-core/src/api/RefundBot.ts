/* eslint-disable no-console */
import {
  CTransactionSegWit,
  TransactionSegWit,
} from "@defichain/jellyfish-transaction";
import { WhaleWalletAccount } from "@defichain/whale-api-wallet";
// import {
//   EnvironmentNetwork,
//   getJellyfishNetwork,
// } from "@waveshq/walletkit-core";
import { BigNumber } from "bignumber.js";

import { EnvironmentNetwork, getJellyfishNetwork } from "../index";
import {
  createWallet,
  getAddressScript,
  getWhaleClient,
} from "./DeFiChainCore";

// create own wallet to test the UTXO topupupuup
// Playground
// const DEFICHAIN_PRIVATE_KEY =
//   "cube term kiwi basic narrow mutual develop shoot theory roast gesture rose nominee seek swear drink source lamp income chef dentist hammer race debate";

// Testnet
const DEFICHAIN_PRIVATE_KEY =
  "witness grief typical dirt sudden impact unknown carpet opera correct there local obvious slow replace outdoor symptom cabin whale material ski stem stem cannon erosion";

// DB args that are required for the user to get their refunds
interface RequiredPropsFromDB {
  index: number;
  refundAddress: string;
  claimAmount: string; // the amount that the user has sent
  tokenSymbol: string; // index of token will be different in different network  // this is returning a string from the DB - must check with JJ
  urlNetwork: string; // network could be on Mainnet, Testnet
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
  } = props;
  const client = getWhaleClient(urlNetwork);
  const network = getJellyfishNetwork(EnvironmentNetwork.TestNet);
  // requires index from DB
  const account = new WhaleWalletAccount(
    client,
    createWallet(urlNetwork, privateKey, index),
    network
  );
  const address = await account.getAddress(); // get dfi address
  console.log(address);

  const tokenId = (await account.client.tokens.list()).map((token) => {
    if (token.symbol === tokenSymbol) {
      return token.id;
    }
    return 0;
  });

  // TO SEND = df1qc6zgqvt400t6n9kcnqg8wnngltw5r29d48vshp - address that the user wants to get refunds to
  const from = await account.getScript();
  const to = getAddressScript(refundAddress);
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
              token: Number(tokenId), // should get the tokenID based on the token symbol - reliant on the network that you're in
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

const arr = {
  id: 322,
  index: 303,
  refundAddress: "tf1qm5hf2lhrsyfzeu0mnnzl3zllznfveua5rprhr4",
  claimAmount: "0.1994",
  tokenSymbol: "ETH",
  urlNetwork: "https://ocean.defichain.com", // testnet
  privateKey: DEFICHAIN_PRIVATE_KEY,
};

handler(arr);
