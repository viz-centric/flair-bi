angular.module('app', ['angular-cron-generator'])
  .controller('HomeController', HomeController);


HomeController.$inject = ['$timeout'];
function HomeController($timeout) {
  this.pluginName = "Angular-Cron-Generator";
  this.cronConfig = {
    allowMultiple: true,
    quartz: true
  };
}

HomeController.prototype.convert = function() {
  if(this.cronString){
    console.log("bingo");
  }
}; 