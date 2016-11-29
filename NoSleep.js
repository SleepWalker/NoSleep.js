/**
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 **/
(function(root) {
    'use strict';

    // UA matching
    var noSleep = {
        video: /Android|iPad|iPhone OS 1[0-9]/.test(navigator.userAgent), // androids, iPads, iPhone OS 10+
        location: /iPhone|iP[ao]d/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent)
    };

    var mp4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMXbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAAFQAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAkF0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAAFQAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAQAAAAEAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAABUAAAAAAABAAAAAAG5bWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAwAAAABABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABZG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAASRzdGJsAAAApHN0c2QAAAAAAAAAAQAAAJRhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAQABABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAALmF2Y0MBQsAK/+EAFmdCwArZH558BEAAAAMAQAAADAPEiZIBAAVoy4FyyAAAABBwYXNwAAAAAQAAAAEAAAAYc3R0cwAAAAAAAAABAAAAAgAAAgAAAAAUc3RzcwAAAAAAAAABAAAAAQAAABxzdHNjAAAAAAAAAAEAAAABAAAAAgAAAAEAAAAcc3RzegAAAAAAAAAAAAAAAgAAAnMAAAAOAAAAFHN0Y28AAAAAAAAAAQAAA0cAAABidWR0YQAAAFptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAC1pbHN0AAAAJal0b28AAAAdZGF0YQAAAAEAAAAATGF2ZjU3LjU3LjEwMAAAAAhmcmVlAAACiW1kYXQAAAJhBgX//13cRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTQ4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNiAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MzAga2V5aW50X21pbj0zIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9MzAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMS4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAACmWIhBvJigACdhgAAAAKQYiIK8mKAALC+A==';

    // NoSleep instance constructor
    var NoSleep = function() {
        this.noSleepTimer = null;

        if (noSleep.video) {
            // Set up no sleep video element
            this.noSleepVideo = document.createElement('video');
            this.noSleepVideo.setAttribute('loop', '');
            this.noSleepVideo.setAttribute('playsinline', '');
            this.noSleepVideo.src = mp4;
        }
    };

    // Enable NoSleep instance
    NoSleep.prototype.enable = function(duration) {
        this.disable();

        if (noSleep.video) {
            var playPause = function() {
                // play-pause, to reduce CPU load
                this.play();
                setTimeout(this.pause.bind(this), 100);
            }.bind(this.noSleepVideo);

            playPause();

            this.noSleepTimer = setInterval(playPause, duration || 10000);
        } else if (noSleep.location) {
            this.noSleepTimer = setInterval(function() {
                if (!document.hidden) {
                    window.location.href = window.location.href;
                    setTimeout(window.stop, 0);
                }
            }, duration || 30000);
        }
    };

    // Disable NoSleep instance
    NoSleep.prototype.disable = function() {
        if (this.noSleepTimer) {
            clearInterval(this.noSleepTimer);
            this.noSleepTimer = null;
        }

        if (this.noSleepVideo && !this.noSleepVideo) {
            this.noSleepVideo.pause();
        }
    };

    root.NoSleep = NoSleep;
}(this));
