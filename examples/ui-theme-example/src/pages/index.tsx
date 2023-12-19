import React from 'react'
import { Anchor, Button, Card } from '@dnb/eufemia'
import { Form } from '@dnb/eufemia/extensions/forms'
import ChangeStyleTheme from '../../../shared/ChangeStyleTheme'
import { Link } from 'gatsby'
import './style.css'

const App = () => {
  return (
    <Card space spacing="medium">
      <Form.MainHeading>DNB UI</Form.MainHeading>

      <Button icon="bell">Button</Button>

      <ChangeStyleTheme />

      <Anchor element={Link as any} to="/page-b#bottom">
        Page B
      </Anchor>
    </Card>
  )
}

export default App
