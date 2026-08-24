export default {
  apps: [{
    name: "guardix",
    script: "./src/server.js",
    exec_mode: "fork",   
    instances: 1,         
    autorestart: true,
    watch: false
  }]
}