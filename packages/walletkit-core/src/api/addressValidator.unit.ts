import {validateAddress, validateEthAddress} from "./addressValidator";

const WALLET_ADDRESS = {
  mainnet: "df1qldycdkvqaacwsf4gmgl29mt686mh95kattran0",
  testnet: "tf1qm5hf2lhrsyfzeu0mnnzl3zllznfveua5rprhr4",
  regtest: "bcrt1qh2yq58tzsh4gled7wv98mm7lndj9u5v6zyr2ge",
};

const ETH_ADDRESS = {
  valid: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
  validICAP: "XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36",
  invalid: "0x8Ba1f109551bD432803012645Ac136ddd64DBa72",
  invalidICAP: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
  random: "testing invalid eth address"
}

describe("Address validator", () => {
  it("should be valid DFC address for Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.mainnet, "mainnet");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be valid DFC address for Testnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.testnet, "testnet");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be valid DFC address for Regtest network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.regtest, "regtest");
    expect(isValidAddress).toBeTruthy();
  });

  it("should be invalid when a Mainnet address is used on Testnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.mainnet, "testnet");
    expect(isValidAddress).toBeFalsy();
  });

  it("should be invalid when a Testnet address is used on Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.testnet, "mainnet");
    expect(isValidAddress).toBeFalsy();
  });

  it("should be invalid when a Regtest address is used on Mainnet network", () => {
    const isValidAddress = validateAddress(WALLET_ADDRESS.regtest, "mainnet");
    expect(isValidAddress).toBeFalsy();
  });

  // eth addresses
  it("should be valid ETH address", () => {
    const isValidAddress = validateEthAddress(ETH_ADDRESS.valid)
    expect(isValidAddress).toBeTruthy();
  })

  it("should be valid ETH ICAP address", () => {
    const isValidAddress = validateEthAddress(ETH_ADDRESS.validICAP)
    expect(isValidAddress).toBeTruthy();
  })

  it("should be invalid ETH address", () => {
    const isValidAddress = validateEthAddress(ETH_ADDRESS.invalid)
    expect(isValidAddress).toBeFalsy();
  })

  it("should be invalid ETH ICAP address", () => {
    const isValidAddress = validateEthAddress(ETH_ADDRESS.invalidICAP)
    expect(isValidAddress).toBeFalsy();
  })

  it("should be invalid random address", () => {
    const isValidAddress = validateEthAddress(ETH_ADDRESS.random)
    expect(isValidAddress).toBeFalsy();
  })
});
