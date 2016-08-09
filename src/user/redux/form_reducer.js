/* @flow */
const { reducer: form } = require('redux-form')
import member_reducer from '../../shared/redux/modules/member.js'
import { normalise as user } from '../../shared/form_fields/member.js'

export default form.plugin(
  { user: member_reducer
  }
).normalize(
  { user
  }
)