var test = require('tape');
var rewire = require('rewire');
var wh = require('../index');

var workinghours = rewire('../index');
var methods = ['pad', 'date', 'seconds', 'normalize', 'count', 'isWeekend', 'isBankHoliday', 'isWorkingDay', 'nextWorkingDay', 'previousWorkingDay'];
methods.forEach(function(method) {
  wh[method] = workinghours.__get__(method);
});

var newYearsEve = new Date(2015, 11, 31);
var newYears = new Date(2016, 0, 1);
var saturday = new Date(2016, 0, 2);
var sunday = new Date(2016, 0, 3);
var monday = new Date(2016, 0, 4);
var tuesday = new Date(2016, 0, 5);
var NYEEarly = new Date(2015, 11, 31, 6, 10);
var NYEMorning = new Date(2015, 11, 31, 9, 30);
var NYELate = new Date(2015, 11, 31, 20, 40);
var mondayEarly = new Date(2016, 0, 4, 5, 0);
var mondayMorning = new Date(2016, 0, 4, 9, 0);
var mondayLate = new Date(2016, 0, 4, 20, 0);

wh.addHoliday(newYears);
workinghours.__get__('exports').addHoliday(newYears);
wh.setStartTime('8:00');
wh.setCloseTime('16:00');

test('pad', function(t) {
  t.equal(wh.pad(1), '01');
  t.equal(wh.pad('02'), '02');
  t.equal(wh.pad('003'), '003');
  t.end();
});

test('date', function(t) {
  t.deepEqual(wh.date(sunday), '20160103');
  t.end();
});

test('seconds', function(t) {
  t.equal(wh.seconds(100), 100, 'Does nothing when an integer is provided');
  t.equal(wh.seconds('9:00'), 32400, 'Converts string to seconds');
  t.equal(wh.seconds(mondayEarly), 18000, 'Converts Date to seconds');
  t.end();
});

test('normalize', function(t) {
  t.deepEqual(wh.normalize(mondayEarly), wh.seconds('8:00'), 'Shifts time to office open time');
  t.deepEqual(wh.normalize(mondayLate), wh.seconds('16:00'), 'Shifts time to office close time');
  t.equal(wh.normalize(mondayMorning), wh.seconds(mondayMorning), 'Returns same time');
  t.end();
});

test('count', function(t) {
  t.equal(wh.count('7:00', '16:45'), 8, 'Counts a maximum of 8 hours per day');
  t.equal(wh.count(mondayMorning, mondayEarly), -1, 'Counts negative hours');
  t.equal(wh.count(NYEMorning, mondayLate), 6.5, 'Does not consider dates');
  t.end();
});

test('isWeekend', function(t) {
  t.true(wh.isWeekend(saturday), 'Saturday is a weekend day');
  t.true(wh.isWeekend(sunday), 'Sunday is a weekend day');
  t.false(wh.isWeekend(monday), 'Monday is not a weekend day');
  t.end();
});

test('isBankHoliday', function(t) {
  t.true(wh.isBankHoliday(newYears), 'New Years day is a bank holiday');
  t.false(wh.isBankHoliday(newYearsEve), 'New Years Eve is not a bank holiday');
  t.end();
});

test('isWorkingDay', function(t) {
  t.true(wh.isWorkingDay(monday), 'Monday is a working day');
  t.false(wh.isWorkingDay(saturday), 'Saturday is not a working day');
  t.false(wh.isWorkingDay(newYears), 'New Years day is not a working day');
  t.end();
});

test('nextWorkingDay', function(t) {
  t.deepEqual(wh.nextWorkingDay(newYearsEve), monday, 'Monday is the next working day after New Years Eve');
  t.deepEqual(wh.nextWorkingDay(newYears), monday, 'Monday is the next working day after New Years day');
  t.deepEqual(wh.nextWorkingDay(saturday), monday, 'Monday is the next working day after saturday');
  t.deepEqual(wh.nextWorkingDay(monday), tuesday, 'Tuesday is the next working day after Monday');
  t.end();
});

test('previousWorkingDay', function(t) {
  t.deepEqual(wh.previousWorkingDay(tuesday), monday, 'Monday is the working day previous to Tuesday');
  t.deepEqual(wh.previousWorkingDay(monday), newYearsEve, 'New Years Eve is the working day previous to Monday');
  t.deepEqual(wh.previousWorkingDay(sunday), newYearsEve, 'New Years Eve is the working day previous to Sunday');
  t.end();
});

test('workingDays', function(t) {
  t.deepEqual(wh.workingDays(newYearsEve, sunday), 1, 'One working day from NYE to Sunday');
  t.deepEqual(wh.workingDays(newYearsEve, monday), 1, 'One working day from NYE to Monday');
  t.deepEqual(wh.workingDays(monday, monday), 0, 'Zero working days from Monday to Monday');
  t.deepEqual(wh.workingDays(monday, tuesday), 1, 'One working day from Monday to Tuesday');
  t.end();
});

