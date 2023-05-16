import { AddressType, fromScript } from "@defichain/jellyfish-address";
import { NetworkName } from "@defichain/jellyfish-network";
import { OP_PUSHDATA, Script } from "@defichain/jellyfish-transaction";
import { ethers } from "ethers";

export interface EthDecodedAddress {
  type: AddressType | "ETH";
  address: string;
  script: Script;
  network: NetworkName;
}

export function getDecodedAddress(
  script: Script,
  network: NetworkName
): EthDecodedAddress | undefined {
  // check if is dfc address first
  const decodedAddress = fromScript(script, network);
  if (decodedAddress !== undefined) {
    return decodedAddress;
  }

  // check if eth address
  try {
    /* SAMPLE of script object
    "script": {
      "stack": [
        {
          "type": "OP_0",
          "code": 0
        },
        {
          "type": "OP_PUSHDATA",
          "hex": "f23d101c17445dba29b99f5c82186990b2b2c6bf"
        }
      ]
    },
    */

    // extract script OPCodes and Hex
    const hash = script.stack[1] as OP_PUSHDATA;
    const address = ethers.utils.getAddress(hash.hex);

    return {
      type: "ETH",
      address,
      script,
      network,
    };
  } catch (e) {
    return undefined;
  }
}
