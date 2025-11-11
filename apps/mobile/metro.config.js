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

// Add specific resolution for problematic packages
config.resolver.alias = {
  'react-native-css-interop': path.resolve(workspaceRoot, 'node_modules/react-native-css-interop'),
  'nativewind': path.resolve(workspaceRoot, 'node_modules/nativewind'),
  '@expo/vector-icons': path.resolve(workspaceRoot, 'node_modules/@expo/vector-icons'),
  'lucide-react-native': path.resolve(workspaceRoot, 'node_modules/lucide-react-native'),
  '@react-native-community/datetimepicker': path.resolve(workspaceRoot, 'node_modules/@react-native-community/datetimepicker'),
};

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = withNativeWind(config, { input: './global.css' });