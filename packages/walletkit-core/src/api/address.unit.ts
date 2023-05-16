import { AddressType, DecodedAddress } from "@defichain/jellyfish-address";
import { OP_CODES, Script } from "@defichain/jellyfish-transaction";

import { EthDecodedAddress, getDecodedAddress } from "./address";

/* detailed `fromScript()` test cases are done in @defichain/jellyfish-address */
describe("Address Decoder", () => {
  it("should be able to decode valid DFC script", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19"
        ),
      ],
    };

    const expected: DecodedAddress = {
      type: AddressType.P2WSH,
      address: "tf1qncd7qa2cafwv3cpw68vqczg3qj904k2f4lard4wrj50rzkwmagvsemeex5",
      script,
      network: "testnet",
    };

    expect(getDecodedAddress(script, "testnet")).toStrictEqual(expected);
  });

  it("should be able to decode valid ETH script", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_16,
        OP_CODES.OP_PUSHDATA_HEX_LE("98bd4c07f8eddf293f81e511921106d0c7f2839d"),
      ],
    };

    const expected: EthDecodedAddress = {
      type: "ETH",
      address: "0x98bd4c07F8eddf293f81E511921106d0C7f2839D",
      script,
      network: "testnet",
    };

    expect(getDecodedAddress(script, "testnet")).toStrictEqual(expected);
  });

  it("should return undefined for invalid DFC script, if [0] != OP_0", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_1,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19"
        ),
      ],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });

  it("should return undefined for ETH script, if [1] != OP_PUSHDATA", () => {
    const script: Script = {
      stack: [OP_CODES.OP_16, OP_CODES.OP_RETURN],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });

  it("should return undefined for invalid ETH hex", () => {
    const script: Script = {
      stack: [
        OP_CODES.OP_16,
        OP_CODES.OP_PUSHDATA_HEX_LE(
          "9e1be07558ea5cc8e02ed1d80c0911048afad949affa36d5c3951e3159dbea19"
        ),
      ],
    };

    expect(getDecodedAddress(script, "testnet")).toBeUndefined();
  });
});
