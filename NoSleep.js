/**
 * NoSleep.js v0.5.0 - git.io/vfn01
 * Rich Tibbett
 * MIT license
 **/
(function(root) {
    'use strict';

    // UA matching
    var noSleep = {
        video: /Android/i.test(navigator.userAgent),
        location: /iPhone|iP[oa]d/.test(navigator.userAgent),
        noSupport: /CriOS|IEMobile|BlackBerry|BB10/i.test(navigator.userAgent)
    };

    var media = {
        webm: 'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=',
        mp4: 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw=='
    };

    function addSourceToVideo(element, type, dataURI) {
        var source = document.createElement('source');
        source.src = dataURI;
        source.type = 'video/' + type;
        element.appendChild(source);
    }

    // NoSleep instance constructor
    var NoSleep = function() {
        if (noSleep.noSupport) {
            return;
        }

        if (noSleep.location) {
            this.noSleepTimer = null;
        } else if (noSleep.video) {
            // Set up no sleep video element
            this.noSleepVideo = document.createElement('video');
            this.noSleepVideo.setAttribute('loop', '');

            // Append nosleep video sources
            addSourceToVideo(this.noSleepVideo, 'webm', media.webm);
            addSourceToVideo(this.noSleepVideo, 'mp4', media.mp4);
        }
    };

    // Enable NoSleep instance
    NoSleep.prototype.enable = function(duration) {
        if (noSleep.noSupport) {
            return this;
        }

        if (noSleep.location) {
            this.disable();
            this.noSleepTimer = setInterval(function() {
                if (!document.hidden) {
                    window.location.href = window.location.href;
                    setTimeout(window.stop, 0);
                }
            }, duration || 15000);
        } else if (noSleep.video) {
            this.noSleepVideo.play();
        }
    };

    // Disable NoSleep instance
    NoSleep.prototype.disable = function() {
        if (noSleep.noSupport) {
            return this;
        }

        if (noSleep.location) {
            if (this.noSleepTimer) {
                clearInterval(this.noSleepTimer);
                this.noSleepTimer = null;
            }
        } else if (noSleep.video) {
            this.noSleepVideo.pause();
        }
    };

    // Append NoSleep API to root object
    root.NoSleep = NoSleep;
}(this));
