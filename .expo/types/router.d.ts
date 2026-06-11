/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)` | `/(auth)/login` | `/(auth)/onboard-identity` | `/(auth)/onboard-paywall` | `/(auth)/splash` | `/(tabs)` | `/(tabs)/` | `/(tabs)/analytics` | `/(tabs)/profile` | `/(tabs)/store` | `/_sitemap` | `/analytics` | `/login` | `/onboard-identity` | `/onboard-paywall` | `/profile` | `/splash` | `/store`;
      DynamicRoutes: `/card/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/card/[id]`;
    }
  }
}
