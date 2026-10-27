const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'TopicSubscriptionModule.android.js'
);

if (fs.existsSync(targetPath)) {
  const content = `import { requireOptionalNativeModule } from 'expo';

const fallback = {
  addListener: () => {},
  removeListeners: () => {},
  subscribeToTopicAsync: () => Promise.resolve(null),
  unsubscribeFromTopicAsync: () => Promise.resolve(null),
};

let nativeModule = null;
try {
  nativeModule = typeof requireOptionalNativeModule === 'function'
    ? requireOptionalNativeModule('ExpoTopicSubscriptionModule')
    : null;
} catch (e) {
  nativeModule = null;
}

export default nativeModule || fallback;
`;
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log('[patch] Patched expo-notifications TopicSubscriptionModule for Expo Go Android compatibility.');
}
