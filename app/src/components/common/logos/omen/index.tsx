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
      <div className="logo">
        <span aria-label="wizard" role="img">
          🧙‍♂️
        </span>
        {"·"}
        <span>Merlin</span>
      </div>
    </Wrapper>
  )
}
