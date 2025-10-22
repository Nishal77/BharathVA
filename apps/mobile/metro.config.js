// Metro configuration for pnpm workspaces / monorepos with NativeWind support
// Ensures symlinked modules (like those installed via pnpm) resolve correctly.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../../');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so changes are picked up
config.watchFolders = [workspaceRoot];

// Enable symlink resolution for pnpm
config.resolver.unstable_enableSymlinks = true;

// Ensure Metro looks in both app and workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });