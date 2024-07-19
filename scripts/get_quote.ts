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
    tokenInAddress: '0x4200000000000000000000000000000000000006',
    tokenInChainId: 919,
    tokenOutAddress: '0xcca991e1bdca2846640d366116d60bc25c2815db',
    tokenOutChainId: 919,
    amount: '50',
    type: 'exactIn',
    recipient: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    slippageTolerance: '5',
    deadline: '360',
    algorithm: 'alpha',
  }

  const response: AxiosResponse<QuoteResponse> = await axios.post<QuoteResponse>(
    process.env.UNISWAP_ROUTING_API! + 'quote',
    quotePost
  )

  console.log({ response })
})()
