# Dockerized Prerender #

This repository contains a Docker-ready project with Prerender.io server. It is created on official [Prerender.io server libraries](https://github.com/prerender/prerender) in version 5.4.4. It has been customized to work with Chromium in version 68 and everything runs on NodeJS 8.

![Docker Build Status](https://img.shields.io/docker/build/cykloheksan/prerender-docker.svg)

## Motive ##

I've created this project, because I couldn't find any working Docker image that will suit my needs. A lot of images still uses PhantomJS as a rendering engine, but as Phantom's author states on his page: "PhantomJS development is suspended until further notice". On the other hand, images with Chromium engine didn't work and were buggy, so I've eventually decided to create my own.

## How to use it ##

This image can be built by yourself for now, but I have a plan to push it to official DockerHub repository. So until then, clone this repository and do the following:

### Build ###

```
docker build -t prerender-docker .
```

### Run ###

When the default configuration is sufficient for you, simply run the container.

```
docker run -d -p 3000:3000 --name prerender-io prerender-docker
```

And that's it! Now your Prerender Server is spawned on port 3000.

## Configuration ##

You can customize your Prerender Server either by environment variables during running, or by modern [Docker config](https://docs.docker.com/engine/swarm/configs/) available in Swarm mode. Remember, that the environment-based configuration has a precedence over configuration files. It's intended, because it's easier to tune a configuration a little by environment variables. You'll typically have a swarm wide configuration for multiple Prerender services and tune some of them through env vars.

### Environment variables ###

#### CHROME_LOCATION ####

Location of Chromium binary. Generally it should not be redefined, unless you have a special needs.

Default: `/usr/bin/chromium`

Example: `-e CHROME_LOCATION='/usr/local/bin/chromium`'

#### LOG_REQUESTS ####

When to log requests to stdout.

Default: `false`

Example: `-e LOG_REQUESTS='true'`

#### PAGE_DONE_CHECK_INTERVAL ####

Number of milliseconds between the interval of checking whether the page is done loading or not.

Default: `500`

Example: `-e PAGE_DONE_CHECK_INTERVAL='1500'`

#### PAGE_LOAD_TIMEOUT ####

Maximum number of milliseconds to wait while downloading the page, waiting for all pending requests/ajax calls to complete before timing out and continuing on.

Default: `20000`

Example: `-e PAGE_LOAD_TIMEOUT='10000'`

#### WAIT_AFTER_LAST_REQUEST ####

Number of milliseconds to wait after the number of requests/ajax calls in flight reaches zero. HTML is pulled off of the page at this point.

Default: `500`

Example: `-e WAIT_AFTER_LAST_REQUEST='3000'`

#### FOLLOW_REDIRECTS ####

Whether Chrome follows a redirect on the first request if a redirect is encountered. Normally, for SEO purposes, you do not want to follow redirects. Instead, you want the Prerender server to return the redirect to the crawlers so they can update their index.

Default: `false`

Example: `-e FOLLOW_REDIRECTS='true'`

#### ENABLE_SERVICE_WORKER ####

Toggles ignoring of service worker for each request.

Default: `false`

Example: `-e ENABLE_SERVICE_WORKER='true'`

#### PRERENDER_PORT ####

Port the Prerender Server should listen on.

Default: `3000`

Example: `-e PRERENDER_PORT='3123'`

#### PLUGIN_SEND_PRERENDER_HEADER ####

Enables plugin that appends `X-Prerender: 1` to request headers.

Default: `true`

Example: `-e PLUGIN_SEND_PRERENDER_HEADER='false'`

#### PLUGIN_BLOCK_RESOURCES ####

Enables plugin that prevent resources from being loaded.

Default: `false`

Example: `-e PLUGIN_BLOCK_RESOURCES='true'`

#### PLUGIN_REMOVE_SCRIPT_TAGS ####

Enables plugin that removes scripts from requested page.

Default: `true`

Example: `-e PLUGIN_REMOVE_SCRIPT_TAGS='false'`

#### PLUGIN_HTTP_HEADERS ####

Enables plugin that lets you set custom headers and status code that will be sent to the client requesting a page rendering.

If your Javascript routing has a catch-all for things like 404's, you can tell the prerender service to serve a 404 to google instead of a 200. This way, google won't index your 404's.

Add these tags in the <head> of your page if you want to serve soft http headers. Note: Prerender will still send the HTML of the page. This just modifies the status code and headers being sent.

Example: telling prerender to server this page as a 404

```html
<meta name="prerender-status-code" content="404">
```

Example: telling prerender to serve this page as a 302 redirect

```html
<meta name="prerender-status-code" content="302">
<meta name="prerender-header" content="Location: https://www.google.com">
```

Default: `true`

Example: `-e PLUGIN_HTTP_HEADERS='false'`

#### PLUGIN_WHITELIST ####

Enables plugin that will allow requests to a certain domain, use this plugin to cause a 404 for any other domains.

Default: `false`

Example: `-e PLUGIN_WHITELIST='foo.com,foobar.com,foofoo.net'`

#### PLUGIN_BLACKLIST ####

Enables plugin that will disallow requests to a certain domain, use this plugin to cause a 404 for the domains.

Default: `false`

Example: `-e PLUGIN_BLACKLIST='nastysite.com,wedontlikethisguy.net'`

#### PLUGIN_AUTH ####

Enables plugin that will allow access to your Prerender server from authorized parties. This is the simplest, basic HTTP authentication.

Default: `false`

Example: `-e PLUGIN_AUTH='mylogin,mypassword'`

#### Example usage with options and plugins ####

```
docker run -p 3000:3123 -e PLUGIN_BLACKLIST='example.com' -e PLUGIN_AUTH='mylogin,mypassword' -e PRERENDER_PORT='3123' prerender-docker
```

And it simply works as it should.

### Configuration file ###

In order to configure Prerender Server through a configuration file, it has to be placed in: `/var/prerender` container directory and named `config.js`. This kind of configuration is mainly used in Swarm mode, when one can define configuration that is copied to services thereafter.

`config.js` has to be structured like NodeJS module file. Remember, that you are not required to define every option, the below configuration has them all, so you can see how to write your own.

```javascript
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
```

If you really, really want to use the configuration file outside the Swarm mode, you can bind mount this file as well.

```
docker run -p 3000:3123 -v /path/to/config.js:/var/prerender/config.js prerender-docker
```
