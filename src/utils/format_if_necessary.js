module.exports = function format_if_necessary (header) {
  return header === 'Date' ?
    require('./format_date') :
    function (data) { return data } }