import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ConnectedWeb3Context } from '../../../contexts'
import { getLogger } from '../../../util/logger'
import { networkIds } from '../../../util/networks'
import { RemoteData } from '../../../util/remote_data'
import {
  CategoryDataItem,
  CurationSource,
  MarketFilters,
  MarketMakerDataItem,
  MarketStates,
  MarketsSortCriteria,
} from '../../../util/types'
import { ButtonRound } from '../../button'
import {
  Dropdown,
  DropdownDirection,
  DropdownItemProps,
  DropdownPosition,
  DropdownVariant,
} from '../../common/form/dropdown'
import { IconFilter } from '../../common/icons/IconFilter'
import { InlineLoading } from '../../loading'
import { ListCard } from '../common_sections/list/list_card'
import { ListItem } from '../common_sections/list/list_item'

import { AdvancedFilters } from './advanced_filters'
import { Search } from './search'

const InfoCardsOverview = styled.div`
  max-width: 100%;
  display: grid;
  overflow-x: scroll;
  padding-bottom: 32px;
  scroll-padding-left: 2.5rem;
  scroll-padding-right: 2.5rem;
  grid-auto-flow: row;

  @media (min-width: 1060px) {
    grid-template-columns: repeat(5, 310px);
    gap: 16px;
  }

  @media (max-width: 1059px) {
    grid-template-columns: repeat(5, 310px);
    gap: 16px;
  }
`

const InfoCard = styled.div`
  border-radius: 10px;
  width: 100%;
  justify-content: space-between;
  display: flex;
  min-height: 220px;
  border: 1px solid #efeff9;
`

const ActionInfo = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 0;
  border-radius: 9px;
  width: 100%;
`

const ActionInfoTitle = styled.div`
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
`

const ActionInfoDescription = styled.div`
  font-size: 16px;
`

const ActionInfoButton = styled.div`
  font-size: 15px;
  font-weight: 700;
  background: #00000030;
  padding: 8px 17px;
  width: fit-content;
  border-radius: 20px;
  margin-top: 10px;
`

const TopContents = styled.div`
  padding: 0px;
`

const FiltersWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding-bottom: 20px;

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    flex-direction: column;
  }
`

const FiltersControls = styled.div<{ disabled?: boolean }>`
  align-items: center;
  display: flex;
  margin-right: auto;
  pointer-events: ${props => (props.disabled ? 'none' : 'initial')};

  @media (min-width: ${props => props.theme.themeBreakPoints.sm}) {
    margin-left: 0;
    margin-right: 0;
    padding-left: 10px;
  }
`

const ButtonRoundStyled = styled(ButtonRound)<{
  disabled?: boolean
}>`
  width: auto;
  color: ${({ theme }) => theme.colors.textColorDark};
  svg {
    filter: ${props =>
      props.disabled
        ? 'invert(46%) sepia(0%) saturate(1168%) hue-rotate(183deg) brightness(99%) contrast(89%)'
        : 'none'};
  }
`

const FilterBadgeLabel = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.clickable};
  color: ${({ theme }) => theme.colors.mainBodyBackground};
  font-size: ${({ theme }) => theme.fonts.defaultSize};
  line-height: 16px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ButtonFilterStyled = styled(ButtonRoundStyled as any)`
  padding: 0 17px;
  span {
    font-size: 16px;
    line-height: 16px;
  }
  & > * + * {
    margin-left: 10px;
  }
  & > svg {
    width: 24px;
    height: 24px;
  }
`

const ListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
`

const NoMarketsAvailable = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const NoOwnMarkets = styled.p`
  color: ${props => props.theme.colors.textColor};
  font-size: 14px;
  margin: auto 0;
  text-align: center;
`

const LoadMoreWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 0 25px 0 15px;

  & > * + * {
    margin-left: 12px;
  }
`

const CustomDropdownItem = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  .dropdownItems & .sortBy {
    display: none;
  }
`

const SortDropdown = styled(Dropdown)`
  min-width: 170px;
  background: transparent;
  border: 0;
`

const MarketsDropdown = styled(Dropdown)`
  width: fit-content;
  background: transparent;
  border: 0;
`

const MarketsFilterDropdown = styled(Dropdown)`
  width: 100%;
  background: transparent;
  border: 0;
`

const BottomContents = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20px 0px 25px 0px;
`

const FiltersLeftWrapper = styled.div`
  display: flex;
  width: 100%;
  & > * + * {
    margin-left: 10px;
  }
`

export const sortOptions = [
  {
    title: '24h volume',
    sortBy: `sort24HourVolume${Math.floor(Date.now() / (1000 * 60 * 60)) % 24}` as MarketsSortCriteria,
    direction: 'desc',
  },
  {
    title: 'Total volume',
    sortBy: 'usdVolume',
    direction: 'desc',
  },
  {
    title: 'Highest liquidity',
    sortBy: 'usdLiquidityParameter',
    direction: 'desc',
  },
  {
    title: 'Newest',
    sortBy: 'creationTimestamp',
    direction: 'desc',
  },
  {
    title: 'Closing soon',
    sortBy: 'openingTimestamp',
    direction: 'asc',
  },
] as const

export const myMarketsSortOptions = [
  {
    title: 'Newest',
    sortBy: 'creationTimestamp',
    direction: 'desc',
  },
  {
    title: 'Ended recently',
    sortBy: 'openingTimestamp',
    direction: 'desc',
  },
  {
    title: 'Ending soon',
    sortBy: 'openingTimestamp',
    direction: 'asc',
  },
] as const

interface Props {
  context: ConnectedWeb3Context
  count: number
  currentFilter: any
  isFiltering?: boolean
  fetchMyMarkets: boolean
  markets: RemoteData<MarketMakerDataItem[]>
  categories: RemoteData<CategoryDataItem[]>
  moreMarkets: boolean
  pageIndex: number
  onFilterChange: (filter: MarketFilters) => void
  onLoadNextPage: () => void
  onLoadPrevPage: () => void
}

const logger = getLogger('MarketHome')

export const MarketHome: React.FC<Props> = (props: Props) => {
  const {
    categories,
    context,
    count,
    currentFilter,
    fetchMyMarkets,
    isFiltering = false,
    markets,
    moreMarkets,
    onFilterChange,
    onLoadNextPage,
    onLoadPrevPage,
    pageIndex,
  } = props
  const [counts, setCounts] = useState({
    open: 0,
    closed: 0,
    total: 0,
  })
  const [state, setState] = useState<MarketStates>(currentFilter.state)
  const [category, setCategory] = useState(currentFilter.category)
  const [title, setTitle] = useState(currentFilter.title)
  const [sortIndex, setSortIndex] = useState(currentFilter.sortIndex)
  const [sortBy, setSortBy] = useState<Maybe<MarketsSortCriteria>>(currentFilter.sortBy)
  const [sortByDirection, setSortByDirection] = useState<'asc' | 'desc'>(currentFilter.sortByDirection)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(
    currentFilter.currency || currentFilter.arbitrator || currentFilter.curationSource !== CurationSource.ALL_SOURCES,
  )
  const [arbitrator, setArbitrator] = useState<Maybe<string>>(currentFilter.arbitrator)
  const [currency, setCurrency] = useState<Maybe<string> | null>(currentFilter.currency)
  const [templateId, setTemplateId] = useState<Maybe<string>>(currentFilter.templateId)
  const [curationSource, setCurationSource] = useState<CurationSource>(currentFilter.curationSource)

  const advancedFilterSelectedCount = [currency, arbitrator, curationSource !== CurationSource.ALL_SOURCES].filter(
    element => element,
  ).length

  const filters = [
    {
      state: MarketStates.open,
      title: 'Open',
      active: state === MarketStates.open,
      onClick: () => {
        setState(MarketStates.open)
        setSortIndex(2)
        setSortBy('usdLiquidityParameter')
      },
    },
    {
      state: MarketStates.pending,
      title: 'Pending',
      active: state === MarketStates.pending,
      onClick: () => setState(MarketStates.pending),
    },
    {
      state: MarketStates.finalizing,
      title: 'Finalizing',
      active: state === MarketStates.finalizing,
      onClick: () => setState(MarketStates.finalizing),
    },
    {
      state: MarketStates.arbitrating,
      title: 'Arbitrating',
      active: state === MarketStates.arbitrating,
      onClick: () => setState(MarketStates.arbitrating),
    },
    {
      state: MarketStates.closed,
      title: 'Closed',
      active: state === MarketStates.closed,
      onClick: () => setState(MarketStates.closed),
    },
  ]

  // Only allow to filter myMarkets when the user is connected
  if (context.account) {
    filters.push({
      state: MarketStates.myMarkets,
      title: 'My Markets',
      active: state === MarketStates.myMarkets,
      onClick: () => {
        setState(MarketStates.myMarkets)
        setSortIndex(1)
        setSortBy('openingTimestamp')
        setSortByDirection('desc')
      },
    })
  }

  useEffect(() => {
    if (state === MarketStates.myMarkets && !context.account) {
      logger.log(`User disconnected, update filter`)
      setState(MarketStates.open)
    }
  }, [context.account, state])

  useEffect(() => {
    if (RemoteData.hasData(categories)) {
      const index = categories.data.findIndex(i => i.id === decodeURI(category))
      const item = categories.data[index]
      !!item && setCounts({ open: item.numOpenConditions, closed: item.numClosedConditions, total: item.numConditions })
      if (category === 'All') setCounts({ open: 0, closed: 0, total: 0 })
    }
  }, [category, categories])

  useEffect(() => {
    onFilterChange({
      arbitrator,
      curationSource,
      templateId,
      currency,
      category,
      sortIndex,
      sortBy,
      sortByDirection,
      state,
      title,
    })
  }, [
    arbitrator,
    curationSource,
    templateId,
    currency,
    category,
    sortIndex,
    sortBy,
    sortByDirection,
    state,
    title,
    onFilterChange,
  ])

  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = true
    } else {
      setShowAdvancedFilters(
        currentFilter.currency ||
          currentFilter.arbitrator ||
          currentFilter.curationSource !== CurationSource.ALL_SOURCES,
      )
    }
  }, [currentFilter, fetchMyMarkets])

  const toggleFilters = useCallback(() => {
    setShowAdvancedFilters(!showAdvancedFilters)
  }, [showAdvancedFilters])

  const sortItems: Array<DropdownItemProps> = sortOptions.map((item, i) => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortIndex(i)
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const myMarketsSortItems: Array<DropdownItemProps> = myMarketsSortOptions.map((item, i) => {
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      onClick: () => {
        setSortIndex(i)
        setSortBy(item.sortBy)
        setSortByDirection(item.direction)
      },
    }
  })

  const filterItems: Array<DropdownItemProps> = filters.map((item, index) => {
    const count = index === 0 ? counts.open : index === 3 ? counts.closed : 0
    return {
      content: <CustomDropdownItem>{item.title}</CustomDropdownItem>,
      secondaryText: count > 0 && count.toString(),
      onClick: item.onClick,
    }
  })

  const categoryItems: Array<DropdownItemProps> =
    RemoteData.hasData(categories) && categories.data.length > 0
      ? ([
          {
            content: <CustomDropdownItem>{'All Categories'}</CustomDropdownItem>,
            onClick: () => {
              setCategory('All')
            },
          },
          ...categories.data.map((item: CategoryDataItem) => {
            return {
              content: <CustomDropdownItem>{item.id}</CustomDropdownItem>,
              onClick: () => {
                setCategory(item.id)
              },
            }
          }),
        ] as Array<DropdownItemProps>)
      : [
          {
            content: <CustomDropdownItem>{'All Categories'}</CustomDropdownItem>,
          },
        ]

  const noOwnMarkets = RemoteData.is.success(markets) && markets.data.length === 0 && state === MarketStates.myMarkets
  const noMarketsAvailable =
    RemoteData.is.success(markets) && markets.data.length === 0 && state !== MarketStates.myMarkets
  const showFilteringInlineLoading =
    (!noMarketsAvailable && !noOwnMarkets && isFiltering) ||
    RemoteData.is.loading(markets) ||
    RemoteData.is.reloading(markets)
  const disableLoadNextButton = !moreMarkets || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)
  const disableLoadPrevButton = pageIndex === 0 || RemoteData.is.loading(markets) || RemoteData.is.reloading(markets)

  return (
    <>
      <InfoCardsOverview>
        <InfoCard
          style={{
            background: '#fff4e4',
            backgroundImage:
              'url("https://d1m1s6un1a8qgj.cloudfront.net/static/dashboard/first-step-card-pattern-3.svg")',
          }}
        >
          <ActionInfo
            style={{
              borderTop: '9px solid #f9bd61',
            }}
          >
            <ActionInfoTitle>How Merlin works</ActionInfoTitle>
            <ActionInfoDescription>How can you bet? How will you get paid out?</ActionInfoDescription>
            <ActionInfoButton
              style={{
                background: '#f9bd61',
              }}
            >
              View FAQ
            </ActionInfoButton>
          </ActionInfo>
        </InfoCard>
        <InfoCard
          style={{
            background: '#f9f6ff',
            backgroundImage:
              'url("https://d1m1s6un1a8qgj.cloudfront.net/static/dashboard/first-step-card-pattern-2.svg")',
          }}
        >
          <ActionInfo
            style={{
              borderTop: '9px solid #d4c7f2',
            }}
          >
            <ActionInfoTitle>2024 Presidential Election</ActionInfoTitle>
            <ActionInfoDescription>Who will get elected?</ActionInfoDescription>
            <ActionInfoButton
              style={{
                background: '#d4c7f2',
              }}
            >
              Bet now
            </ActionInfoButton>
          </ActionInfo>
        </InfoCard>
        <InfoCard
          style={{
            background: 'linear-gradient(to right, rgb(98, 92, 164) 0%, rgb(140, 117, 205) 100%)',
          }}
        >
          <ActionInfo
            style={{
              borderTop: '9px solid #f9bd61',
            }}
          >
            <ActionInfoTitle>Ethereum ETF</ActionInfoTitle>
            <ActionInfoDescription>Approved by June 30?</ActionInfoDescription>
            <ActionInfoButton>Bet now</ActionInfoButton>
          </ActionInfo>
        </InfoCard>
        <InfoCard
          style={{
            background: 'linear-gradient(87deg, rgb(9, 134, 181) 0%, rgb(7, 208, 124) 100%)',
          }}
        >
          <ActionInfo>
            <ActionInfoTitle>SafeDAO</ActionInfoTitle>
            <ActionInfoDescription>Wen token transferable? How many Safes created in 2024?</ActionInfoDescription>
            <ActionInfoButton>View more</ActionInfoButton>
          </ActionInfo>
        </InfoCard>
        <InfoCard style={{ background: 'linear-gradient(87deg, rgb(9, 134, 181) 0%, rgb(7, 208, 124) 100%)' }} />
      </InfoCardsOverview>
      <ListCard>
        <TopContents>
          <FiltersWrapper>
            <FiltersLeftWrapper>
              <Search onChange={setTitle} value={title} />
            </FiltersLeftWrapper>
            <FiltersControls>
              <MarketsDropdown
                currentItem={
                  RemoteData.hasData(categories) ? categories.data.findIndex(i => i.id === decodeURI(category)) + 1 : 0
                }
                dirty={true}
                dropdownDirection={DropdownDirection.downwards}
                dropdownVariant={DropdownVariant.card}
                items={categoryItems}
              />
              <MarketsFilterDropdown
                currentItem={filters.findIndex(i => i.state === state)}
                dirty={true}
                dropdownDirection={DropdownDirection.downwards}
                dropdownVariant={DropdownVariant.card}
                items={filterItems}
              />
              <SortDropdown
                currentItem={
                  fetchMyMarkets
                    ? myMarketsSortOptions.findIndex((item, i) => i == sortIndex)
                    : sortOptions.findIndex((item, i) => i == sortIndex)
                }
                dirty={true}
                dropdownPosition={DropdownPosition.center}
                items={fetchMyMarkets ? myMarketsSortItems : sortItems}
              />
              <ButtonFilterStyled active={showAdvancedFilters} onClick={toggleFilters}>
                {advancedFilterSelectedCount > 0 ? (
                  <FilterBadgeLabel>{advancedFilterSelectedCount}</FilterBadgeLabel>
                ) : (
                  <IconFilter />
                )}
                <span>Filters</span>
              </ButtonFilterStyled>
            </FiltersControls>
          </FiltersWrapper>
        </TopContents>
        {showAdvancedFilters && (
          <AdvancedFilters
            arbitrator={arbitrator}
            curationSource={curationSource}
            currency={currency}
            disableCurationFilter={
              fetchMyMarkets || context.networkId === networkIds.XDAI || context.relay ? true : false
            }
            onChangeArbitrator={setArbitrator}
            onChangeCurationSource={setCurationSource}
            onChangeCurrency={setCurrency}
            onChangeTemplateId={setTemplateId}
          />
        )}
        <ListWrapper>
          {!isFiltering &&
            RemoteData.hasData(markets) &&
            RemoteData.is.success(markets) &&
            markets.data.length > 0 &&
            markets.data.slice(0, count).map(item => {
              return <ListItem currentFilter={currentFilter} key={item.address} market={item}></ListItem>
            })}
          {noOwnMarkets && <NoOwnMarkets>You have not created or participated in any markets yet.</NoOwnMarkets>}
          {noMarketsAvailable && <NoMarketsAvailable>No markets available.</NoMarketsAvailable>}
          {showFilteringInlineLoading && <InlineLoading message="Loading Markets..." />}
        </ListWrapper>
        <BottomContents>
          <LoadMoreWrapper>
            <ButtonRoundStyled disabled={disableLoadPrevButton} onClick={onLoadPrevPage}>
              Prev
            </ButtonRoundStyled>
            <ButtonRoundStyled disabled={disableLoadNextButton} onClick={onLoadNextPage}>
              Next
            </ButtonRoundStyled>
          </LoadMoreWrapper>
        </BottomContents>
      </ListCard>
    </>
  )
}
