import React from 'react'
import { connect } from 'react-redux'
import { pick, isEmpty, length } from 'ramda'

import { fetch_member_user } from '../../shared/redux/modules/member.js'
import { add_donation } from '../redux/modules/user_payments.js'

const PaymentsTable = require('../../shared/components/payments_table')

class MemberPaymentsTable extends React.Component {
  componentDidMount () {
    this.props.fetch_member_user()
  }

  shouldComponentUpdate ({ user_payments: { donation_made }, payments }) {
    return (
      (this.props.user_payments.donation_made !== donation_made) || (length(this.props.payments) !== length(payments))
    )
  }

  componentDidUpdate () {
    this.props.fetch_member_user()
  }

  render () {
    return (
      <div className='donation-section'>
        {isEmpty(this.props.payments) ? NoRecords() : <PaymentsTable payments={this.props.payments} />}
        {this.props.user_payments.donation_made ? SuccessfulDonation() : DonationForm(this.props.add_donation)}
      </div>
    )
  }
}

const DonationForm = (add_donation) => {
  return (
    <div className='donation-form'>
      <h4>
        In order to make membership of the Friends available to as many people
        as possible we try to keep our annual subscription rates down.
        If you would like to add a donation please enter the amount in the box
        and click Make Donation. Otherwise select the Make a Payment tab above.
      </h4>
      <form onSubmit={(e) => {
          e.preventDefault()
          add_donation({ amount: e.target[0].value })
      }}
      >
        <input type='number'/>
        <button type='submit'>Make Donation</button>
      </form>
    </div>
  )
}

const SuccessfulDonation = () => {
  return (
    <div className='successful-donation'>
      <h3>Your records have been updated</h3>
    </div>
  )
}

const NoRecords = () => {
  return (
    <div className='no-payment-records'>
      <h3>No payments have been recorded in your account</h3>
    </div>
  )
}

export default connect(pick(['payments', 'user_payments']), { fetch_member_user, add_donation })(MemberPaymentsTable)
