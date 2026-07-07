module.exports = {
  apps: [{
    name: 'ngo-website',
    script: 'dist/index.js',
    cwd: '/var/www/ngo-website',
    env: {
      NODE_ENV: 'production',
      PORT: '3000'
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
};