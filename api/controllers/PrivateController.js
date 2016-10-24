/*global
  Members, sails, Payments
*/

var Is = require('torf')
var Upload = require('../services/Upload.js')()
var mg = require('../services/email_mailgun.js')
var aSync = require('async')

var queries = require('../queries/private.js')
var helpers = require('./helpers.js')
var response_callback = helpers.response_callback
var change_view = helpers.change_view

var membersQuery = function (query, type) {
  return function (req, res) {
    Members.query(queries[query](type), response_callback(res))
  }
}

module.exports = {
  showAdminHome: change_view('pages/admin'),
  showUserHome: change_view('pages/user'),
  showMemberForm: change_view('pages/new-member'),
  showMaintenance: change_view('pages/maintenance'),
  sendNewsletterAlert: membersQuery('newsletterQueryTemplate', 'online'),
  sendCustomEmail: membersQuery('custom_email'),
  getNewsletterLabels: membersQuery('newsletter_labels'),
  getPostMembers: membersQuery('newsletterQueryTemplate', 'post'),
  sendSubsReminder: membersQuery('subsQueryTemplate', 'online'),
  sendSubsReminderPost: membersQuery('subsQueryTemplate', 'post'),

  submit_email: function (req, res) {
    mg.submitEmail(req.body, response_callback(res))
  },
  get_bounced: function (req, res) {
    mg.getBounced(response_callback(res))
  },

  reset_subscription_payments: function (req, res) {
    Payments.query(queries.reset_subscription_payments, response_callback(res))
  },

  addmember: function (req, res) {
    var member = req.allParams()
    member.date_joined = (Is.ok(member.date_joined) ? member.date_joined : null)
    member.life_payment_date = (Is.ok(member.life_payment_date) ? member.life_payment_date : null)
    member.due_date = (Is.ok(member.due_date) ? member.due_date : null)
    member.date_gift_aid_signed = (Is.ok(member.date_gift_aid_signed) ? member.date_gift_aid_signed : null)
    member.date_membership_type_changed = (Is.ok(member.date_membership_type_changed) ? member.date_membership_type_changed : null)
    member.date_gift_aid_cancelled = (Is.ok(member.date_gift_aid_cancelled) ? member.date_gift_aid_cancelled : null)
    member.primary_email = (Is.ok(member.primary_email) ? member.primary_email : null)

    Members
      .create(req.allParams())
      .exec(function (err, item) {
        if (err) {
          res.json(err)
        } else {
          res.json(item)
        }
      })
  },
  showMember: function (req, res) {
    /* TODO: redo so it uses applicative functor pattern to simultaneously get events */
    Members
      .findOne(req.param('id'))
      .populate('events_booked')
      .populate('membership_type')
      .populate('payments', {
        where: { date: { '>': new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) }}
      })
      .exec(function (err, item) {
        if (Is.ok(err) || !Is.ok(item)) {
          return res.notFound()
        } else {
          return res.json(item)
        }
      })
  },
  sendSubsDue: function (req, res) {
    var response_callback = (err, results) => {
      if (err) return res.badRequest({ error: err })
      return res.json({ results: results[0] })
    }

    var dbCall = queryString => cb => {
      Members.query(queries[queryString](req.body), cb)
    }

    aSync.series(
      [ dbCall('subscription_due_template')
      , dbCall('update_subscription')
      ], response_callback
    )
  },
  Upload: function (req, res) {
    /**
     *  The sign '&' (ampersand) splits the
     *  request body content in different objects
     *  where all the keys are the data.
     *
     *  Examples:
     *
     *  {
     *    '6095;Mr ': '',
     *    ' Mrs;J H;Adams;': ''
     *  }
     *
     *  The original line was: '6095;Mr & Mrs;J H;Adams;'
     */
    var csv = req.body

    if (req.query.type === 'members') {
      Upload.members(csv, function (err, result) {
        return res.send(result)
      })
    } else if (req.query.type === 'payments') {
      Upload.payments(csv, function (err, result) {
        sails.log.info('Payment upload: ', result)

        return res.send(result)
      })
    } else {
      return res.badRequest()
    }
  },

  // Analysis Endpoint Logic
  // ---------------------------------------------------------------------------
  list_gift_aid: function (req, res) {
    Members
      .find({ gift_aid_signed: true })
      .exec(function (err, items) {
        console.log('gift aid members', items)
      })
  }
}
