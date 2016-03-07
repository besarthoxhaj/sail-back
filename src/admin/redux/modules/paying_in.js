const { createAction } = require('redux-actions')
const { get_body } = require('app/http')
const { format } = require('app/transform_dated')
const { compose, concat, reduce, map, add, negate, lensPath, flip, over, prop,
  view, set, append, identity, objOf, propOr, mergeAll, converge, unapply,
  assoc, pick } =
    require('ramda')
const { plus, plus2 } = require('app/money_arith')
const { S } = require('sanctuary')
const { payments: fields } = require('../../form_fields/paying_in.js')

const RECEIVED_PAYING_IN = 'RECEIVED_PAYING_IN'

export default (state = {}, { type, payload }) => {
  switch (type) {
    case RECEIVED_PAYING_IN:
      return payload
    default:
      return state
  }
}

const make_url = concat('/api/payingin/')

const payments = lensPath(['payments'])
const memberL = lensPath(['member'])
const dateL = lensPath(['date'])
const name = lensPath(['surname'])
const balance = lensPath(['balance'])

const make_balances = (check) => (balances, charge) => {
  const { amount, category, member, date, reference, last_name } = charge
  const curr = lensPath([member])
  const curr_val = compose
    ( curr
    , lensPath([check(charge) ? 'payments' : category])
    )
  const curr_bal = compose(curr, balance)

  const update_balance = parity =>
    over(curr_val, plus(amount), over(curr_bal, plus(parity(amount)), balances))

  const credit = () => update_balance(identity)
  const debit = () => update_balance(negate)

  const add_member_details =
    compose(set(name, last_name), set(dateL, date), set(memberL, member))
  const reset_current = set(curr, {})
  const add_payment = (payment) => over(payments, append(payment), balances)

  const transfer_payment = compose(reset_current, add_payment)

  return check(charge)
    ? transfer_payment(add_member_details(view(curr, credit())), balances)
    : category === 'payment'
    ? credit()
    : debit()
}

const make_payments = (check) =>
  compose
    ( over(payments, map(format))
    , pick(['payments'])
    , reduce(make_balances(check), { payments: [] })
    )

const make_total = type =>
  compose(objOf(type), reduce(plus2, 0), map(propOr(0, type)))

const make_totals =
  converge
    ( unapply(mergeAll)
    , map
      ( make_total
      , [ 'subscription', 'donation', 'event', 'payment', 'payments', 'balance' ]
      )
    )

const add_totals = S(flip(assoc('totals')), compose(make_totals, prop('payments')))

const check = ref => ({ reference, category }) =>
  category === 'payment' && ref === reference

// link to issue on discussion around alternatives to breaking encapsulation
export const prepare = ref => compose(add_totals, make_payments(check(ref)))

export const receive_paying_in =
  createAction
    ( RECEIVED_PAYING_IN
    , (ref) => compose
      ( map(prepare(ref))
      , get_body
      , make_url
      )(ref)
    )

