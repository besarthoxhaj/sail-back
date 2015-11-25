'use strict'

var React = require('react')
var Task = require('data.task')

var Search = require('../components/paying_in_search.js')
var PayingIn = require('../components/paying_in.js')

var curry = require('curry')
var object_assign = require('object-assign')
var get = require('app/get.js')
var chain = require('app/chain.js')
var map = require('app/map.js')
var compose = require('fn-compose')
var prop_or = require('app/prop_or.js')
var trace = require('app/trace.js')
var fold = require('app/fold.js')
var filter = require('app/filter.js')

module.exports = React.createClass({
  getInitialState: function () {
    return {
      payments: [],
      charges: {}
    }
  },
  render: function () {
    return (
      <div className='main-container'>
        <Search submit_handler={search(this.state, this.setState.bind(this))} />
        {Object.keys(this.state.charges).length ?
            <PayingIn
                payments={this.state.payments}
                charges={this.state.charges}
                reference={this.state.reference}
            /> :
            '' }
          </div> ) } })

var combine = curry(function combine (a, b) {
    return object_assign({}, a, b) })

var receive = curry(function (set_state, ref, charges, payments) {
  set_state({ ref: ref, charges: charges, payments: payments }) })

var search = curry(function search (state, set_state, e) {
  e.preventDefault()
  var ref = e.target.firstChild.value
  var payments = get_payments(ref)
  var make_charges =
      compose(
          map(get_charges),
          filter(first_occurrence),
          map(prop_or('', 'member')) )
  payments.fork(function () {}, function (match_ref) {
    var charges = make_charges(match_ref)

    set_state({
      payments: match_ref,
      reference: ref
    })

    charges.map(function (a) {
      a.fork(trace('charge error'), function (c) {
        set_state({
          charges: combine(state.charges, c)
        }) }) })

  }) })

var get_data = curry (function get_data (url) {
  return map(compose(
        JSON.parse,
        prop_or('[]', 'body')),
        get(url) ) })

function get_payments (ref) {
  return get_data('api/payments/?category=payment&reference=' + ref) }

function get_charges (id) {
  return get_data('api/payments/?member=' + id).map(function (d) {
    return { [id]: d } }) }

function necessary_members (tasks, member) {
  tasks[member] = get_charges(member)
  return tasks }

function first_occurrence (e, i, a) {
  return a.indexOf(e) === i }

function id (x) { return x }
