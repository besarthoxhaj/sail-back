import React from 'react'
import { connect } from 'react-redux'

import { send_newsletter_post
       , send_sub_reminder_post
       , active_view
       } from '../redux/modules/letters/letters.js'

import StandingOrderLetter from '../dumb_components/standing_order_letter.js'
import LetterRecipients from '../dumb_components/letter_recipients.js'

const Letters = ({ letters, send_newsletter_post, send_sub_reminder_post, active_view }) => {
  return (
  <div className='top-letter-container'>
    <button onClick={send_newsletter_post}>Show All Post Members</button>
    <button onClick={send_sub_reminder_post}>Print Subscription Reminders</button>
    <div>
      <button onClick={() => active_view('post_members', !letters.post_members.shown)}>Show</button>
      {letters.post_members.members.length > 0 && letters.post_members.shown
        ? <PostSection letters={letters.post_members.members} />
        : null
      }
      {letters.sub_reminders.length > 0
        ? generateSubLetters(letters.sub_reminders)
        : null
      }
    </div>
  </div>
)}

const PostSection = ({ letters }) => (
  <div>
    <LetterRecipients letters={letters} />
  </div>
)

const generateSubLetters = (subLetters) => (
  <div>
    <p className='sub-letters-header'>
      The following sample letter will be printed out for these recipients.
    </p>
    <LetterRecipients letters={subLetters} />
    <div className='letter-list-container'>
      <ul className='letter-list'>
      {subLetters.map((letter, i) => (
        <li key={i}>
          <StandingOrderLetter letter={letter}/>
        </li>
      ))}
      </ul>
    </div>
  </div>
)


const mapStateToProps = (state) => {
  return { letters: state.letters }
}

export default
  connect(mapStateToProps, { send_newsletter_post, send_sub_reminder_post, active_view })(Letters)
