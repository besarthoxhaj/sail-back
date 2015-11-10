'use strict'

var React = require('react')

var ReportTable = require('../components/report_table.js')

var object_assign = require('object-assign')
var deep_equal = require('deep-equal')
var curry = require('curry')
var compose = require('fn-compose')

module.exports = React.createClass({
  propTypes: {
    payments: React.PropTypes.array,
    charges: React.PropTypes.object },

  getDefaultProps: function () {
    return {
      payments: require('../../../test/fixtures/ref_payments.json'),
      charges: require('../../../test/fixtures/charges.json') } },

  render: function () {
    var {charges, payments} = this.props
    return (
      <ReportTable
          charges={get_charges(payments, charges)}></ReportTable> ) } })

var get_charges = function get_charges (payments, charges) {
  return payments.map( compose(
        add_relevant_charges(charges),
        user_entry_from_payment) ) }

var add_relevant_charges = curry(function add_relevant (charges, payment) {
  return get_relevant_charges(charges, payment).reduce(add_charge, payment) })

var get_relevant_charges = curry(function get_relevant (charges, payment) {
  return charges[payment.member_number].filter(earlier_and_not_same(payment)) })

var add_charge = function add_charge (entry, { category, amount } ) {
  return object_assign({}, entry, {
    [field(category)]: amount + entry[field(category)],
    balance_due: correct_sign(category, amount) + entry.balance_due }) }

var earlier_and_not_same = curry.to(2, function (a, b) {
  return not_same(a,b) && earlier(a, b) })

var not_same = function not_same (a, b) {
  return !deep_equal(a, user_entry_from_payment(b)) }

var earlier = function earlier (entry_a, entry_b) {
  return new Date(entry_a.payment_date) >= new Date(entry_b.date) }

var correct_sign = function correct_sign (category, amount) {
  return (category === 'payment' ? -1 : 1) * amount }

var field = function (category) {
  return category === 'payment' ? 'payments_not_on_this_ref' : category }

function user_entry_from_payment ({member, date, amount}) {
  return object_assign({}, blank_entry, {
    member_number: member,
    payment_date: date,
    payments: amount,
    balance_due: -amount }) }


var blank_entry = {
  member_number: 0,
  payment_date: '',
  subscription: 0,
  donation: 0,
  events: 0,
  payments: 0,
  payments_not_on_this_ref: 0,
  balance_due: 0
}
