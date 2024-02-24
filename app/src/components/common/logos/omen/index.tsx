import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  .logo {
    font-size: 20px;
    font-weight: 800;
    color: #333;
  }
  .text {
    margin-left: 4px;
  }
`

export const OmenLogo = () => {
  return (
    <Wrapper>
      <div className="logo">
        <span aria-label="wizard" role="img">
          🧙‍♂️
        </span>
        <span className="text">Merlin</span>
      </div>
    </Wrapper>
  )
}
