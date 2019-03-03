'use strict';

var AngularTest = AngularTest || {};

AngularTest.compileDirective = function ($scope, template) {
  var element = null;
  inject(function($compile) {
      element = $compile(template)($scope);
  });
  $scope.$digest();
  element.appendTo(document.body);
  return element;
};

AngularTest.findIn = function (element, selector) {
    return angular.element(element[0].querySelector(selector));
};
