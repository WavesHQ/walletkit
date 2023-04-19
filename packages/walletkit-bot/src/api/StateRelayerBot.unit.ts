import axios from "axios";

import {
  expectedPairData,
  mockedDexPricesData,
  mockedPoolPairData,
  mockedStatsData,
} from "../utils/oceanMockedData";
import {
  DEXPRICE_URL,
  handler,
  POOLPAIR_URL,
  STATS_URL,
} from "./StateRelayerBot";

jest.mock("axios");

describe("State Relayer Bot Tests", () => {
  test("should check block height difference is more than 30", () => {});
  test("should check that data is parsed correctly", async () => {
    axios.get = jest.fn().mockImplementation((url) => {
      if (url === STATS_URL) return mockedStatsData;
      if (url === POOLPAIR_URL) return mockedPoolPairData;
      if (url === DEXPRICE_URL) return mockedDexPricesData;
      return {};
    });
    const response = await runHandler();
    expect(response).toBeDefined();

    // should check data from /dex is parsed correctly
    expect(response).toHaveProperty(
      "totalValueLockInPoolPair",
      "282144133.3567614"
    );
    expect(response).toHaveProperty("total24HVolume", "60010");
    expect(response).toHaveProperty("pair", expectedPairData);

    // should check data from /dex/[pool-pair] is parsed correctly

    // should check data from /vaults is parsed correctly

    // should check data from /masternodes is parsed correctly

    // should check data from all burns is parsed correctly
  });
});

async function runHandler() {
  return handler();
}
