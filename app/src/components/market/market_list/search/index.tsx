import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../../common'

const Wrapper = styled.div`
  position: relative;
  width: 400px;
  span {
    position: absolute;
    left: 17px;
    top: 8px;
    opacity: 0.5;
    font-size: 16px;
  }
`

const SearchTextField = styled(Textfield)`
  height: 40px;
  border-radius: 100px;
  padding-left: 40px;
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
