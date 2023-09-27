import React from 'react'
import { Button } from '@dnb/eufemia'
import { Layout } from '@dnb/eufemia/extensions/forms'
import ChangeStyleTheme from '../../../shared/ChangeStyleTheme'

const App = () => {
  return (
    <Layout.Card space spacing="medium">
      <Layout.MainHeading>Sbanken</Layout.MainHeading>

      <Button icon="bell">Button</Button>

      <ChangeStyleTheme />
    </Layout.Card>
  )
}

export default App
