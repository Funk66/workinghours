Working hours
=============

Utility to calculate working hours and get due dates.

## Installation

  ```
  npm install [--save] workinghours
  ```

## Configuration

  ```javascript
  var wh = require('workinghours');

  wh.setStartTime('9:00');
  wh.setCloseTime('17:30');
  var newYearsDay = new Date(2016, 0, 1);
  wh.addHoliday(newYearsDay)
  ```

## Usage

  ```javascript
  var date1 = new Date(2015, 11, 31, 12, 0);
  var date2 = new Date(2016, 0, 4, 10, 0);
  wh.workingHours(new Date(date1, date2));  // Returns 6.5 working hours
  wh.workingDays(date1, date2)  // Returns 1 working day
  ```

## Tests

  ```
  npm test
  ```

## Contributing

  In lieu of a formal style guide, take care to maintain the existing coding style.
  Add unit tests for any new or changed functionality. Lint and test your code.
