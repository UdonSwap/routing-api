import {
  OnChainQuoteProvider,
  RouteWithQuotes,
  USDC_MODE,
  V3PoolProvider,
  WRAPPED_NATIVE_CURRENCY,
} from 'udonswap-smart-order-router-v3'
import { Pool } from 'udonswap-v3'
import {
  buildMockV3PoolAccessor,
  DAI_USDT_LOW,
  USDC_DAI_LOW,
  USDC_DAI_MEDIUM,
  USDC_WETH_LOW,
  WETH9_USDT_LOW,
} from './mocked-data'
import sinon from 'sinon'
import { V3Route } from 'udonswap-smart-order-router-v3/build/main/routers'
import { ChainId, CurrencyAmount } from 'udonswap-core'
import { AmountQuote } from 'udonswap-smart-order-router-v3/build/main/providers/on-chain-quote-provider'
import { BigNumber } from 'ethers'

export function getMockedV3PoolProvider(
  pools: Pool[] = [USDC_DAI_LOW, USDC_DAI_MEDIUM, USDC_WETH_LOW, WETH9_USDT_LOW, DAI_USDT_LOW]
): V3PoolProvider {
  const mockV3PoolProvider = sinon.createStubInstance(V3PoolProvider)

  mockV3PoolProvider.getPools.resolves(buildMockV3PoolAccessor(pools))
  mockV3PoolProvider.getPoolAddress.callsFake((tA, tB, fee) => ({
    poolAddress: Pool.getAddress(tA, tB, fee),
    token0: tA,
    token1: tB,
  }))

  return mockV3PoolProvider
}

export function getMockedOnChainQuoteProvider(): sinon.SinonStubbedInstance<OnChainQuoteProvider> {
  const mockedQuoteProvider = sinon.createStubInstance(OnChainQuoteProvider)
  const route = new V3Route([USDC_WETH_LOW], WRAPPED_NATIVE_CURRENCY[ChainId.MODE], USDC_MODE)
  const quotes: AmountQuote[] = [
    {
      amount: CurrencyAmount.fromRawAmount(WRAPPED_NATIVE_CURRENCY[ChainId.MODE], '1000000000000000000'),
      quote: BigNumber.from('1000000000000000000'),
      sqrtPriceX96AfterList: [BigNumber.from(100)],
      initializedTicksCrossedList: [1, 1, 1],
      gasEstimate: BigNumber.from(10000),
      gasLimit: BigNumber.from(1000000),
    },
  ]
  const routesWithQuotes: RouteWithQuotes<V3Route>[] = [[route, quotes]]
  mockedQuoteProvider.getQuotesManyExactIn.resolves({
    routesWithQuotes: routesWithQuotes,
    blockNumber: BigNumber.from(0),
  })
  mockedQuoteProvider.getQuotesManyExactOut.resolves({
    routesWithQuotes: routesWithQuotes,
    blockNumber: BigNumber.from(0),
  })

  return mockedQuoteProvider
}

export const TEST_ROUTE_TABLE = {
  TableName: 'PoolCachingV3',
  KeySchema: [
    {
      AttributeName: 'poolAddress',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'blockNumber',
      KeyType: 'RANGE',
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'poolAddress',
      AttributeType: 'S',
    },
    {
      AttributeName: 'blockNumber',
      AttributeType: 'N',
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
}
