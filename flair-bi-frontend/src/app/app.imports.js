import angular from 'angular';
import leaflet from "leaflet";
import Chartjs from 'chart.js';

'use strict';

angular
    .module('flairbiApp')
    .constant('d3', d3)
    .constant('topojson', topojson)
    .constant('leaflet', leaflet)
    .constant('Chartjs', Chartjs);

