/** @type {import('next').NextConfig} */
const webpack = require('webpack')

const nextConfig = {
  webpack: (config, options) => {
    const plugins = [
      ...config.plugins,
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '')
      })
    ]
    return { ...config, plugins }
  }
}

module.exports = nextConfig