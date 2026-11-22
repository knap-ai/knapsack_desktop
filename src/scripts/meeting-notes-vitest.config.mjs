import { mergeConfig } from 'vite'
import base from '../vite.config.ts'
import { publicAssetFixture } from './vitest-public-assets.mjs'
// Used only by the focused test entry. Production builds retain vite.config.ts.
export default async env => mergeConfig(await base(env), {
  plugins: [publicAssetFixture()],
})
