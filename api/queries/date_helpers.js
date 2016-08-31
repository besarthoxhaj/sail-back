var B = require('sanctuary').B
var format_date = require('app/format_date').format_date_SQL

exports.today = env =>
  env === 'heroku-test' ? "'2017-08-15'" : "curdate()"

exports.due_dates = start => end => compare => {
  var wrap =
    month_and_day(start) < month_and_day(end) ? x => x : x => `not(${x})`

  return wrap(`${set_2000(compare)}
    between ${set_2000(`'${format_date(start)}'`)}
    and ${set_2000(`'${format_date(end)}'`)}`)
}

var set_year = year => date => `date_format(${date}, '${year}-%m-%d')`

var set_2000 = set_year('2000')

var current_year = env =>
  env === 'heroku-test'
  ? '2017'
  : JSON.stringify((new Date()).getFullYear())

exports.set_current = B(set_year, current_year)

var month_and_day = date_string => date_string.split('-').slice(1).join()
