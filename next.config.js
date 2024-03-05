const path = require("path");
const withPlugins = require("next-compose-plugins");
const withPWA = require("next-pwa");
const runtimeCaching = require("next-pwa/cache");
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: process.env.ANALYZE === "true",
// });
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    forceSwcTransforms: true,
  },
  env: {
    Debug_HOST: process.env.Debug_HOST,
    API_HOST: process.env.API_HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    DBName: process.env.DBName,
    SECRET: process.env.SECRET,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    API_HOST: process.env.API_HOST,
    DATABASE_URL: process.env.DATABASE_URL,
    DBName: process.env.DBName,
    SECRET: process.env.SECRET, // Pass through env variables
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: "/static",
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    resolve: {
      fallback: {
        fs: "empty";
        tls: "empty";
        net: "empty";
      }
    }
    // modify the `config` here
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/:path*",
      },
      {
        source: "/about-us",
        destination: "/about",
      },
      // Path Matching - will match `/post/a` but not `/post/a/b`
      {
        source: "/post/:slug",
        destination: "/blog/:slug",
      },
    ];
  },
};
//module.exports = withBundleAnalyzer(nextConfig);
module.exports = withPlugins(
  [
    // withBundleAnalyzer,
    [
      withPWA,
      {
        pwa: {
          disable: true,
          dest: "public",
          // runtimeCaching,
          // disable: process.env.NODE_ENV === 'development',
          // register: true,
          // scope: '/',
          // sw: 'service-worker.js',
          // dynamicStartUrlRedirect: '/login'  // recommend to config this for best user experience if your start-url redirects on first load
          runtimeCaching: [
            {
              urlPattern: /.*?_next?.*/, // Next js Files
              handler: "NetworkFirst",
              options: {
                cacheName: "Next-js",
                expiration: {
                  maxEntries: 1,
                  maxAgeSeconds: 6 * 60 * 60, // 6 hour
                  purgeOnQuotaError: true,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /.*\.(?:js|css)?.*/, // Cache CSS & JS files
              handler: "NetworkFirst",
              options: {
                cacheName: "js-css",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 24 * 60 * 60, // 1 day
                  // maxAgeSeconds: 60, // 60 second
                  purgeOnQuotaError: true,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /.*\.(?:png|jpg|jpeg|svg|gif|webp)/, // Cache Image files
              handler: "NetworkFirst",
              options: {
                cacheName: "image-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 1 * 24 * 60 * 60, // 1 week
                  purgeOnQuotaError: true,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      },
    ],
  ],
  nextConfig
);