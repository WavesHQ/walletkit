import { fromAddress } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import { ethers } from "ethers";

export const validateAddress = (
  address: string,
  network: NetworkName
): boolean => {
  const decodedAddress = fromAddress(address, network);
  const isValid = decodedAddress !== undefined;
  return isValid;
};

export const validateEthAddress = (address: string): boolean =>
  ethers.utils.isAddress(address);
