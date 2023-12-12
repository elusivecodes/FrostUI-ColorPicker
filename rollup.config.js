'use strict';

import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
    input: 'src/js/wrapper.js',
    output: {
        file: 'dist/frost-ui-colorpicker.js',
        format: 'umd',
        globals: {
            '@fr0st/color': 'Color',
            '@fr0st/query': 'fQuery',
            '@fr0st/ui': 'UI',
        },
        name: 'UI',
        sourcemap: true,
        extend: true,
    },
    external: [
        '@fr0st/color',
        '@fr0st/query',
        '@fr0st/ui',
    ],
    plugins: [nodeResolve()],
};
