import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../../common'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  span {
    position: absolute;
    left: 20px;
    top: 12px;
    opacity: 0.5;
    font-size: 18px;
  }
`

const SearchTextField = styled(Textfield)`
  height: 48px;
  border-radius: 100px;
  padding-left: 47px;
`

interface Props {
  onChange: (title: string) => void
  value: string
}

export const Search = (props: Props) => {
  const { onChange, value } = props

  return (
    <Wrapper>
      <span aria-label="search" role="img">
        🔍
      </span>
      <SearchTextField onChange={e => onChange(e.target.value)} placeholder="Search markets" value={value} />
    </Wrapper>
  )
}
