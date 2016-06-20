//TODO learn ramda

import React from 'react'
import { connect } from 'react-redux'

import { send_newsletter_post, send_sub_reminder_post } from '../redux/modules/letters.js'

import StandingOrderLetter from '../dumb_components/standing_order_letter.js'

const Letters = (props) => {
  console.log(props)
  return (
    <div className='top-letter-container'>
      <button onClick={props.send_newsletter_post}>Get Members</button>
      <button onClick={props.send_sub_reminder_post}>Get Outstanding Members</button>
        {props.letters.post_members.length > 0
          ? <ul>
            {props.letters.post_members.map((member, i) => <li key={i}>{member.first_name}</li>)}
          </ul>
          : <p>Loading</p>
        }
        {props.letters.sub_reminders.length > 0
          ? props.letters.sub_reminders.map((letter, i) => ( //eslint-disable-line
            <li key={i}>
              <StandingOrderLetter letter={letter}/>
            </li>
            ))
          : <p>Loading</p>
        }
    </div>
  )
}


const mapStateToProps = (state) => {
  return { letters: state.letters }
}

export default connect(mapStateToProps, { send_newsletter_post, send_sub_reminder_post })(Letters)
