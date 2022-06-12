module.exports = {
  apps: [{
    name: "whatsapp-api",
    script: "./dist/server.js",
  }, {
    name: 'whatsapp-worker',
    script: './dist/whatsapp/index.js',
  }]
}