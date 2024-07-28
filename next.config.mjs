import { createRequire } from 'module';
const require = createRequire(import.meta.url);
/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,

  // webpack: (config, { isServer, buildId, dev, webpack }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       stream: require.resolve('stream-browserify'),
  //       crypto: require.resolve('crypto-browserify'),
  //     };

  //     config.plugins.push(
  //       new webpack.ProvidePlugin({
  //         process: 'process/browser',
  //       }),
  //       new webpack.NormalModuleReplacementPlugin(
  //         /node:crypto/,
  //         (resource) => {
  //           resource.request = resource.request.replace(/^node:/, '');
  //         }
  //       ),
  //       // new webpack.NormalModuleReplacementPlugin(
  //       //   /node:fs/,
  //       //   (resource) => {
  //       //     resource.request = resource.request.replace(/^node:/, '');
  //       //   }
  //       // ),
  //       new webpack.NormalModuleReplacementPlugin(
  //         /node:path/,
  //         (resource) => {
  //           resource.request = resource.request.replace(/^node:/, '');
  //         }
  //       ),
  //     );
  //   }
  //   return config;
  // },
};

export default nextConfig;