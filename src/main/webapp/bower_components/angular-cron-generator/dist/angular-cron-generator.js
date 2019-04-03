(function () {
'use strict';

CronGeneratorDirective.$inject = ["cronGeneratorService"];
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var DAY_LOOKUPS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
var MONTH_LOOKUPS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

var CronGeneratorService = function () {
  function CronGeneratorService() {
    'ngInject';

    classCallCheck(this, CronGeneratorService);
  }

  createClass(CronGeneratorService, [{
    key: 'convertObjectIntoCronString',
    value: function convertObjectIntoCronString(o, type, allowMultiple) {
      if (type === "quartz") {
        return this.getQuartzCronString(o, allowMultiple);
      } else {
        return this.getUnixCronString(o);
      }
    }
  }, {
    key: 'getQuartzCronString',
    value: function getQuartzCronString(o, allowMultiple) {
      var cron = ["*", "*", "*", "*", "*", "?", "*"],
          count = parseInt(o.base);
      if (count <= 1) {
        cron[1] = typeof o.minutes !== "undefined" ? "*/" + o.minutes : "*";
      } else if (count >= 1) {
        cron[1] = typeof o.minutes !== "undefined" ? o.minutes : "*";
      }
      if (count <= 2) {
        cron[2] = typeof o.hours !== "undefined" ? "*/" + o.hours : "*";
      } else if (count >= 2) {
        cron[2] = typeof o.hours !== "undefined" ? o.hours : "*";
      }
      if (count >= 3) {
        cron[3] = typeof o.daysOfMonth !== "undefined" ? o.daysOfMonth : "*";
      }
      if (count >= 4) {
        if (o.days) {
          cron[3] = "?";
        }
        if (typeof o.days !== "undefined") {
          if (allowMultiple) {
            var str = [];
            angular.forEach(o.days, function (idx) {
              str.push(DAY_LOOKUPS[idx - 1]);
            });
            cron[5] = str.join();
          } else {
            cron[5] = DAY_LOOKUPS[o.days - 1];
          }
        } else {
          cron[5] = "?";
        }
      }
      if (count >= 5) {
        if (typeof o.months !== "undefined") {
          if (allowMultiple) {
            var _str = [];
            angular.forEach(o.months, function (idx) {
              _str.push(MONTH_LOOKUPS[idx]);
            });
            cron[4] = _str.join();
          } else {
            cron[4] = MONTH_LOOKUPS[o.months];
          }
        } else {
          cron[4] = "*";
        }
      }
      return cron.join(" ");
    }
  }, {
    key: 'getUnixCronString',
    value: function getUnixCronString(o) {
      var cron = ["*", "*", "*", "*", "*"],
          count = parseInt(o.base);
      if (count <= 1) {
        cron[0] = typeof o.minutes !== "undefined" ? "*/" + o.minutes : "*";
      } else if (count >= 1) {
        cron[0] = typeof o.minutes !== "undefined" ? o.minutes : "*";
      }
      if (count <= 2) {
        cron[1] = typeof o.hours !== "undefined" ? "*/" + o.hours : "*";
      } else if (count >= 2) {
        cron[1] = typeof o.hours !== "undefined" ? o.hours : "*";
      }
      if (count <= 3) {
        cron[2] = typeof o.daysOfMonth !== "undefined" ? "*/" + o.daysOfMonth : "*";
      } else if (count >= 3) {
        cron[2] = typeof o.daysOfMonth !== "undefined" ? o.daysOfMonth : "*";
      }
      if (count >= 4) {
        cron[4] = typeof o.days !== "undefined" ? o.days : "*";
      }
      if (count >= 5) {
        cron[4] = "*";
        cron[3] = typeof o.months !== "undefined" ? o.months : "*";
      }
      return cron.join(" ");
    }
  }]);
  return CronGeneratorService;
}();

function CronGeneratorDirective(cronGeneratorService) {
  'ngInject';

  function linkFn($scope, $el, $attr, $ngModel) {
    $scope.myFrequency = {
      base: 0
    };

    $scope.frequency = [{
      value: 0,
      label: "Select"
    }, {
      value: 1,
      label: "Minute"
    }, {
      value: 2,
      label: "Hourly"
    }, {
      value: 3,
      label: "Daily"
    }, {
      value: 4,
      label: "Weekly"
    }, {
      value: 5,
      label: "Monthly"
    }, {
      value: 6,
      label: "Yearly"
    }];

    if (_typeof($scope.config) === "object" && !$scope.config.length) {
      if (_typeof($scope.config.options) === "object") {
        var optionsKeyArray = Object.keys($scope.config.options);
        for (var i in optionsKeyArray) {
          var currentKey = optionsKeyArray[i].replace(/^allow/, "");
          var originalKey = optionsKeyArray[i];
          if (!$scope.config.options[originalKey]) {
            for (var b in $scope.frequency) {
              if ($scope.frequency[b].label === currentKey) {
                $scope.frequency.splice(b, 1);
              }
            }
          }
        }
      }
      if (angular.isDefined($scope.config.allowMultiple)) {
        $scope.allowMultiple = $scope.config.allowMultiple;
      } else {
        $scope.allowMultiple = false;
      }

      if (angular.isDefined($scope.config.quartz) && $scope.config.quartz) {
        $scope.cronStyle = "quartz";
      } else {
        $scope.cronStyle = "default";
      }
    }

    $scope.minutes = Array.apply(null, Array(60)).map(function (_, i) {
      return i;
    });
    $scope.hours = Array.apply(null, Array(24)).map(function (_, i) {
      return i;
    });
    $scope.daysOfMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    $scope.days = [0, 1, 2, 3, 4, 5, 6];
    $scope.months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    if ($scope.cronStyle === "quartz") {
      $scope.days = [1, 2, 3, 4, 5, 6, 7];
    }

    $scope.$watch("myFrequency", function (n, o) {
      if (angular.isUndefined(n)) {
        $scope.myFrequency = {
          base: 0
        };
      }
      if (n && o) {
        if (n.base) {
          var str = cronGeneratorService.convertObjectIntoCronString(n, $scope.cronStyle, $scope.allowMultiple);
          $ngModel.$setViewValue(str);
        }
      }
    }, true);

    $scope.initKeys = function () {

      resetInitialValues();

      //due to angular issue
      if ($scope.allowMultiple) {
        //http://stackoverflow.com/questions/18751129/angularjs-selecting-multiple-options
        return;
      }
      var o = parseInt($scope.myFrequency.base);
      if (o >= 1) {
        $scope.myFrequency.minutes = $scope.minutes[0];
      }
      if (o >= 2) {
        $scope.myFrequency.hours = $scope.hours[0];
      }
      if (o >= 3) {
        $scope.myFrequency.daysOfMonth = $scope.daysOfMonth[0];
      }
      if (o >= 4) {
        delete $scope.myFrequency['daysOfMonth'];
        $scope.myFrequency.days = $scope.days[0];
      }
      if (o >= 5) {
        $scope.myFrequency.months = $scope.months[0];
        $scope.myFrequency.daysOfMonth = $scope.daysOfMonth[0];
      }
    };
    function resetInitialValues() {
      var key = $scope.myFrequency.base;
      $scope.myFrequency = {};
      $scope.myFrequency.base = key;
    }
  }

  var directive = {
    restrict: "EA",
    replace: true,
    transclude: true,
    require: "ngModel",
    scope: {
      ngModel: "=",
      config: "="
    },
    templateUrl: "cron.generator.html",
    link: linkFn
  };
  return directive;
}

function CronNumeral() {
  "ngInject";

  return function (input) {
    switch (input) {
      case 1:
        return "1st";
      case 2:
        return "2nd";
      case 3:
        return "3rd";
      case 21:
        return "21st";
      case 22:
        return "22nd";
      case 23:
        return "23rd";
      case 31:
        return "31st";
      case null:
        return null;
      default:
        return input + "th";
    }
  };
}

function CronMonthName() {
  'ngInject';

  return function (input) {
    var months = {
      1: "January",
      2: "February",
      3: "March",
      4: "April",
      5: "May",
      6: "June",
      7: "July",
      8: "August",
      9: "September",
      10: "October",
      11: "November",
      12: "December"
    };
    if (input !== null && angular.isDefined(months[input])) {
      return months[input];
    } else {
      return null;
    }
  };
}

function CronDayName() {
  "ngInject";

  return function (input, cronType) {
    var days = void 0;
    if (cronType === "quartz") {
      days = {
        1: "Sunday",
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday"
      };
    } else {
      days = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
      };
    }
    if (input !== null && angular.isDefined(days[input])) {
      return days[input];
    } else {
      return null;
    }
  };
}

angular.module('angular-cron-generator', []).service('cronGeneratorService', CronGeneratorService).directive('cronGenerator', CronGeneratorDirective).filter('cronNumeral', CronNumeral).filter('cronMonthName', CronMonthName).filter('cronDayName', CronDayName);

}());
