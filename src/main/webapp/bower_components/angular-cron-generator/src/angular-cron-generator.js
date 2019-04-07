import { CronGeneratorService } from './cron.service';
import { CronGeneratorDirective } from './cron.directive'
import { CronNumeral } from './cron.filters';
import { CronMonthName } from './cron.filters';
import { CronDayName } from './cron.filters';

angular.module('angular-cron-generator', [])
    .service('cronGeneratorService', CronGeneratorService)
    .directive('cronGenerator', CronGeneratorDirective)
    .filter('cronNumeral', CronNumeral)
    .filter('cronMonthName', CronMonthName)
    .filter('cronDayName', CronDayName);