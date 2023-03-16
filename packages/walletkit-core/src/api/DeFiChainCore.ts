import { fromAddress } from "@defichain/jellyfish-address";
import { Script } from "@defichain/jellyfish-transaction";
import {
  JellyfishWallet,
  WalletHdNode,
  WalletHdNodeProvider,
} from "@defichain/jellyfish-wallet";
import {
  MnemonicHdNodeProvider,
  MnemonicProviderData,
  validateMnemonicSentence,
} from "@defichain/jellyfish-wallet-mnemonic";
import { WhaleApiClient } from "@defichain/whale-api-client";
import {
  WhaleWalletAccount,
  WhaleWalletAccountProvider,
} from "@defichain/whale-api-wallet";
import { BigNumber } from "bignumber.js";

import {
  EnvironmentNetwork,
  getBip32Option,
  getJellyfishNetwork,
} from "../index";

enum WalletType {
  MNEMONIC_UNPROTECTED = "MNEMONIC_UNPROTECTED",
  MNEMONIC_ENCRYPTED = "MNEMONIC_ENCRYPTED",
}

interface WalletPersistenceDataI<T> {
  type: WalletType;
  /* To migrate between app version upgrade */
  version: "v1";
  /* Raw Data encoded in WalletType specified format */
  raw: T;
}

export function toData(
  mnemonic: string[]
): WalletPersistenceDataI<MnemonicProviderData> {
  const options = getBip32Option(EnvironmentNetwork.TestNet);
  const data = MnemonicHdNodeProvider.wordsToData(mnemonic, options);

  return {
    version: "v1",
    type: WalletType.MNEMONIC_UNPROTECTED,
    raw: data,
  };
}

export function initProvider(
  data: WalletPersistenceDataI<MnemonicProviderData>
  // urlNetwork: string
): MnemonicHdNodeProvider {
  if (data.type !== WalletType.MNEMONIC_UNPROTECTED || data.version !== "v1") {
    throw new Error("Unexpected WalletPersistenceDataI");
  }

  const options = getBip32Option(EnvironmentNetwork.TestNet);
  return MnemonicHdNodeProvider.fromData(data.raw, options);
}

export function initJellyfishWallet<HdNode extends WalletHdNode>(
  provider: WalletHdNodeProvider<HdNode>,
  urlNetwork: string
): JellyfishWallet<WhaleWalletAccount, HdNode> {
  const client = getWhaleClient(urlNetwork);
  const accountProvider = new WhaleWalletAccountProvider(
    client,
    getJellyfishNetwork(EnvironmentNetwork.TestNet)
  );
  return new JellyfishWallet(provider, accountProvider);
}

// 0 = hot wallet
export function createWallet(
  urlNetwork: string,
  privateKey: string,
  index: number = 0
): WhaleWalletAccount {
  const mnemonic = privateKey as string;

  if (!validateMnemonicSentence(mnemonic)) {
    throw new Error("Invalid DeFiChain private keys!");
  }
  const data = toData(mnemonic.split(" "));
  const provider = initProvider(data);
  return initJellyfishWallet(provider, urlNetwork).get(index);
}

export function getWhaleClient(urlNetwork: string): WhaleApiClient {
  return new WhaleApiClient({
    url: urlNetwork,
    version: "v0",
    network: getJellyfishNetwork(EnvironmentNetwork.TestNet).name,
  });
}

export function getAddressScript(address: string): Script {
  console.log("getAddressScript address", address);

  const decodedAddress = fromAddress(
    address,
    getJellyfishNetwork(EnvironmentNetwork.TestNet).name
  );
  console.log("decodedAddress", decodedAddress);
  if (decodedAddress === undefined) {
    throw new Error(`Unable to decode Address - ${address}`);
  }
  return decodedAddress.script;
}

/**
 * Get current wallet UTXO balance (from JJ Whale)
 */
export async function getUTXOBalance(
  address: string,
  client: WhaleApiClient
): Promise<BigNumber> {
  return new BigNumber(await client.address.getBalance(address));
}
