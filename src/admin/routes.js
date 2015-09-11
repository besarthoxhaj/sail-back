'use strict'

var React = require('react')
var routerModule  = require('react-router')

var App = require('../shared/app.js')
var AdminHome = require('./pages/home.js')
var ViewMember = require('./pages/view_member.js')
var AddMember = require('./pages/add_member.js')
var DataMaintenance = require('./pages/data_maintenance.js')
var Signin = require('../shared/signin.js')

var Router = routerModule.Router
var Route = routerModule.Route
var Redirect = routerModule.Redirect
var history = require('react-router/lib/HashHistory').history

module.exports = function (h, onUpdate) {

  h = h || history
  onUpdate = onUpdate || function noop () {}

  return (
    <Router history={h} onUpdate={onUpdate}>
      <Route component={App}>
        <Route path='/' component={AdminHome} />
          <Route path='/members/:id' component={ViewMember} />
          <Route path='/addmember' component={AddMember} />
          <Route path='/maintenance' component={DataMaintenance} />
          <Route path='/signin' component={Signin} />
      </Route>
    </Router>
  )
}