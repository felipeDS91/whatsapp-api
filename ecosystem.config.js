module.exports = {
  apps: [{
    name: "whatsapp-api",
    script: "./dist/server.js",
    restart_delay: 30000,
  }, {
    name: 'whatsapp-worker',
    script: './dist/whatsapp/index.js',
    restart_delay: 30000,
  }]
}