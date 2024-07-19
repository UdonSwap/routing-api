import { ChainId } from 'lampros-core'

export function chainIdToNetworkName(networkId: ChainId): string {
  switch (networkId) {
    case ChainId.MODE:
      return 'mode'
    default:
      return 'ethereum'
  }
}

export function generateProviderUrl(key: string, _value: string): string {
  switch (key) {
    case 'RPC_919': {
      return `https://sepolia.mode.network`
    }
  }
  throw new Error(`Unknown provider-chainId pair: ${key}`)
}

export function getProviderId(chainId: ChainId, providerName: string): string {
  return `${chainId.toString()}_${providerName}`
}
