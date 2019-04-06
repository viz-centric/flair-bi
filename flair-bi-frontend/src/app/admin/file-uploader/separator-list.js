import * as angular from 'angular';
"use strict";

angular
    .module("flairbiApp")
    .constant("separatorList",
        { "|": "Pipe", ",": "Comma", ":": "Colon", ";": "Semi-Colon" }
    );