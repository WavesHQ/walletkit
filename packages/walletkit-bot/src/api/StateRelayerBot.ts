/* eslint-disable no-console */
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import { BigNumber } from "bignumber.js";

import { getWhaleClient } from "./DeFiChainCore";

type TokenSymbolStringPair = { [tokenSymbol: string]: string };

type PairData = {
  [pairSymbol: string]: {
    primaryTokenPrice: string;
    volume24H: string;
    totalLiquidity: string;
    apr: string;
    pooledTokensCount: TokenSymbolStringPair;
    conversationRate: TokenSymbolStringPair;
    rewards: string;
    commission: string;
  };
};

type VaultData = {
  totalVaults: number;
  totalLoanValue: number;
  totalCollateralValue: number;
  totalCollateralizationRatio: number;
  activeAuctions: number;
};

type MasternodesData = {
  totalValueLocked: number;
  zeroYearLocked: number;
  fiveYearsLocked: number;
  tenYearsLocked: number;
};

type BurnData = {
  totalDFIburned: number;
};

type DataStore = {
  // /dex
  totalValueLockInPoolPair: string;
  total24HVolume: string;
  pair: PairData;
  vaults: VaultData;
  masternodes: MasternodesData;
  burns: BurnData;
};

type StateRelayerHandlerProps = {
  urlNetwork: string;
  envNetwork: EnvironmentNetwork;
  previousBlockHeight?: number;
};

const DENOMINATION = "USDT";

export async function handler(
  props: StateRelayerHandlerProps
): Promise<DataStore | undefined> {
  const { urlNetwork, envNetwork, previousBlockHeight } = props;
  const dataStore = {} as DataStore;
  try {
    // Get Data from OCEAN API
    const client = getWhaleClient(urlNetwork, envNetwork);
    const statsData = await client.stats.get();

    // Check if Function should run (blockHeight > 30 from previous)
    if (
      previousBlockHeight &&
      statsData.count.blocks - previousBlockHeight <= 30
    ) {
      throw new Error("Less than 30 blocks have passed since last query");
      return; // Do we want to return nothing, cached data or an error?
    }

    const rawPoolpairData = await client.poolpairs.list(200);

    const dexPriceData = await client.poolpairs.listDexPrices(DENOMINATION);

    // sanitise response data
    const poolpairData = rawPoolpairData.filter(
      (pair: any) => !pair.displaySymbol.includes("/")
    );

    /* ------------ Data from /dex ----------- */
    // totalValueLockInPoolPair
    dataStore.totalValueLockInPoolPair = statsData.tvl.dex.toString();

    // total24HVolume
    const total24HVolume = poolpairData.reduce(
      (acc, currPair) => acc + (currPair.volume?.h24 ?? 0), // This is not accurate due to rounding, is it fine for volume?
      0
    );
    dataStore.total24HVolume = total24HVolume.toString();

    // pair
    const pair = poolpairData.reduce<PairData>((acc, currPair) => {
      let tokenPrice = new BigNumber(0);
      const priceRatio = currPair.priceRatio.ba;
      const { symbol } = currPair.tokenB;
      if (symbol === DENOMINATION || new BigNumber(priceRatio).isZero()) {
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
          // Overview
          primaryTokenPrice: tokenPrice.toString(),
          volume24H: currPair?.volume?.h24.toString() ?? "0",
          totalLiquidity: currPair.totalLiquidity.usd ?? "0",
          apr: currPair?.apr?.total.toString(),
          // Detail
          pooledTokensCount: {
            [currPair.tokenA.displaySymbol]: currPair.tokenA.reserve,
            [currPair.tokenB.displaySymbol]: currPair.tokenB.reserve,
          },
          conversionRate: {
            [currPair.tokenA.displaySymbol]: currPair.priceRatio.ab,
            [currPair.tokenB.displaySymbol]: currPair.priceRatio.ba,
          },
          rewards: (currPair.apr?.reward
            ? currPair.apr.reward * 100
            : 0
          ).toString(),
          commission: (currPair.apr?.commission
            ? currPair.apr.commission * 100
            : 0
          ).toString(),
        },
      } as PairData;
    }, {} as PairData);
    dataStore.pair = pair;

    const loanData = statsData.loan;
    // Get Data from /vaults
    const vaults = {
      totalVaults: loanData.count.openVaults,
      totalLoanValue: loanData.value.loan,
      totalCollateralValue: loanData.value.collateral,
      totalCollateralizationRatio:
        (loanData.value.collateral / loanData.value.loan) * 100,
      activeAuctions: loanData.count.openAuctions,
    };
    dataStore.vaults = vaults;

    // Get Data from /masternodes
    const lockedMasternodes = statsData.masternodes.locked;

    const masternodes = {
      totalValueLocked: statsData.tvl.masternodes, // Alternatively, can reduce lockedMasternodes to derive this data
      zeroYearLocked: lockedMasternodes.find((m) => m.weeks === 0)?.count ?? 0, // Can technically access element at 0 index for speed
      fiveYearsLocked:
        lockedMasternodes.find((m) => m.weeks === 260)?.count ?? 0,
      tenYearsLocked:
        lockedMasternodes.find((m) => m.weeks === 520)?.count ?? 0,
    };
    dataStore.masternodes = masternodes;

    // Get Data from all burns in ecosystem
    const burns = {
      // Other keys in burned such as address, auction, emission,
      // fee, and payback do not seem to be used in scan.
      totalDFIburned: statsData.burned.total,
    };
    dataStore.burns = burns;

    // Interfacing with SC
    // TODO: Connect with SC
    // TODO: Call SC Function to update Collated Data
    return dataStore;
  } catch (e) {
    console.error((e as Error).message);
    return undefined;
  }
}
