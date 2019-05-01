import angular from 'angular';
import leaflet from "leaflet";
import Chartjs from 'chart.js';
import toastr from 'toastr';

'use strict';

angular
    .module('flairbiApp')
    .constant('d3', d3)
    .constant('topojson', topojson)
    .constant('leaflet', leaflet)
    .constant('Chartjs', Chartjs)
    .constant('toastr', toastr);

