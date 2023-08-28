import React from 'react'
import './src/StyleImporter'

export const wrapRootElement = ({ element }) => {
  return (
    <>
      <Mounted />
      {element}
    </>
  )
}

const Mounted = () => {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-remote-mounted', '1')
  })
  return null
}
