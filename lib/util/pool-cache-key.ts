import { Protocol } from 'udonswap-router'
import { ChainId } from 'udonswap-core'

export const S3_POOL_CACHE_KEY = (baseKey: string, chain: ChainId, protocol: Protocol) =>
  `${baseKey}-${chain}-${protocol}`
