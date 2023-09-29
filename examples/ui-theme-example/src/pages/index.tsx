import React from 'react'
import { Anchor, Button } from '@dnb/eufemia'
import { Layout } from '@dnb/eufemia/extensions/forms'
import ChangeStyleTheme from '../../../shared/ChangeStyleTheme'
import { Link } from 'gatsby'

const App = () => {
  return (
    <Layout.Card space spacing="medium">
      <Layout.MainHeading>DNB UI</Layout.MainHeading>

      <Button icon="bell">Button</Button>

      <ChangeStyleTheme />

      <Anchor element={Link as any} to="/page-b#bottom">
        Page B
      </Anchor>
    </Layout.Card>
  )
}

export default App
