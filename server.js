const prerender = require('./lib');
let config;

try {
    config = require('/var/prerender/config.js');
} catch (e) {
    console.log('"config.js" not loaded');
    config = {};
}

const CHROME_LOCATION = process.env.CHROME_LOCATION || config.CHROME_LOCATION || '/usr/bin/chromium';
const LOG_REQUESTS = process.env.LOG_REQUESTS || config.LOG_REQUESTS || false;
const PAGE_DONE_CHECK_INTERVAL = process.env.PAGE_DONE_CHECK_INTERVAL || config.PAGE_DONE_CHECK_INTERVAL || 500;
const PAGE_LOAD_TIMEOUT = process.env.PAGE_LOAD_TIMEOUT || config.PAGE_LOAD_TIMEOUT || 20000;
const WAIT_AFTER_LAST_REQUEST = process.env.WAIT_AFTER_LAST_REQUEST || config.WAIT_AFTER_LAST_REQUEST || 500;
const FOLLOW_REDIRECTS = process.env.FOLLOW_REDIRECTS || config.FOLLOW_REDIRECTS || false;
const ENABLE_SERVICE_WORKER = process.env.ENABLE_SERVICE_WORKER || config.ENABLE_SERVICE_WORKER || false;
const PRERENDER_PORT = process.env.PRERENDER_PORT || config.PRERENDER_PORT || 3000;

const PLUGIN_SEND_PRERENDER_HEADER = process.env.PLUGIN_SEND_PRERENDER_HEADER || (config.plugin && config.plugin.sendPrerenderHeader) || true;
const PLUGIN_BLOCK_RESOURCES = process.env.PLUGIN_BLOCK_RESOURCES || (config.plugin && config.plugin.blockResources) || false;
const PLUGIN_REMOVE_SCRIPT_TAGS = process.env.PLUGIN_REMOVE_SCRIPT_TAGS || (config.plugin && config.plugin.removeScriptsTags) || true;
const PLUGIN_HTTP_HEADERS = process.env.PLUGIN_HTTP_HEADERS || (config.plugin && config.plugin.httpHeaders) || true;

const PLUGIN_WHITELIST = process.env.ALLOWED_DOMAINS || (config.plugin && config.plugin.allowedDomains) || false;
const PLUGIN_BLACKLIST = process.env.BLACKLISTED_DOMAINS || (config.plugin && config.plugin.blackListedDomains) || false;

const PLUGIN_AUTH = process.env.PLUGIN_AUTH || (config.plugin && config.plugin.auth) || false;

const server = prerender({
    chromeLocation: CHROME_LOCATION,
    logRequests: JSON.parse(LOG_REQUESTS),
    pageDoneCheckInterval: parseInt(PAGE_DONE_CHECK_INTERVAL),
    pageLoadTimeout: parseInt(PAGE_LOAD_TIMEOUT),
    waitAfterLastRequest: parseInt(WAIT_AFTER_LAST_REQUEST),
    followRedirects: JSON.parse(FOLLOW_REDIRECTS),
    enableServiceWorker: JSON.parse(ENABLE_SERVICE_WORKER),
    port: praseInt(PRERENDER_PORT)
});

if (PLUGIN_SEND_PRERENDER_HEADER) {
    server.use(prerender.sendPrerenderHeader());
}

if (PLUGIN_BLOCK_RESOURCES) {
    server.use(prerender.blockResources());
}

if (PLUGIN_REMOVE_SCRIPT_TAGS) {
    server.use(prerender.removeScriptTags());
}

if (PLUGIN_HTTP_HEADERS) {
    server.use(prerender.httpHeaders());
}

if (PLUGIN_WHITELIST) {
    process.env.ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS || (config.plugin && config.plugin.allowedDomains.join(','));
    server.use(prerender.whitelist());
}

if (PLUGIN_BLACKLIST) {
    process.env.BLACKLISTED_DOMAINS = process.env.BLACKLISTED_DOMAINS || (config.plugin && config.plugins.blacklistedDomains.join(','));
    server.use(prerender.blacklist());
}

if (PLUGIN_AUTH) {
    let login, password;

    if (process.env.PLUGIN_AUTH) {
        [login, password] = process.env.PLUGIN_AUTH.split(',');
    } else {
        ({login, password} = config.plugin.auth);
    }

    process.env.BASIC_AUTH_USERNAME = login;
    process.env.BASIC_AUTH_PASSWORD = password;

    server.use(prerender.basicAuth());
}

server.start();
