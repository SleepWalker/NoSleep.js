/**
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 **/
(function(root) {
    'use strict';

    /**
     * ffmpeg -i 1.png -c:v libx264 -profile:v baseline -level 3.0 -preset slow -crf 51 -s 64x64 -pix_fmt yuv420p -f mp4 1px.mp4
     */
    var mp4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAApVtZGF0AAACcQYF//9t3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0OCByMjY0MyA1YzY1NzA0IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTUgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT11bWggc3VibWU9OCBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTIgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD01MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTUxLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAUZYiEF8mKAAYvvvrrrrrrrrrrrrwAAALtbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAACgAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAhd0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAEAAAABAAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAAoAAAAAAABAAAAAAGPbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAyAAAAAgBVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABOm1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAPpzdGJsAAAAlnN0c2QAAAAAAAAAAQAAAIZhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAEAAQABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAAMGF2Y0MBQsAe/+EAF2dCwB7ZhCbARAAAAwAEAAADAMg8WLmgAQAGaMlgGUsgAAAAGHN0dHMAAAAAAAAAAQAAAAEAAAIAAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAABAAAAAQAAABRzdHN6AAAAAAAAAo0AAAABAAAAFHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU2LjQwLjEwMQ==';

    /**
     * @param {object} options
     * @param {bool} options.disableLocationMethod - do not use location method, even if it is available
     * @param {Promise} options.Promise - Promise constructor
     * @param {function} options.whenLocationChangeAllowed - function, that returns a promise, that fullfilled,
     *                   when we can make the next atempt to call window.stop()
     */
    function NoSleep(options) {
        this.options = options || {};

        /**
         * Wake lock methods detection
         * - video: wake lock by playing tiny video in background
         * - location: wake lock by performing location change and instantly stopping during navigation (iPhone, iOS < 10)
         *
         * The `location` method has a side effect. It may stop currently pending requests (xhr/scripts/images etc).
         * `NoSleep#whenIddle()` method may be used, to synchronize your code requests with wake lock location change method
         */
        this.methods = {
            video: /Android|iPad|iPhone OS 1[0-9]/.test(navigator.userAgent), // androids, iPads, iPhone OS 10+
            location: /iPhone|iP[ao]d/.test(navigator.userAgent)
                && !/CriOS/.test(navigator.userAgent)
                && !/iPhone OS 7/.test(navigator.userAgent) // iPhone 4 does not support any method :(
        };

        this.noSleepTimer = null;

        if (options.disableLocationMethod) {
            this.method.location = false;
        }

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

        if (this.methods.video) {
            // Set up no sleep video element
            this.noSleepVideo = document.createElement('video');
            this.noSleepVideo.setAttribute('loop', '');
            this.noSleepVideo.setAttribute('playsinline', '');
            this.noSleepVideo.src = mp4;
        }

        document.addEventListener('visibilitychange', function() {
            if (!this.noSleepVideo) {
                return;
            }

            if (document.hidden) {
                this.noSleepVideo.pause();
            } else {
                this.noSleepVideo.load();
                this.noSleepVideo.play();
            }
        }.bind(this));
    }

    /**
     * @return {bool} - whether wakeLock is available for current device
     */
    NoSleep.prototype.isAvailable = function() {
        return this.methods.location || this.methods.video;
    };

    /**
     * @return {bool} - whether wakeLock is enabled now
     */
    NoSleep.prototype.isEnabled = function() {
        return this.isAvailable() && this._enabled;
    };

    /**
     * @return {bool} - whether wakeLock will use location method
     */
    NoSleep.prototype.isLocationMethod = function() {
        return this.methods.location && !this.methods.video;
    };

    /**
     * Enable NoSleep instance
     *
     * @param {number} duration
     */
    NoSleep.prototype.enable = function(duration) {
        this.disable();

        this._enabled = this.methods.video || this.methods.location;

        if (this.methods.video) {
            var play = function() {
                if (!this.isEnabled()) {
                    return;
                }

                this.noSleepVideo.play();
            }.bind(this);

            play();

            if (this.noSleepVideo.paused) {
                var initVideo = function() {
                    play();
                    document.removeEventListener('touchstart', initVideo, false);
                };
                document.addEventListener('touchstart', initVideo, false);
            }
        } else if (this.methods.location) {
            var Promise = this.Promise || function(fn) {
                fn(function() {});

                return null;
            };

            var changeLocation = function() {
                this.iddlePromise = this.whenLocationChangeAllowed()
                    .then(function() {
                        if (!this.isEnabled() || document.hidden) {
                            return;
                        }

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

            this.noSleepTimer = setInterval(changeLocation, duration || 20000);
        }
    };

    /**
     * Disable NoSleep instance
     */
    NoSleep.prototype.disable = function() {
        this._enabled = false;

        if (this.noSleepTimer) {
            clearInterval(this.noSleepTimer);
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
            return this.options.whenLocationChangeAllowed();
        }

        return {then: function(fn) {
            return fn();
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
