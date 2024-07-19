import { ChainId } from 'lampros-core'

export type QuoteProviderTrafficSwitchConfiguration = {
  switchExactInPercentage: number
  samplingExactInPercentage: number
  switchExactOutPercentage: number
  samplingExactOutPercentage: number
}

export const QUOTE_PROVIDER_TRAFFIC_SWITCH_CONFIGURATION = (
  chainId: ChainId
): QuoteProviderTrafficSwitchConfiguration => {
  switch (chainId) {
    case ChainId.MODE:
      // Total RPM for 'QuoteTotalCallsToProvider' is around 20k-30k (across all chains), so 0.1% means 20-30 RPM shadow sampling
      return {
        switchExactInPercentage: 100,
        samplingExactInPercentage: 0,
        switchExactOutPercentage: 100,
        samplingExactOutPercentage: 0,
      } as QuoteProviderTrafficSwitchConfiguration
    // If we accidentally switch a traffic, we have the protection to shadow sample only 0.1% of traffic
    default:
      return {
        switchExactInPercentage: 0.0,
        samplingExactInPercentage: 0.1,
        switchExactOutPercentage: 0.0,
        samplingExactOutPercentage: 0.1,
      } as QuoteProviderTrafficSwitchConfiguration
  }
}
