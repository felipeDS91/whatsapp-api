module.exports = {
  apps: [{
    name: "whatsapp-api",
    script: "./dist/server.js",
    watch: true,
  }, {
    name: 'whatsapp-worker',
    script: './dist/whatsapp/index.js',
    watch: true,
  }]
}