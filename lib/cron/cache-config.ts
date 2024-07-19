import { Protocol } from 'lampros-router'
import { V3SubgraphProvider } from 'lampros-sor'
import { ChainId } from 'lampros-core'

const v3SubgraphUrlOverride = (chainId: ChainId) => {
  switch (chainId) {
    case ChainId.MODE:
      return `https://api.goldsky.com/api/public/project_clvqb3g2poub601xzgkzc9oxs/subgraphs/udonswap-v3/1/gn`
    default:
      return undefined
  }
}

export const chainProtocols = [
  // V3.
  {
    protocol: Protocol.V3,
    chainId: ChainId.MODE,
    timeout: 90000,
    provider: new V3SubgraphProvider(ChainId.MODE, 3, 90000, true, v3SubgraphUrlOverride(ChainId.MODE)),
  },
]
