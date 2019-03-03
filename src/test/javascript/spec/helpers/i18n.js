var AngularTest = AngularTest || {};

function internationalization($provide, $translateProvider) {
  $provide.factory('customLoader', function($q) {
    return function() {
      var deferred = $q.defer();
      deferred.resolve({});
      return deferred.promise;
    };
  });

  $translateProvider.useLoader('customLoader');
}

AngularTest.internationalization = internationalization;
