/* eslint-disable no-console */
import axios from "axios";
import { BigNumber } from "bignumber.js";
// import { BigNumber } from "bignumber.js";

type PairData = {
  [pairSymbol: string]: {
    primaryTokenPrice: string;
    volume24H: string;
    totalLiquidity: string;
    apr: string;
  };
};

type DataStore = {
  // /dex
  totalValueLockInPoolPair: string;
  total24HVolume: string;
  pair: PairData;
};

export const STATS_URL = "https://ocean.defichain.com/v0/mainnet/stats";
export const POOLPAIR_URL =
  "https://ocean.defichain.com/v0/mainnet/poolpairs?size=200"; // return paginated res might have to handle pagination
export const DEXPRICE_URL =
  "https://ocean.defichain.com/v0/mainnet/poolpairs/dexprices?denomination=USDT";

export async function handler(): Promise<DataStore | undefined> {
  const dataStore = {} as DataStore;
  try {
    // TODO: Check if Function should run (blockHeight > 30 from previous)
    // Get Data from OCEAN API
    // TODO: Get Data from /dex
    const {
      data: { data: statsData },
    } = await axios.get(STATS_URL);
    const {
      data: { data: rawPoolpairData },
    } = await axios.get(POOLPAIR_URL);
    const {
      data: { data: dexPriceData },
    } = await axios.get(DEXPRICE_URL);

    // sanitise response data
    const poolpairData = rawPoolpairData.filter(
      (pair: any) => !pair.displaySymbol.includes("/")
    );

    // totalValueLockInPoolPair
    dataStore.totalValueLockInPoolPair = statsData.tvl.dex.toString();

    // total24HVolume
    const total24HVolume = poolpairData.reduce(
      (acc: any, currPair: { volume: { h24: any } }) =>
        acc + (currPair.volume?.h24 ?? 0),
      0
    );
    dataStore.total24HVolume = total24HVolume.toString();

    // pair
    const pair: PairData = poolpairData.reduce(
      (acc: PairData, currPair: any) => {
        let tokenPrice = new BigNumber(0);
        const priceRatio = currPair.priceRatio.ba;
        const { symbol } = currPair.tokenB;
        if (symbol === "USDT" || new BigNumber(priceRatio).isZero()) {
          tokenPrice = new BigNumber(0);
        } else {
          const dexPricePerToken = new BigNumber(
            dexPriceData.dexPrices[symbol].denominationPrice ?? 0
          );
          tokenPrice = dexPricePerToken.multipliedBy(currPair.priceRatio.ba);
        }
        return {
          ...acc,
          [currPair.displaySymbol]: {
            primaryTokenPrice: tokenPrice.toString(),
            volume24H: currPair.volume.h24.toString() ?? "0",
            totalLiquidity: currPair.totalLiquidity.usd ?? "0",
            apr: currPair.apr.total.toString(),
          },
        };
      },
      {} as PairData
    );
    dataStore.pair = pair;
    console.dir(dataStore);
    // TODO: Get Data from /dex/[pool-pair]
    // TODO: Get Data from /vaults
    // TODO: Get Data from /masternodes
    // TODO: Get Data from all burns in ecosystem
    // Interfacing with SC
    // TODO: Connect with SC
    // TODO: Call SC Function to update Collated Data
    return dataStore;
  } catch (e) {
    console.error((e as Error).message);
    return undefined;
  }
}
