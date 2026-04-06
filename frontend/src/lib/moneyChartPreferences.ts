import {
  CHART_RANGE_OPTIONS,
  DEFAULT_ASSET_CHART_RANGE,
  DEFAULT_ASSET_CHART_TARGET_KEY,
  type AssetChartRange,
  type AssetChartTargetKey,
} from "@/lib/assets";

export interface MoneyChartPreferences {
  defaultTargetKey: AssetChartTargetKey;
  defaultRange: AssetChartRange;
}

export interface MoneyChartPreferencesStore {
  load: () => Partial<MoneyChartPreferences> | null;
  save: (preferences: MoneyChartPreferences) => void;
}

const STORAGE_KEY = "money-chart-preferences";

export const DEFAULT_MONEY_CHART_PREFERENCES: MoneyChartPreferences = {
  defaultTargetKey: DEFAULT_ASSET_CHART_TARGET_KEY,
  defaultRange: DEFAULT_ASSET_CHART_RANGE,
};

const localMoneyChartPreferencesStore: MoneyChartPreferencesStore = {
  load: () => {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as Partial<MoneyChartPreferences>;
    } catch {
      return null;
    }
  },
  save: (preferences) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  },
};

export function resolveMoneyChartPreferences(
  rawPreferences: Partial<MoneyChartPreferences> | null,
  validTargetKeys: AssetChartTargetKey[]
): MoneyChartPreferences {
  const defaultTargetKey =
    rawPreferences?.defaultTargetKey && validTargetKeys.includes(rawPreferences.defaultTargetKey)
      ? rawPreferences.defaultTargetKey
      : DEFAULT_MONEY_CHART_PREFERENCES.defaultTargetKey;
  const defaultRange =
    rawPreferences?.defaultRange && CHART_RANGE_OPTIONS.includes(rawPreferences.defaultRange)
      ? rawPreferences.defaultRange
      : DEFAULT_MONEY_CHART_PREFERENCES.defaultRange;

  return {
    defaultTargetKey,
    defaultRange,
  };
}

export function loadMoneyChartPreferences(
  validTargetKeys: AssetChartTargetKey[],
  store: MoneyChartPreferencesStore = localMoneyChartPreferencesStore
) {
  return resolveMoneyChartPreferences(store.load(), validTargetKeys);
}

export function saveMoneyChartPreferences(
  preferences: MoneyChartPreferences,
  validTargetKeys: AssetChartTargetKey[],
  store: MoneyChartPreferencesStore = localMoneyChartPreferencesStore
) {
  store.save(resolveMoneyChartPreferences(preferences, validTargetKeys));
}
