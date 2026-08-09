import { tsrxReactTurbopack } from '@tsrx/turbopack-plugin-react';

export default tsrxReactTurbopack({
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: new URL('..', import.meta.url).pathname }
});
