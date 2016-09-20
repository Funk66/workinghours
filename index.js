var officeOpen = seconds('8:00');
var officeClose = seconds('16:00');
var holidays = [];

exports.setStartTime = function(time) {
  officeOpen = seconds(time);
};

exports.setCloseTime = function(time) {
  officeClose = seconds(time);
};

exports.addHoliday = function(day) {
  holidays.push(date(day));
};

function pad(number) {
  var string = String(number);
  return string.length === 1 ? '0' + string : string;
}

function date(day) {
  return String(day.getFullYear()) + pad(day.getMonth() + 1) + pad(day.getDate());
}

function seconds(time) {
  if (typeof time === 'number') {
    return time;
  } else if (typeof time === 'string') {
    var t = time.split(':');
    return t[0] * 3600 + t[1] * 60;
  } else if (time instanceof Date) {
    return (time.getHours() * 3600) + (time.getMinutes() * 60) + time.getSeconds();
  }
}

function normalize(time) {
  var actual = seconds(time);
  if (actual < officeOpen) {
    return officeOpen;
  } else if (actual > officeClose) {
    return officeClose;
  } else {
    return actual;
  }
}

function count(time1, time2) {
  return (normalize(time2) - normalize(time1)) / 3600;
}

function isWeekend(day) {
  return day.getUTCDay() > 4;
}

function isBankHoliday(day) {
  return holidays.indexOf(date(day)) > -1;
}

function isWorkingDay(day) {
  return (!isWeekend(day) && !isBankHoliday(day));
}

function nextWorkingDay(day) {
  var nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
}

function previousWorkingDay(day) {
  var previousDay = new Date(day);
  previousDay.setDate(previousDay.getDate() - 1);
  while (!isWorkingDay(previousDay)) {
    previousDay.setDate(previousDay.getDate() - 1);
  }
  return previousDay;
}

exports.workingDays = function(date1, date2) {
  if (typeof(date2) === 'undefined') date2 = new Date();
  var order = date1 < date2;
  var fromDate = date1 < date2 ? date1 : date2;
  var toDate = date1 < date2 ? date2 : date1;
  var days = 0;
  while (date(fromDate) < date(toDate)) {
    days++;
    fromDate = nextWorkingDay(fromDate);
  }
  return days;
};

exports.workingHours = function (date1, date2) {
  if (typeof(date2) === 'undefined') date2 = new Date();
  var fromTime = Math.min.apply(null, [date1, date2]);
  var toTime = Math.max.apply(null, [date1, date2]);

  var workingTime = 0;
  while (date(fromTime) < date(toTime)) {
    if (isWorkingDay(fromTime)) {
      workingTime += count(fromTime, officeClose);
    }
    fromTime.setDate(fromTime.getDate() + 1);
  }
  workingTime += count(fromTime, toTime);
};
