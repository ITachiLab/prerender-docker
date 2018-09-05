module.exports = {
    chromeLocation: '/usr/local/bin/chromium',
    logRequests: true,
    pageDoneCheckInterval: 1500,
    pageLoadTimeout: 10000,
    waitAfterLastRequest: 3000,
    followRedirects: true
    prerenderPort: 3123,
    
    plugin: {
        sendPrerenderHeader: false
        blockResources: true,
        removeScriptTags: false,
        httpHeaders: false
        whiteList: [
            'foo.com',
            'foobar.com',
            'foofoo.net'
        ],
        blackList: [
            'nastysite.com',
            'wedontlikethisguy.net'
        ],
        auth: {
            login: 'mylogin',
            password: 'mypassword'
        }
    }
};