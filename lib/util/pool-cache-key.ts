import { Protocol } from 'lampros-router'
import { ChainId } from 'lampros-core'

export const S3_POOL_CACHE_KEY = (baseKey: string, chain: ChainId, protocol: Protocol) =>
  `${baseKey}-${chain}-${protocol}`
