(function () {
    'use strict';

    angular
        .module('flairbiApp')
        .factory('Toastr', Toastr);

    Toastr.$inject = [];
    function Toastr() {
        var service = {
            success: success,
            info: info,
            warning: warning,
            error: error

        };

        return service;

        ////////////////
        function success(info) {
            toastr.success(info.text, info.title);
        }

        function info(info) {
            toastr.info(info.title);
        }

        function warning(info) {
            toastr.warning(info.text, info.title);
        }

        function error(info) {
            var toastrBody = _.isArray(info.text) ?
                _buildToastrBody(info.text) :
                info.text;
            toastr.error(toastrBody, info.title);
        }

        function _buildToastrBody(infoText) {
            var toastrBody = '';
            infoText.forEach(function (item, _) {
                toastrBody = toastrBody + item + "<br>";
            });
            return toastrBody;
        }
    }
})();