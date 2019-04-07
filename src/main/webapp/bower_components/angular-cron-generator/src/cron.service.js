const QUARTZ_REGEX = /^\s*($|#|\w+\s*=|(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?(?:,(?:[0-5]?\d)(?:(?:-|\/|\,)(?:[0-5]?\d))?)*)\s+(\?|\*|(?:[01]?\d|2[0-3])(?:(?:-|\/|\,)(?:[01]?\d|2[0-3]))?(?:,(?:[01]?\d|2[0-3])(?:(?:-|\/|\,)(?:[01]?\d|2[0-3]))?)*)\s+(\?|\*|(?:0?[1-9]|[12]\d|3[01])(?:(?:-|\/|\,)(?:0?[1-9]|[12]\d|3[01]))?(?:,(?:0?[1-9]|[12]\d|3[01])(?:(?:-|\/|\,)(?:0?[1-9]|[12]\d|3[01]))?)*)\s+(\?|\*|(?:[1-9]|1[012])(?:(?:-|\/|\,)(?:[1-9]|1[012]))?(?:L|W)?(?:,(?:[1-9]|1[012])(?:(?:-|\/|\,)(?:[1-9]|1[012]))?(?:L|W)?)*|\?|\*|(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?(?:,(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:(?:-)(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))?)*)\s+(\?|\*|(?:[1-7]|MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-|\/|\,|#)(?:[1-5]))?(?:L)?(?:,(?:[1-7]|MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-|\/|\,|#)(?:[1-5]))?(?:L)?)*|\?|\*|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?(?:,(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:(?:-)(?:MON|TUE|WED|THU|FRI|SAT|SUN))?)*)(|\s)+(\?|\*|(?:|\d{4})(?:(?:-|\/|\,)(?:|\d{4}))?(?:,(?:|\d{4})(?:(?:-|\/|\,)(?:|\d{4}))?)*))$/;

const DAY_LOOKUPS = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT'
];
const MONTH_LOOKUPS =[
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];

export class CronGeneratorService {
  constructor() {
    'ngInject';
  }

  convertObjectIntoCronString(o, type, allowMultiple) {
    if(type === "quartz") {
      return this.getQuartzCronString(o, allowMultiple);
    } 
    else {
      return this.getUnixCronString(o);
    }
	}

	getQuartzCronString (o, allowMultiple){
    let cron = ["*", "*", "*",  "*",  "*", "?", "*"],
    count = parseInt(o.base);
    if(count <= 1){
      cron[1] = typeof o.minutes !== "undefined" ? "*/"+o.minutes : "*";
    }
    else if(count >= 1){
        cron[1] = typeof o.minutes !== "undefined" ? o.minutes : "*";
    }
    if(count <= 2){
      cron[2] = typeof o.hours !== "undefined" ? "*/"+o.hours : "*";
    }
    else if(count >= 2){
      cron[2] = typeof o.hours !== "undefined" ? o.hours : "*";
    }
    if(count >= 3){
        cron[3] = typeof o.daysOfMonth !== "undefined" ? o.daysOfMonth : "*";
    }
    if(count >= 4){
      if(o.days){
          cron[3] = "?";
      }
      if (typeof o.days !== "undefined"){
        if (allowMultiple) {
          let str=[];
          angular.forEach(o.days, function(idx){
              str.push(DAY_LOOKUPS[idx-1]);
          });
          cron[5] = str.join();
        }
        else{
          cron[5] = DAY_LOOKUPS[o.days-1];
        }
      }
      else{
        cron[5] = "?";
      }
    }
    if(count >= 5){
			if (typeof o.months !== "undefined"){
			  if (allowMultiple) {
		      let str=[];
		      angular.forEach(o.months, function(idx){
		          str.push(MONTH_LOOKUPS[idx]);
		      });
		      cron[4] = str.join();
			  }
			  else{
			    cron[4] = MONTH_LOOKUPS[o.months];
			  }
			}
			else{
			  cron[4] = "*";
			}
    }
    return cron.join(" ");
	}	

	getUnixCronString(o){
    let cron = ["*", "*", "*", "*", "*"],
    count = parseInt(o.base);
    if(count <= 1){
      cron[0] = typeof o.minutes !== "undefined" ? "*/"+o.minutes : "*";
    }
    else if(count >= 1){
      cron[0] = typeof o.minutes !== "undefined" ? o.minutes : "*";
    }
    if(count <= 2){
      cron[1] = typeof o.hours !== "undefined" ? "*/"+o.hours : "*";
    }
    else if(count >= 2){
      cron[1] = typeof o.hours !== "undefined" ? o.hours : "*";
    }
    if(count <= 3){
      cron[2] = typeof o.daysOfMonth !== "undefined" ? "*/"+o.daysOfMonth : "*";
    }
    else if(count >= 3){
      cron[2] = typeof o.daysOfMonth !== "undefined" ? o.daysOfMonth : "*";
    }
    if(count >= 4){
      cron[4] = typeof o.days !== "undefined" ? o.days : "*";
    }
    if(count >= 5){
      cron[4] = "*";
      cron[3] = typeof o.months !== "undefined" ? o.months : "*";
    }
    return cron.join(" ");
	}
}