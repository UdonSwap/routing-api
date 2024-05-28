import { ChainId, TradeType } from 'udonswap-core'

export const PAIRS_TO_TRACK: Map<ChainId, Map<TradeType, string[]>> = new Map([
  [
    ChainId.MODE,
    new Map([
      [
        TradeType.EXACT_INPUT,
        ['WETH/USDC_MODE', 'USDC_MODE/WETH', 'USDT_MODE/WETH', 'WETH/USDT_MODE', 'WETH/*', 'USDC_MODE/*', 'USDT_MODE/*', 'DAI_MODE/*', 'WBTC_MODE/*'],
      ],
      [TradeType.EXACT_OUTPUT, ['USDC_MODE/WETH', '*/WETH', '*/USDC_MODE', '*/USDT_MODE', '*/DAI_MODE']],
    ]),
  ],
  // [
  //   ChainId.OPTIMISM,
  //   new Map([
  //     [TradeType.EXACT_INPUT, ['WETH/USDC', 'USDC/WETH']],
  //     [TradeType.EXACT_OUTPUT, ['*/WETH']],
  //   ]),
  // ],
  // [
  //   ChainId.ARBITRUM_ONE,
  //   new Map([
  //     [TradeType.EXACT_INPUT, ['WETH/USDC', 'USDC/WETH']],
  //     [TradeType.EXACT_OUTPUT, ['*/WETH']],
  //   ]),
  // ],
  // [
  //   ChainId.POLYGON,
  //   new Map([
  //     [TradeType.EXACT_INPUT, ['WETH/USDC', 'USDC/WETH', 'WMATIC/USDC', 'USDC/WMATIC']],
  //     [TradeType.EXACT_OUTPUT, ['*/WMATIC']],
  //   ]),
  // ],
  // [ChainId.CELO, new Map([[TradeType.EXACT_OUTPUT, ['*/CELO']]])],
])
