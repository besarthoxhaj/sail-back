'use strict'

const React = require('react')
const { connect } = require('react-redux')
const { reduxForm } = require('redux-form')

const MemberFields = require('../dumb_components/member_fields.js')
const { fields, validate, required } = require('../form_fields/member.js')
const { create_member } = require('../redux/modules/member.js')

const buttons = (
  { fields: { id: { value: id } }, error }
) =>
  <div>
    { error ? <div className='error'>{error}</div> : '' }
    { id
      ? <div id='member-num'>Member ID is: {id} </div>
      : <button type='submit'>Submit</button>
    }
  </div>

const AddMember = reduxForm(
  { form: 'member'
  , validate
  , fields: []
  }
)(MemberFields)

const NewMember = (
  { create_member
  }
) => (
  <div>
    <div className='new-member-container'>
      <h1>New Member Form</h1>
      <AddMember
        fields={fields}
        Buttons={buttons}
        onSubmit={create_member}
        required={required}
        mode='edit'
      />
      <a href='#/' className='flex-button'>
        <button className='button-primary'>Home</button>
      </a>
    </div>
  </div>
)

const map_state_to_props = () => ({})
const map_dispatch_to_props = (
  { create_member
  }
)

module.exports = connect(map_state_to_props, map_dispatch_to_props)(NewMember)
