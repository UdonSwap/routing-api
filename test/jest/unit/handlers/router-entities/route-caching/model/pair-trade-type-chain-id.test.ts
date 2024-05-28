import { PairTradeTypeChainId } from '../../../../../../../lib/handlers/router-entities/route-caching'
import { ChainId, TradeType } from 'udonswap-core'
import { describe, it, expect } from '@jest/globals'

describe('PairTradeTypeChainId', () => {
  const PIX = '0x4Bd692dbA81074BC2FA9abDcffE7324680d7A1c1'
  const LAMP = '0xF7ca2401709BC01Eba07d46c8d59e865C983e1AC'

  describe('toString', () => {
    it('returns a stringified version of the object', () => {
      const pairTradeTypeChainId = new PairTradeTypeChainId({
        tokenIn: PIX,
        tokenOut: LAMP,
        tradeType: TradeType.EXACT_INPUT,
        chainId: ChainId.MODE,
      })

      expect(pairTradeTypeChainId.toString()).toBe(
        `${PIX.toLowerCase()}/${LAMP.toLowerCase()}/${TradeType.EXACT_INPUT}/${ChainId.MODE}`
      )
    })

    it('token addresses are converted to lowercase', () => {
      const pairTradeTypeChainId = new PairTradeTypeChainId({
        tokenIn: PIX.toUpperCase(),
        tokenOut: LAMP.toUpperCase(),
        tradeType: TradeType.EXACT_INPUT,
        chainId: ChainId.MODE,
      })

      expect(pairTradeTypeChainId.toString()).toBe(
        `${PIX.toLowerCase()}/${LAMP.toLowerCase()}/${TradeType.EXACT_INPUT}/${ChainId.MODE}`
      )
    })

    it('works with ExactOutput too', () => {
      const pairTradeTypeChainId = new PairTradeTypeChainId({
        tokenIn: PIX.toUpperCase(),
        tokenOut: LAMP.toUpperCase(),
        tradeType: TradeType.EXACT_OUTPUT,
        chainId: ChainId.MODE,
      })

      expect(pairTradeTypeChainId.toString()).toBe(
        `${PIX.toLowerCase()}/${LAMP.toLowerCase()}/${TradeType.EXACT_OUTPUT}/${ChainId.MODE}`
      )
    })

    // it('works with other chains', () => {
    //   const pairTradeTypeChainId = new PairTradeTypeChainId({
    //     tokenIn: PIX.toUpperCase(),
    //     tokenOut: LAMP.toUpperCase(),
    //     tradeType: TradeType.EXACT_OUTPUT,
    //     chainId: ChainId.ARBITRUM_ONE,
    //   })

    //   expect(pairTradeTypeChainId.toString()).toBe(
    //     `${PIX.toLowerCase()}/${LAMP.toLowerCase()}/${TradeType.EXACT_OUTPUT}/${ChainId.ARBITRUM_ONE}`
    //   )
    // })
  })
})
