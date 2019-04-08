import angular from 'angular';
import leaflet from "leaflet";
'use strict';

angular
    .module('flairbiApp')
    .constant('d3', d3)
    .constant('topojson', topojson)
    .constant('leaflet', leaflet);

