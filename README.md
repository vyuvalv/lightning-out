# OSS Lightning Web Component

-   Official Documentation - https://lwc.dev/

## How to start?

-   Implementation starts by using `npx create-lwc-app my-app`
-   Take the simple setup route
-   Install dependencies
    _ `npm install @salesforce-ux/design-system --save-dev`
    _ `npm install @lwc/synthetic-shadow --save-dev` \* `npm install lightning-base-components`
-   Setup `lwc-services.config.js`


        <pre>
        resources: [
                { from: `${srcFolder}/resources/`, to: `${buildFolder}/resources/` },
                { from: 'src/index.html', to: 'dist/' },
                { from: 'src/manifest.json', to: 'dist/' },
                {
                from: 'node_modules/@salesforce-ux/design-system/assets',
                to: `${srcFolder}/resources/SLDS`
                },
                {
                from: 'node_modules/@salesforce-ux/design-system/assets',
                to: `${buildFolder}/resources/SLDS`
                }
        ],
        devServer: {
                proxy: { '/': 'http://localhost:3002' }
        }
        </pre>

-   lwc.config.json

          <pre>
                  {
                  "modules": [
                          {
                          "dir": "src/client/modules"
                          },
                          {
                          "npm": "lightning-base-components"
                          }
                  ]
                  }
          </pre>

Or Once repository is cloned to local machine just Run `npm install`

-   Setup your `index.html` references \* `<link rel="stylesheet" type="text/css" href="/resources/SLDS/styles/salesforce-lightning-design-system.min.css" />`

-   Setup your `index.js`

<pre>
        import '@lwc/synthetic-shadow';
        import { createElement } from 'lwc';
        import MyApp from 'my/app';

        const app = createElement('my-app', { is: MyApp });
        // eslint-disable-next-line @lwc/lwc/no-document-query
        document.querySelector('#main').appendChild(app);
</pre>

Start simple by running `yarn watch` (or `npm run watch`, if you set up the project with `npm`). This will start the project with a local development server.
