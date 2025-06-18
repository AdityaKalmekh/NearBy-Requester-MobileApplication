// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       ["module:react-native-dotenv", {
//         "moduleName": "@env",
//         "path": `.env.${process.env.APP_ENV || 'development'}`,
//         "safe": true,
//         "allowUndefined": false
//       }]
//     ]
//   };
// };

// module.exports = function (api) {
//   api.cache(true);
  
//   // Get the environment variable
//   const appEnv = process.env.APP_ENV || 'development';
  
//   // Determine which .env file to load
//   let envFile;
//   switch (appEnv) {
//     case 'production':
//       envFile = '.env.production';
//       break;
//     case 'preview':
//       envFile = '.env.staging';
//       break;
//     default:
//       envFile = '.env.development';
//   }

//   console.log('🔥 Babel: APP_ENV =', appEnv);
//   console.log('🔥 Babel: Loading env file =', envFile);

//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'module:react-native-dotenv',
//         {
//           envName: 'APP_ENV',
//           moduleName: '@env',
//           path: envFile,
//           blocklist: null,
//           allowlist: null,
//           safe: false,
//           allowUndefined: true,
//           verbose: true,
//         },
//       ],
//     ],
//   };
// };