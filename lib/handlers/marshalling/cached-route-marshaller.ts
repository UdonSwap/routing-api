import { CachedRoute } from 'udonswap-smart-order-router-v3'
import { MixedRoute, V2Route, V3Route } from 'udonswap-smart-order-router-v3/build/main/routers'
import { MarshalledRoute, RouteMarshaller } from './route-marshaller'

export interface MarshalledCachedRoute {
  route: MarshalledRoute
  percent: number
}

export class CachedRouteMarshaller {
  public static marshal(cachedRoute: CachedRoute<V3Route | V2Route | MixedRoute>): MarshalledCachedRoute {
    return {
      route: RouteMarshaller.marshal(cachedRoute.route),
      percent: cachedRoute.percent,
    }
  }

  public static unmarshal(marshalledCachedRoute: MarshalledCachedRoute): CachedRoute<V3Route | V2Route | MixedRoute> {
    return new CachedRoute<V3Route | V2Route | MixedRoute>({
      route: RouteMarshaller.unmarshal(marshalledCachedRoute.route),
      percent: marshalledCachedRoute.percent,
    })
  }
}
