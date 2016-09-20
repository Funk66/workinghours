var mongoose = require('mongoose');
var Calendar = mongoose.model('Calendar');

function load(callback) {
  Calendar.findOne().exec(function(err, data) {
    if (err) {
      return callback(err);
    }
    return callback(null, data);
  });
}

var officeOpen = {'hour': 8, 'minute': 0};
var officeClose = {'hour': 18, 'minute': 0};

/**
 * Sets the time to 00:00:00.0000 and returns a new Date object
 * @returns {Date}
 * @param {Date} datetime
 */
exports.date = function stripTime(datetime) {
  var newDate = new Date(datetime.getTime());
  newDate.setHours(0);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
};

exports.explodeTime = function explodeTime(time) {
  var timeArray = time.split(':');
  return {'hour': timeArray[0], 'minute': timeArray[1]};
};

exports.setTime = function setTime(date, time) {
  // > setTime(new Date, '18:55')
  // Thu Sep 08 2016 18:55:00 GMT+0200 (CEST)
  var timeArray = time.split(':');
  var newDate = new Date(date.getTime());
  newDate.setHours(timeArray[0]);
  newDate.setMinutes(timeArray[1]);
  return newDate;
};

exports.countHours = function countHours(time1, time2) {
  // > countHours('8:00', '16:45')
  // 8.75
  // Add assert to check whether time1 <= time2
  time1 = explodeTime(time1);
  time2 = explodeTime(time2);
  return (time2.hour - time1.hour) + (time2.minute - time1.minute) / 60;
};

exports.isWeekend = function isWeekend(date) {
  return [0, 6].indexOf(date.getUTCDay()) > -1;
};

exports.isBankHoliday = function isBankHoliday(date) {
  return holidays.indexOf(stripTime(date));
};

exports.isWorkingDay = function isWorkingDay(date) {
  return (!isWeekend(date) && !isBankHoliday(date));
};

exports.nextWorkingDay = function nextWorkingDay(date) {
  var nextDay = stripTime(date);
  nextDay.setDate(nextDay.getDate() + 1);
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
};

exports.previousWorkingDay = function previousWorkingDay(date) {
  var previousDay = stripTime(date);
  previousDay.setDate(previousDay.getDate() - 1);
  while (!isWorkingDay(previousDay)) {
    previousDay.setDate(previousDay.getDate() - 1);
  }
  return previousDay;
};

exports.workingDays = function workingDays(date1, date2) {
  if (typeof(date2) === 'undefined') date2 = new Date();
  var from_date = Math.min.apply(null, [date1, date2]);
  var to_date = Math.max.apply(null, [date1, date2]);
  var days = 0;
  while (from_date < to_date) {
    from_date = nextWorkingDay(from_date);
    days++;
  }
  return days;
};

exports.workingHours = function workingHours(date1, date2) {
  if (typeof(date2) === 'undefined') date2 = new Date();
  var fromTime = Math.min.apply(null, [date1, date2]);
  var toTime = Math.max.apply(null, [date1, date2]);
  var secondsDay = (officeClose.hour*3600 + officeClose.minute*60) - (officeOpen.hour*3600 - officeOpen.minute*60);

  var workingTime = 0;
  if (stripTime(fromTime) < stripTime(toTime)) {
    // Starts and ends on the same day
    if (!isWorkingDay(fromTime)) {
      return 0;
    } else if (toTime.getHours() < officeOpen.hour && toTime.getMinutes() < officeOpen.minute) {
      return 0;
    } else {
      if (fromTime.getHours() < officeOpen.hour && fromTime.getMinutes() < officeOpen.minute) {
        fromTime.setHours(officeOpen.hour);
        fromTime.setMinutes(officeOpen.minute);
      }
      if (toTime.getHours() > officeClose.hour && toTime.getMinutes() > officeClose.minute) {
        toTime.setHours(officeClose.hour);
        toTime.setMinutes(officeClose.minute);
      }
      working_time = toTime - fromTime;
    }
  } else {
    var currentDay = fromTime;
    return 1;
  }
};
