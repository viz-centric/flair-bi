export function CronNumeral() {
  "ngInject";
  return function(input) {
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

export function CronMonthName() {
  'ngInject';
  return function(input) {
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
	  }
	  else {
	    return null;
	  }
	};
}

export function CronDayName() {
  "ngInject";
  return function(input, cronType) {
    let days;
    if(cronType === "quartz") {
      days = {
        1: "Sunday",
        2: "Monday",
        3: "Tuesday",
        4: "Wednesday",
        5: "Thursday",
        6: "Friday",
        7: "Saturday",
      };
    } 
    else {
      days = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };
    }
    if (input !== null && angular.isDefined(days[input])) {
      return days[input];
    } 
    else {
      return null;
    }
  };
}