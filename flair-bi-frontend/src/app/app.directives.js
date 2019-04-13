import angular from 'angular';

angular
    .module("flairbiApp")
    .directive("colorpicker", colorpicker)
    .directive("icheck", iCheck);

iCheck.$inject = ["$timeout", "$parse"];

function colorpicker() {
    return {
        restrict: "A",
        link: function (scope, element) {
            element.colorpicker();
            scope.$apply();
        }
    };
}

function iCheck($timeout, $parse) {
    return {
        link: function ($scope, element, $attrs) {
            return $timeout(function () {
                var ngModelGetter, value;
                ngModelGetter = $parse($attrs["ngModel"]);
                value = $parse($attrs["ngValue"])($scope);
                return $(element)
                    .iCheck({
                        radioClass: "iradio_square-blue",
                        checkboxClass: "icheckbox_square-blue",
                        increaseArea: "20%"
                    })
                    .on("ifChanged", function (event) {
                        if (
                            $(element).attr("type") === "checkbox" &&
                            $attrs["ngModel"]
                        ) {
                            $scope.$apply(function () {
                                return ngModelGetter.assign(
                                    $scope,
                                    event.target.checked
                                );
                            });
                        }
                        if (
                            $(element).attr("type") === "radio" &&
                            $attrs["ngModel"]
                        ) {
                            return $scope.$apply(function () {
                                return ngModelGetter.assign($scope, value);
                            });
                        }
                        $scope.$apply();
                    });
            });
        }
    };
}
