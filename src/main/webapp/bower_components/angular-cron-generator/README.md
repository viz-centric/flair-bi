# angular-cron-generator
A cron expression generator for AngularJS. In both format quartz and unix

## demo

[demo]https://embed.plnkr.co/LCNjHr1s1rlr1FSXesMg/

## Installation

Install using bower:

`bower install angular-cron-generator`

## Use:

Include the component in your application:

    angular.module('app', ['angular-cron-generator']);

Insert the directive where you would like it to appear in your application:

    <cron-generator ng-model="cronString"></cron-generator>

By setting the ng-model attribute equal to a value in your controller (i.e. `$scope.cronString` in the example above) you have access to the cron syntax output.  

For example, a job selected to run every month on the 11th at 4:10 AM would output the follow:

	'10 4 11 * *'

as a string.

## Configuration:

The directive takes an optional attribute of `config`

    <cron-selection ng-model="cronString" config="cronConfig"></cron-selection>
    

### allowMultiple

You can also set whether or not you want to allow a user to select multiple values for a cron:

  $scope.myConfig = {
    allowMultiple: true
  }

Setting allowMultiple to either true or false will toggle the ability.


### Quartz

By default, the cron expression generated is Unix Cron compatible. Incase you use the [Quartz Scheduler](https://github.com/quartz-scheduler/quartz), you would want to enable the `quartz` mode in the config.
You can do so by passing that flag as `true` in the config object.

  $scope.myConfig = {
    quartz: true
  }

## Coming Soon:

* Test cases
* code optimize
* and hell yeah Support!


## Contribution

Any help or suggestion would be appreciated. you can contribute creating a separate branch and specific commit message and raise a PR.

After `run` bower and npm commands.
run `gulp dev`


## Contribution

MIT

Free Software, Hell Yeah!
