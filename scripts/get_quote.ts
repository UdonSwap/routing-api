/**
 * ts-node --project=tsconfig.cdk.json scripts/get_quote.ts
 */
import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import { QuoteQueryParams } from '../lib/handlers/quote/schema/quote-schema'
import { QuoteResponse } from '../lib/handlers/schema'
dotenv.config()
;(async function () {
  const quotePost: QuoteQueryParams = {
    tokenInAddress: 'PIX',
    tokenInChainId: 919,
    tokenOutAddress: 'LAMP',
    tokenOutChainId: 919,
    amount: '1',
    type: 'exactIn',
    recipient: '0x60e5E9285Af93ae1aCb00D887f0643107b3B05aa',
    slippageTolerance: '5',
    deadline: '360',
    algorithm: 'alpha',
  }

  const response: AxiosResponse<QuoteResponse> = await axios.post<QuoteResponse>(
    process.env.UDONSWAP_ROUTING_API! + 'quote',
    quotePost
  )

  console.log({ response })
})()
