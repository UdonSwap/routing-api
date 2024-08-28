import { ChainId, Currency, CurrencyAmount } from 'lampros-core'
import { SwapOptions, SwapOptionsSwapRouter02, SwapOptionsUniversalRouter, SwapType } from 'lampros-sor'
import JSBI from 'jsbi'
import { TradeTypeParam } from './schema/quote-schema'
import { computePortionAmount, parseDeadline, parseSlippageTolerance, populateFeeOptions } from '../shared'
import { PermitSingle } from '@uniswap/permit2-sdk'
import { UNIVERSAL_ROUTER_ADDRESS } from 'lampros-universal'
import { utils } from 'ethers'
// import { log } from 'co/nsole'

export type SwapOptionsUniversalRouterInput = {
  chainId: ChainId
  currencyIn: Currency
  currencyOut: Currency
  tradeType: TradeTypeParam
  amountRaw: string
  slippageTolerance?: string
  enableUniversalRouter?: boolean
  portionBips?: number
  portionRecipient?: string
  portionAmount?: string
  deadline?: string
  recipient?: string
  permitSignature?: string
  permitNonce?: string
  permitExpiration?: string
  permitAmount?: string
  permitSigDeadline?: string
  simulateFromAddress?: string
}

export type SwapOptionsSwapRouter02Input = {
  slippageTolerance?: string
  deadline?: string
  recipient?: string
  permitSignature?: string
  permitNonce?: string
  permitExpiration?: string
  permitAmount?: string
  permitSigDeadline?: string
  simulateFromAddress?: string
}

export type SwapOptionsInput = SwapOptionsUniversalRouterInput & SwapOptionsSwapRouter02Input

export class SwapOptionsFactory {
  static assemble({
    chainId,
    currencyIn,
    currencyOut,
    tradeType,
    amountRaw,
    slippageTolerance,
    enableUniversalRouter,
    portionBips,
    portionRecipient,
    portionAmount,
    deadline,
    recipient,
    permitSignature,
    permitNonce,
    permitExpiration,
    permitAmount,
    permitSigDeadline,
    simulateFromAddress,
  }: SwapOptionsInput): SwapOptions | undefined {
    console.log('SwapOptionsFactory.assemble called with:', {
      chainId,
      currencyIn: currencyIn.symbol,
      currencyOut: currencyOut.symbol,
      tradeType,
      amountRaw,
      slippageTolerance,
      enableUniversalRouter,
      portionBips,
      portionRecipient,
      portionAmount,
    });
    
    if (enableUniversalRouter) {
      return SwapOptionsFactory.createUniversalRouterOptions({
        chainId,
        currencyIn,
        currencyOut,
        tradeType,
        slippageTolerance,
        portionBips,
        portionRecipient,
        portionAmount,
        amountRaw,
        deadline,
        recipient,
        permitSignature,
        permitNonce,
        permitExpiration,
        permitAmount,
        permitSigDeadline,
        simulateFromAddress,
      })
    } else {
      return SwapOptionsFactory.createSwapRouter02Options({
        slippageTolerance,
        deadline,
        recipient,
        permitSignature,
        permitNonce,
        permitExpiration,
        permitAmount,
        permitSigDeadline,
        simulateFromAddress,
      })
    }
  }

  static createUniversalRouterOptions({
    chainId,
    currencyIn,
    currencyOut,
    tradeType,
    slippageTolerance,
    portionBips,
    portionRecipient,
    portionAmount,
    amountRaw,
    deadline,
    recipient,
    permitSignature,
    permitNonce,
    permitExpiration,
    permitAmount,
    permitSigDeadline,
    simulateFromAddress,
  }: SwapOptionsUniversalRouterInput): SwapOptionsUniversalRouter | undefined {
    console.log("Entered into createUniversalRouterOptions...");
    console.log("slippage Tolerance : ", slippageTolerance);
        
    if (!slippageTolerance) {
      return undefined
    }

    console.log("portionBips in UniversalRouterOptions : ", portionBips);
    const currencyAmount = CurrencyAmount.fromRawAmount(currencyOut, JSBI.BigInt(amountRaw));
    console.log("compute portion amount params: ", currencyAmount.toExact());

    const computedPortionAmount = computePortionAmount(currencyAmount, portionBips);
    console.log("Computed portion amount: ", computedPortionAmount);

    const allFeeOptions = populateFeeOptions(
      tradeType,
      portionBips,
      portionRecipient,
      portionAmount ?? computedPortionAmount
    )

    console.log("Log of the allFeeOption", allFeeOptions)

    const swapParams: SwapOptions = {
      type: SwapType.UNIVERSAL_ROUTER,
      deadlineOrPreviousBlockhash: deadline ? parseDeadline(deadline) : undefined,
      recipient: recipient,
      slippageTolerance: parseSlippageTolerance(slippageTolerance),
      ...allFeeOptions,
    }

    console.log("Swap Params 1 : ", swapParams);
    

    if (permitSignature && permitNonce && permitExpiration && permitAmount && permitSigDeadline) {
      const permit: PermitSingle = {
        details: {
          token: currencyIn.wrapped.address,
          amount: permitAmount,
          expiration: permitExpiration,
          nonce: permitNonce,
        },
        spender: UNIVERSAL_ROUTER_ADDRESS(chainId),
        sigDeadline: permitSigDeadline,
      }

      swapParams.inputTokenPermit = {
        ...permit,
        signature: permitSignature,
      }
    }

    console.log("Swap Params 2 : ", swapParams);

    if (simulateFromAddress) {
      swapParams.simulate = { fromAddress: simulateFromAddress }
    }

    console.log("Swap Params 3 : ", swapParams);
    return swapParams
  }

  static createSwapRouter02Options({
    slippageTolerance,
    deadline,
    recipient,
    permitSignature,
    permitNonce,
    permitExpiration,
    permitAmount,
    permitSigDeadline,
    simulateFromAddress,
  }: SwapOptionsSwapRouter02Input): SwapOptionsSwapRouter02 | undefined {
    if (!slippageTolerance) {
      return undefined
    }

    let swapParams: SwapOptions | undefined = undefined

    if (deadline && recipient) {
      swapParams = {
        type: SwapType.SWAP_ROUTER_02,
        deadline: parseDeadline(deadline),
        recipient: recipient,
        slippageTolerance: parseSlippageTolerance(slippageTolerance),
      }
    }

    if (permitSignature && ((permitNonce && permitExpiration) || (permitAmount && permitSigDeadline))) {
      const { v, r, s } = utils.splitSignature(permitSignature)

      if (swapParams) {
        swapParams.inputTokenPermit = {
          v: v as 0 | 1 | 27 | 28,
          r,
          s,
          ...(permitNonce && permitExpiration
            ? { nonce: permitNonce!, expiry: permitExpiration! }
            : { amount: permitAmount!, deadline: permitSigDeadline! }),
        }
      }
    }

    if (simulateFromAddress) {
      if (swapParams) {
        swapParams.simulate = { fromAddress: simulateFromAddress }
      }
    }
    return swapParams
  }
}
