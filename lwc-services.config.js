/* eslint-disable no-undef */
// lwc -services defintion
const srcFolder = 'src/client';
const buildFolder = './src/dist';

module.exports = {
    buildDir: `${buildFolder}`,
    sourceDir: `./${srcFolder}`,

    resources: [
        {
            from: 'node_modules/@salesforce-ux/design-system/assets',
            to: `${srcFolder}/resources/assets`
        },
        {
            from: 'node_modules/@salesforce-ux/design-system/assets',
            to: `src/dist/resources/assets`
        },
        {
            from: 'src/client/resources',
            to: 'src/dist/resources/'
        }
    ],
    devServer: { proxy: { '/': 'http://localhost:3002' } }
    //     proxy: '/',
    //     port: 3001,
    //     host: 'localhost'
    // }
    //     open: false,
    //     stats: 'errors-only',
    //     noInfo: true,
    //     contentBase: './src/client'
    // },
    // server: {
    //     port: 3002,
    //     host: 'localhost',
    //     open: false,
    //     customConfig: './src/server/main.js'
    // },
};
