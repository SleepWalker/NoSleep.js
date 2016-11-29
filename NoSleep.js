/**
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 **/
(function(root) {
    'use strict';

    /**
     * Feature detection
     * - video: wake lock by playing tiny video in background
     * - location: wake lock by performing location change and instantly stopping during navigation (iPhone, iOS < 10)
     *
     * The `location` method has a side effect. It may stop currently pending requests (xhr/scripts/images etc).
     * `NoSleep#whenIddle()` method may be used, to synchronize your code requests with wake lock location change method
     */
    var noSleep = {
        video: /Android|iPad|iPhone OS 1[0-9]/.test(navigator.userAgent), // androids, iPads, iPhone OS 10+
        location: /iPhone|iP[ao]d/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent)
    };

    var mp4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMXbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAAFQAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAkF0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAFQAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAQAAAAEAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAABUAAAAAAABAAAAAAG5bWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAABABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABZG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAASRzdGJsAAAApHN0c2QAAAAAAAAAAQAAAJRhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAQABABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAALmF2Y0MBQsAK/+EAFmdCwArZH558BEAAAAMAQAAADAPEiZIBAAVoy4FyyAAAABBwYXNwAAAAAQAAAAEAAAAYc3R0cwAAAAAAAAABAAAAAgAAAgAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAgAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAnMAAAAOAAAAFHN0Y28AAAAAAAAAAQAAA0cAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjU3LjEwMAAAAAhmcmVlAAACiW1kYXQAAAJhBgX//13cRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTQ4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNiAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MzAga2V5aW50X21pbj0zIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9MzAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMS4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAACmWIhBvJigACdhgAAAAKQYiIK8mKAALC+A==';

    /**
     * @param {object} options
     * @param {Promise} options.Promise - Promise constructor
     * @param {function} options.whenLocationChangeAllowed - function, that returns a promise, that fullfilled,
     *                   when we can make the next atempt to call window.stop()
     */
    function NoSleep(options) {
        this.options = options || {};

        this.noSleepTimer = null;

        if (this.options.Promise) {
            this.Promise = this.options.Promise;
        } else if (window.Promise) {
            this.Promise = window.Promise;
        }

        if (typeof this.options.whenLocationChangeAllowed !== 'undefined') {
            if (!this.Promise) {
                throw new Error('Promise constructor required for whenLocationChangeAllowed');
            }
        }

        if (noSleep.video) {
            // Set up no sleep video element
            this.noSleepVideo = document.createElement('video');
            this.noSleepVideo.setAttribute('loop', '');
            this.noSleepVideo.setAttribute('playsinline', '');
            this.noSleepVideo.src = mp4;
        }
    }

    /**
     * Enable NoSleep instance
     *
     * @param {number} duration
     */
    NoSleep.prototype.enable = function(duration) {
        this.disable();

        if (noSleep.video) {
            var playPause = function() {
                this.noSleepTimer = setTimeout(playPause, duration || 10000);

                // play-pause, to reduce CPU load
                this.play();
                setTimeout(this.pause.bind(this), 100);
            }.bind(this.noSleepVideo);

            playPause();
        } else if (noSleep.location) {
            var Promise = this.Promise || function(fn) {
                fn(function() {});

                return null;
            };

            var changeLocation = function() {
                this.iddlePromise = this.whenLocationChangeAllowed()
                    .then(function() {
                        this.noSleepTimer = setTimeout(changeLocation, duration || 30000); // for apple devices 30sec frequency is enough

                        return new Promise(function(resolve) {
                            window.location.href = window.location.href;

                            setTimeout(function() {
                                window.stop();
                                resolve();
                                this.iddlePromise = null;
                            }.bind(this), 0);
                        }.bind(this));
                    }.bind(this), function() {
                        return Promise.resolve();
                    });
            }.bind(this);

            this.noSleepTimer = setTimeout(changeLocation, duration || 30000);
        }
    };

    /**
     * Disable NoSleep instance
     */
    NoSleep.prototype.disable = function() {
        if (this.noSleepTimer) {
            clearTimeout(this.noSleepTimer);
            this.noSleepTimer = null;
        }

        if (this.noSleepVideo && !this.noSleepVideo) {
            this.noSleepVideo.pause();
        }
    };

    /**
     * @return {Promise}
     */
    NoSleep.prototype.whenLocationChangeAllowed = function() {
        if (this.options.whenLocationChangeAllowed) {
            return this.options.whenLocationChangeAllowed()
                .then(function() {
                    return Promise[document.hidden ? 'reject' : 'resolve']();
                });
        }

        return {then: function(fn) {
            if (!document.hidden) {
                return fn();
            }

            return null;
        }};
    };

    /**
     * @return {Promise}
     */
    NoSleep.prototype.whenIddle = function() {
        if (!this.Promise) {
            throw new Error('No Promise constructor specified. See options.Promise');
        }

        if (this.iddlePromise) {
            return this.iddlePromise;
        }

        return this.Promise.resolve();
    };

    root.NoSleep = NoSleep;
}(this));
