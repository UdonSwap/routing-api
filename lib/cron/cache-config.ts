import { Protocol } from 'udonswap-router'
import { V2SubgraphProvider, V3SubgraphProvider } from 'udonswap-smart-order-router-v3'
import { ChainId } from 'udonswap-core'

const v3SubgraphUrlOverride = (chainId: ChainId) => {
  switch (chainId) {
    // case ChainId.MAINNET:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-mainnet/api`
    // case ChainId.OPTIMISM:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-optimism-ii/api`
    // case ChainId.AVALANCHE:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-avalanche/api`
    // case ChainId.BNB:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-bsc-ii/api`
    // case ChainId.BLAST:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-blast/api`
    // case ChainId.BASE:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-base/api`
    // case ChainId.CELO:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v3-celo/api`
    case ChainId.MODE:
      return `https://api.goldsky.com/api/public/project_clvqb3g2poub601xzgkzc9oxs/subgraphs/udonswap-v3/1/gn`
      default:
      return undefined
  }
}

const v2SubgraphUrlOverride = (chainId: ChainId) => {
  switch (chainId) {
    // case ChainId.ARBITRUM_ONE:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-arbitrum/api`
    // case ChainId.POLYGON:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-polygon/api`
    // case ChainId.OPTIMISM:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-optimism/api`
    // case ChainId.AVALANCHE:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-avalanche/api`
    // case ChainId.BNB:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-bsc/api`
    // case ChainId.BLAST:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-blast/api`
    // case ChainId.BASE:
    //   return `https://subgraph.satsuma-prod.com/${process.env.ALCHEMY_QUERY_KEY}/uniswap/uniswap-v2-base/api`
    case ChainId.MODE:
      return `https://api.goldsky.com/api/public/project_clth71vucl2l701uu07ha0im7/subgraphs/udonswap/0.0.1/gn`
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
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.MAINNET,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.MAINNET, 3, 90000, true, v3SubgraphUrlOverride(ChainId.MAINNET)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.ARBITRUM_ONE,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.ARBITRUM_ONE, 3, 90000),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.POLYGON,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.POLYGON, 3, 90000),
  // },
  // // Waiting for Alchemy subgraph
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.OPTIMISM,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.OPTIMISM, 3, 90000, true, v3SubgraphUrlOverride(ChainId.OPTIMISM)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.CELO,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.CELO, 3, 90000, true, v3SubgraphUrlOverride(ChainId.CELO)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.BNB,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.BNB, 3, 90000, true, v3SubgraphUrlOverride(ChainId.BNB)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.AVALANCHE,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.AVALANCHE, 3, 90000, true, v3SubgraphUrlOverride(ChainId.AVALANCHE)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.BASE,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.BASE, 3, 90000, true, v3SubgraphUrlOverride(ChainId.BASE)),
  // },
  // {
  //   protocol: Protocol.V3,
  //   chainId: ChainId.BLAST,
  //   timeout: 90000,
  //   provider: new V3SubgraphProvider(ChainId.BLAST, 3, 90000, true, v3SubgraphUrlOverride(ChainId.BLAST)),
  // },

  // V2.
  {
    protocol: Protocol.V2,
    chainId: ChainId.MODE,
    timeout: 840000,
    provider: new V2SubgraphProvider(ChainId.MODE, 3, 900000, true, 1000, v2SubgraphUrlOverride(ChainId.MODE)), // 1000 is the largest page size supported by thegraph
  },
  //   {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.MODE,
  //   timeout: 840000,
  //   provider: new V2SubgraphProvider(ChainId.MODE, 3, 900000, true, 1000,  v2SubgraphUrlOverride(ChainId.MODE)), // 1000 is the largest page size supported by thegraph
  // },
  //   protocol: Protocol.V2,
  //   chainId: ChainId.MAINNET,
  //   timeout: 840000,
  //   provider: new V2SubgraphProvider(ChainId.MAINNET, 3, 900000, true, 1000), // 1000 is the largest page size supported by thegraph
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.ARBITRUM_ONE,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(
  //     ChainId.ARBITRUM_ONE,
  //     3,
  //     90000,
  //     true,
  //     1000,
  //     v2SubgraphUrlOverride(ChainId.ARBITRUM_ONE)
  //   ),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.POLYGON,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.POLYGON, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.POLYGON)),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.OPTIMISM,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.OPTIMISM, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.OPTIMISM)),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.BNB,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.BNB, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.BNB)),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.AVALANCHE,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.AVALANCHE, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.AVALANCHE)),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.BASE,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.BASE, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.BASE)),
  // },
  // {
  //   protocol: Protocol.V2,
  //   chainId: ChainId.BLAST,
  //   timeout: 90000,
  //   provider: new V2SubgraphProvider(ChainId.BLAST, 3, 90000, true, 1000, v2SubgraphUrlOverride(ChainId.BLAST)),
  // },
]
