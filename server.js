const prerender = require('prerender');
const server = prerender({
    chromeLocation: '/usr/bin/chromium'
});
server.start();
