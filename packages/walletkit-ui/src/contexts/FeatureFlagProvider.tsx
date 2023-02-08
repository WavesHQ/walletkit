import {
  getEnvironment,
  FeatureFlag,
  FeatureFlagID,
  Platform,
} from "@waveshq/walletkit-core";
import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
} from "react";
import { satisfies } from "semver";
import { useNetworkContext } from "./NetworkContext";
import { useServiceProviderContext } from "./StoreServiceProvider";
import { useGetFeatureFlagsQuery, usePrefetch } from "../store";
import { BaseLogger } from "./logger";

const MAX_RETRY = 3;
export interface FeatureFlagContextI {
  featureFlags: FeatureFlag[];
  enabledFeatures: FeatureFlagID[];
  updateEnabledFeatures: (features: FeatureFlagID[]) => void;
  isFeatureAvailable: (featureId: FeatureFlagID) => boolean;
  isBetaFeature: (featureId: FeatureFlagID) => boolean;
  hasBetaFeatures: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextI>(undefined as any);

export function useFeatureFlagContext(): FeatureFlagContextI {
  return useContext(FeatureFlagContext);
}

export interface FeatureFlagProviderProps extends PropsWithChildren<{}> {
  api: {
    get: () => Promise<FeatureFlagID[]>;
    set: (features: FeatureFlagID[]) => Promise<void>;
  };
  logger: BaseLogger;
  releaseChannel: string;
  platformOS: Platform;
  nativeApplicationVersion: string | null;
}

export function FeatureFlagProvider(
  props: FeatureFlagProviderProps
): JSX.Element | null {
  const { logger, api, releaseChannel, platformOS, nativeApplicationVersion } =
    props;
  const { network } = useNetworkContext();
  const { url, isCustomUrl } = useServiceProviderContext();
  const {
    data: featureFlags = [],
    isLoading,
    isError,
    refetch,
  } = useGetFeatureFlagsQuery(`${network}.${url}`);

  const prefetchPage = usePrefetch("getFeatureFlags");
  const appVersion = nativeApplicationVersion ?? "0.0.0";
  const [enabledFeatures, setEnabledFeatures] = useState<FeatureFlagID[]>([]);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (isError && retries < MAX_RETRY) {
      setTimeout(() => {
        prefetchPage({});
        setRetries(retries + 1);
      }, 10000);
    } else if (!isError) {
      prefetchPage({});
    }
  }, [isError]);

  useEffect(() => {
    refetch();
  }, [network]);

  function isBetaFeature(featureId: FeatureFlagID): boolean {
    return featureFlags.some(
      (flag: FeatureFlag) =>
        satisfies(appVersion, flag.version) &&
        flag.networks?.includes(network) &&
        flag.id === featureId &&
        flag.stage === "beta"
    );
  }

  function isFeatureAvailable(featureId: FeatureFlagID): boolean {
    return featureFlags.some((flag: FeatureFlag) => {
      if (
        flag.networks?.includes(network) &&
        flag.app?.includes("MOBILE_LW") &&
        flag.platforms?.includes(platformOS)
      ) {
        if (platformOS === "web") {
          return flag.id === featureId && checkFeatureStage(flag);
        }
        return (
          satisfies(appVersion, flag.version) &&
          flag.id === featureId &&
          checkFeatureStage(flag)
        );
      }
      return false;
    });
  }

  function checkFeatureStage(feature: FeatureFlag): boolean {
    switch (feature.stage) {
      case "alpha":
        return getEnvironment(releaseChannel).debug;
      case "beta":
        return enabledFeatures.includes(feature.id);
      case "public":
        return true;
      default:
        return false;
    }
  }

  const updateEnabledFeatures = async (
    flags: FeatureFlagID[]
  ): Promise<void> => {
    setEnabledFeatures(flags);
    await api.set(flags);
  };

  useEffect(() => {
    api
      .get()
      .then((features) => {
        setEnabledFeatures(features);
      })
      .catch((err) => logger.error(err));
  }, []);

  /*
      If service provider === custom, we keep showing the app regardless if feature flags loaded to ensure app won't be stuck on white screen
      Note: return null === app will be stuck at white screen until the feature flags API are applied
    */
  if (isLoading && !isCustomUrl) {
    return null;
  }

  const context: FeatureFlagContextI = {
    featureFlags,
    enabledFeatures,
    updateEnabledFeatures,
    isFeatureAvailable,
    isBetaFeature,
    hasBetaFeatures: featureFlags.some(
      (flag) =>
        satisfies(appVersion, flag.version) &&
        flag.networks?.includes(network) &&
        flag.platforms?.includes(platformOS) &&
        flag.stage === "beta"
    ),
  };

  if (isError && !isLoading && retries < MAX_RETRY) {
    return <></>;
  }

  return (
    <FeatureFlagContext.Provider value={context}>
      {props.children}
    </FeatureFlagContext.Provider>
  );
}

export function FeatureGate({
  children,
  feature,
}: {
  children: ReactElement;
  feature: FeatureFlagID;
}): JSX.Element | null {
  const { isFeatureAvailable } = useFeatureFlagContext();
  return isFeatureAvailable(feature) ? children : null;
}
