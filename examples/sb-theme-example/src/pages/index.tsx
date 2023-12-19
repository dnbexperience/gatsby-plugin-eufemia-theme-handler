import React from 'react'
import { Anchor, Button, Card } from '@dnb/eufemia'
import { Form } from '@dnb/eufemia/extensions/forms'
import ChangeStyleTheme from '../../../shared/ChangeStyleTheme'

const App = () => {
  return (
    <Card space spacing="medium">
      <Form.MainHeading>Sbanken</Form.MainHeading>

      <Button icon="bell">Button</Button>

      <ChangeStyleTheme />
    </Card>
  )
}

export default App
