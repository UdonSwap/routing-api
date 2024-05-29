import { GasPrice, IGasPriceProvider } from 'udonswap-smart-order-router-v3'
import { BigNumber } from 'ethers'

export class StaticGasPriceProvider implements IGasPriceProvider {
  constructor(private gasPriceWei: BigNumber) {}
  async getGasPrice(): Promise<GasPrice> {
    return { gasPriceWei: this.gasPriceWei }
  }
}
