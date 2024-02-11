import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  .logo {
    font-size: 19px;
    font-weight: 500;
    color: #333;
  }
`

export const OmenLogo = () => {
  return (
    <Wrapper>
      <div className="logo"><span role="img" aria-label="wizard">🧙‍♂️</span> Merlin</div>
    </Wrapper>
  )
}
