import React from 'react'
import styled from 'styled-components'

import { Textfield } from '../../../common'

const Wrapper = styled.div`
  position: relative;
  span {
    position: absolute;
    left: 17px;
    top: 10px;
    opacity: 0.5;
  }
`

const SearchTextField = styled(Textfield)`
  height: 40px;
  border-radius: 100px;
  padding-left: 36px;
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
