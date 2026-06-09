/** @type {import('pm2').StartOptions[]} */
module.exports = {
  apps: [
    {
      name: 'ui-app-apisrv',
      cwd: process.env.DEPLOY_DIR || '/opt/ui-app/apisrv',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
