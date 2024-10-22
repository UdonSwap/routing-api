import { ChainId, Token } from 'lampros-core'
import {
  CachingGasStationProvider,
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  CachingV3PoolProvider,
  EIP1559GasPriceProvider,
  EthEstimateGasSimulator,
  FallbackTenderlySimulator,
  IGasPriceProvider,
  IMetric,
  IOnChainQuoteProvider,
  IRouteCachingProvider,
  ITokenListProvider,
  ITokenPropertiesProvider,
  ITokenProvider,
  IV3PoolProvider,
  IV3SubgraphProvider,
  LegacyGasPriceProvider,
  NodeJSCache,
  OnChainGasPriceProvider,
  OnChainQuoteProvider,
  setGlobalLogger,
  Simulator,
  StaticV3SubgraphProvider,
  TenderlySimulator,
  TokenPropertiesProvider,
  TokenProvider,
  TokenValidatorProvider,
  UniswapMulticallProvider,
  V3PoolProvider,
} from 'lampros-sor'
import { TokenList } from 'udonswap-token-lists'
import { default as bunyan, default as Logger } from 'bunyan'
import _ from 'lodash'
import NodeCache from 'node-cache'
import UNSUPPORTED_TOKEN_LIST from './../config/unsupported.tokenlist.json'
import { BaseRInj, Injector } from './handler'
import { V3AWSSubgraphProvider } from './router-entities/aws-subgraph-provider'
import { AWSTokenListProvider } from './router-entities/aws-token-list-provider'
import { DynamoRouteCachingProvider } from './router-entities/route-caching/dynamo-route-caching-provider'
import { DynamoDBCachingV3PoolProvider } from './pools/pool-caching/v3/dynamo-caching-pool-provider'
import { TrafficSwitchV3PoolProvider } from './pools/provider-migration/v3/traffic-switch-v3-pool-provider'
import { DefaultEVMClient } from './evm/EVMClient'
import { InstrumentedEVMProvider } from './evm/provider/InstrumentedEVMProvider'
import { deriveProviderName } from './evm/provider/ProviderName'
import { OnChainTokenFeeFetcher } from 'lampros-sor/build/main/providers/token-fee-fetcher'
import { PortionProvider } from 'lampros-sor/build/main/providers/portion-provider'
import { GlobalRpcProviders } from '../rpc/GlobalRpcProviders'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { TrafficSwitchOnChainQuoteProvider } from './quote/provider-migration/v3/traffic-switch-on-chain-quote-provider'
import {
  // BATCH_PARAMS,
  BLOCK_NUMBER_CONFIGS,
  GAS_ERROR_FAILURE_OVERRIDES,
  NON_OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS,
  OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS,
  RETRY_OPTIONS,
  SUCCESS_RATE_FAILURE_OVERRIDES,
} from '../util/onChainQuoteProviderConfigs'
import { v4 } from 'uuid/index'
import { chainProtocols } from '../cron/cache-config'
import { Protocol } from 'lampros-router'

export const SUPPORTED_CHAINS: ChainId[] = [
  ChainId.MODE,
]
const DEFAULT_TOKEN_LIST = 'https://udonswap-tokenlist.vercel.app/v3-tokens'

export interface RequestInjected<Router> extends BaseRInj {
  chainId: ChainId
  metric: IMetric
  v3PoolProvider: IV3PoolProvider
  tokenProvider: ITokenProvider
  tokenListProvider: ITokenListProvider
  router: Router
  quoteSpeed?: string
  intent?: string
}

export type ContainerDependencies = {
  provider: StaticJsonRpcProvider
  v3SubgraphProvider: IV3SubgraphProvider
  tokenListProvider: ITokenListProvider
  gasPriceProvider: IGasPriceProvider
  tokenProviderFromTokenList: ITokenProvider
  blockedTokenListProvider: ITokenListProvider
  v3PoolProvider: IV3PoolProvider
  tokenProvider: ITokenProvider
  multicallProvider: UniswapMulticallProvider
  onChainQuoteProvider?: IOnChainQuoteProvider
  simulator: Simulator
  routeCachingProvider?: IRouteCachingProvider
  tokenValidatorProvider: TokenValidatorProvider
  tokenPropertiesProvider: ITokenPropertiesProvider
}

export interface ContainerInjected {
  dependencies: {
    [chainId in ChainId]?: ContainerDependencies
  }
  activityId?: string
}

export abstract class InjectorSOR<Router, QueryParams> extends Injector<
  ContainerInjected,
  RequestInjected<Router>,
  void,
  QueryParams
> {
  public async buildContainerInjected(): Promise<ContainerInjected> {
    const activityId = v4()
    const log: Logger = bunyan.createLogger({
      name: this.injectorName,
      serializers: bunyan.stdSerializers,
      level: bunyan.INFO,
      activityId: activityId,
    })
    setGlobalLogger(log)

    try {
      const {
        POOL_CACHE_BUCKET_2,
        POOL_CACHE_BUCKET_3,
        POOL_CACHE_KEY,
        POOL_CACHE_GZIP_KEY,
        TOKEN_LIST_CACHE_BUCKET,
        ROUTES_TABLE_NAME,
        ROUTES_CACHING_REQUEST_FLAG_TABLE_NAME,
        CACHED_ROUTES_TABLE_NAME,
        AWS_LAMBDA_FUNCTION_NAME,
      } = process.env

      const dependenciesByChain: {
        [chainId in ChainId]?: ContainerDependencies
      } = {}

      const dependenciesByChainArray = await Promise.all(
        _.map(SUPPORTED_CHAINS, async (chainId: ChainId) => {
          let url = ''
          if (!GlobalRpcProviders.getGlobalUniRpcProviders(log).has(chainId)) {
            // Check existence of env var for chain that doesn't use RPC gateway.
            // (If use RPC gateway, the check for env var will be executed elsewhere.)
            // TODO(jie): Remove this check once we migrate all chains to RPC gateway.
            url = process.env[`WEB3_RPC_${chainId.toString()}`]!
            if (!url) {
              log.fatal({ chainId: chainId }, `Fatal: No Web3 RPC endpoint set for chain`)
              return { chainId, dependencies: {} as ContainerDependencies }
              // This router instance will not be able to route through any chain
              // for which RPC URL is not set
              // For now, if RPC URL is not set for a chain, a request to route
              // on the chain will return Err 500
            }
          }

          let timeout: number
          switch (chainId) {
            case ChainId.MODE:
              timeout = 8000
              break
            default:
              timeout = 5000
              break
          }

          let provider: StaticJsonRpcProvider
          if (GlobalRpcProviders.getGlobalUniRpcProviders(log).has(chainId)) {
            // Use RPC gateway.
            provider = GlobalRpcProviders.getGlobalUniRpcProviders(log).get(chainId)!
          } else {
            provider = new DefaultEVMClient({
              allProviders: [
                new InstrumentedEVMProvider({
                  url: {
                    url: url,
                    timeout,
                  },
                  network: chainId,
                  name: deriveProviderName(url),
                }),
              ],
            }).getProvider()
          }

          const tokenCache = new NodeJSCache<Token>(new NodeCache({ stdTTL: 3600, useClones: false }))
          const blockedTokenCache = new NodeJSCache<Token>(new NodeCache({ stdTTL: 3600, useClones: false }))
          const multicall2Provider = new UniswapMulticallProvider(chainId, provider, 375_000)

          const noCacheV3PoolProvider = new V3PoolProvider(chainId, multicall2Provider)
          const inMemoryCachingV3PoolProvider = new CachingV3PoolProvider(
            chainId,
            noCacheV3PoolProvider,
            new NodeJSCache(new NodeCache({ stdTTL: 180, useClones: false }))
          )
          const dynamoCachingV3PoolProvider = new DynamoDBCachingV3PoolProvider(
            chainId,
            noCacheV3PoolProvider,
            'V3PoolsCachingDB'
          )

          const v3PoolProvider = new TrafficSwitchV3PoolProvider({
            currentPoolProvider: inMemoryCachingV3PoolProvider,
            targetPoolProvider: dynamoCachingV3PoolProvider,
            sourceOfTruthPoolProvider: noCacheV3PoolProvider,
          })

          const tokenFeeFetcher = new OnChainTokenFeeFetcher(chainId, provider)
          const tokenValidatorProvider = new TokenValidatorProvider(
            chainId,
            multicall2Provider,
            new NodeJSCache(new NodeCache({ stdTTL: 30000, useClones: false }))
          )
          const tokenPropertiesProvider = new TokenPropertiesProvider(
            chainId,
            new NodeJSCache(new NodeCache({ stdTTL: 30000, useClones: false })),
            tokenFeeFetcher
          )

          const [tokenListProvider, blockedTokenListProvider, v3SubgraphProvider] =
            await Promise.all([
              AWSTokenListProvider.fromTokenListS3Bucket(chainId, TOKEN_LIST_CACHE_BUCKET!, DEFAULT_TOKEN_LIST),
              CachingTokenListProvider.fromTokenList(chainId, UNSUPPORTED_TOKEN_LIST as TokenList, blockedTokenCache),
              (async () => {
                try {
                  const chainProtocol = chainProtocols.find(
                    (chainProtocol) => chainProtocol.chainId === chainId && chainProtocol.protocol === Protocol.V3
                  )

                  if (!chainProtocol) {
                    throw new Error(`Chain protocol not found for chain ${chainId} and protocol ${Protocol.V3}`)
                  }

                  const subgraphProvider = await V3AWSSubgraphProvider.EagerBuild(
                    POOL_CACHE_BUCKET_3!,
                    POOL_CACHE_GZIP_KEY!,
                    chainId
                  ).catch(async (err) => {
                    log.error(
                      { err },
                      'compressed s3 subgraph pool caching unavailable, fall back to the existing s3 subgraph pool caching'
                    )

                    return await V3AWSSubgraphProvider.EagerBuild(POOL_CACHE_BUCKET_2!, POOL_CACHE_KEY!, chainId)
                  })
                  return subgraphProvider
                } catch (err) {
                  log.error({ err }, 'AWS Subgraph Provider unavailable, defaulting to Static Subgraph Provider')
                  return new StaticV3SubgraphProvider(chainId, v3PoolProvider)
                }
              })(),
            ])

          const tokenProvider = new CachingTokenProviderWithFallback(
            chainId,
            tokenCache,
            tokenListProvider,
            new TokenProvider(chainId, multicall2Provider)
          )

          // Some providers like Infura set a gas limit per call of 10x block gas which is approx 150m
          // 200*725k < 150m
          let quoteProvider: IOnChainQuoteProvider | undefined = undefined
          switch (chainId) {
            case ChainId.MODE:
              const currentQuoteProvider = new OnChainQuoteProvider(
                chainId,
                provider,
                multicall2Provider,
                RETRY_OPTIONS[chainId],
                (optimisticCachedRoutes) => {
                  const protocol = Protocol.V3
                  return optimisticCachedRoutes
                    ? OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS[protocol][chainId]
                    : NON_OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS[protocol][chainId]
                },
                // BATCH_PARAMS[chainId],
                GAS_ERROR_FAILURE_OVERRIDES[chainId],
                SUCCESS_RATE_FAILURE_OVERRIDES[chainId],
                BLOCK_NUMBER_CONFIGS[chainId],
              )
              const targetQuoteProvider = new OnChainQuoteProvider(
                chainId,
                provider,
                multicall2Provider,
                RETRY_OPTIONS[chainId],
                (optimisticCachedRoutes) => {
                  const protocol = Protocol.V3
                  return optimisticCachedRoutes
                    ? OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS[protocol][chainId]
                    : NON_OPTIMISTIC_CACHED_ROUTES_BATCH_PARAMS[protocol][chainId]
                },
                // BATCH_PARAMS[chainId],
                GAS_ERROR_FAILURE_OVERRIDES[chainId],
                SUCCESS_RATE_FAILURE_OVERRIDES[chainId],
                BLOCK_NUMBER_CONFIGS[chainId],
              )
              quoteProvider = new TrafficSwitchOnChainQuoteProvider({
                currentQuoteProvider: currentQuoteProvider,
                targetQuoteProvider: targetQuoteProvider,
                chainId: chainId,
              })
              break
          }

          const portionProvider = new PortionProvider()
          const tenderlySimulator = new TenderlySimulator(
            chainId,
            'https://api.tenderly.co',
            process.env.TENDERLY_USER!,
            process.env.TENDERLY_PROJECT!,
            process.env.TENDERLY_ACCESS_KEY!,
            process.env.TENDERLY_NODE_API_KEY!,
            v3PoolProvider,
            provider,
            portionProvider,
            undefined,
            // The timeout for the underlying axios call to Tenderly, measured in milliseconds.
            2.5 * 1000
          )

          const ethEstimateGasSimulator = new EthEstimateGasSimulator(
            chainId,
            provider,
            v3PoolProvider,
            portionProvider
          )

          const simulator = new FallbackTenderlySimulator(
            chainId,
            provider,
            portionProvider,
            tenderlySimulator,
            ethEstimateGasSimulator
          )

          let routeCachingProvider: IRouteCachingProvider | undefined = undefined
          if (CACHED_ROUTES_TABLE_NAME && CACHED_ROUTES_TABLE_NAME !== '') {
            routeCachingProvider = new DynamoRouteCachingProvider({
              routesTableName: ROUTES_TABLE_NAME!,
              routesCachingRequestFlagTableName: ROUTES_CACHING_REQUEST_FLAG_TABLE_NAME!,
              cachingQuoteLambdaName: AWS_LAMBDA_FUNCTION_NAME!,
            })
          }

          // const v2Supported = [
          // ]

          return {
            chainId,
            dependencies: {
              provider,
              tokenListProvider,
              blockedTokenListProvider,
              multicallProvider: multicall2Provider,
              tokenProvider,
              tokenProviderFromTokenList: tokenListProvider,
              gasPriceProvider: new CachingGasStationProvider(
                chainId,
                new OnChainGasPriceProvider(
                  chainId,
                  new EIP1559GasPriceProvider(provider),
                  new LegacyGasPriceProvider(provider)
                ),
                new NodeJSCache(new NodeCache({ stdTTL: 15, useClones: false }))
              ),
              v3SubgraphProvider,
              onChainQuoteProvider: quoteProvider,
              v3PoolProvider,
              simulator,
              routeCachingProvider,
              tokenValidatorProvider,
              tokenPropertiesProvider,
            },
          }
        })
      )

      for (const { chainId, dependencies } of dependenciesByChainArray) {
        dependenciesByChain[chainId] = dependencies
      }

      return {
        dependencies: dependenciesByChain,
        activityId: activityId,
      }
    } catch (err) {
      log.fatal({ err }, `Fatal: Failed to build container`)
      throw err
    }
  }
}
