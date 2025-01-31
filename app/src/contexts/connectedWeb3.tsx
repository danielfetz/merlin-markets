import { providers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useWeb3Context } from 'web3-react'

import { ConnectedBalance, useBalance } from '../hooks'
import { useCpk } from '../hooks/cpk/useCpk'
import { useSafeApp } from '../hooks/useSafeApp'
import { CPKService } from '../services'
import connectors from '../util/connectors'
import { getRelayProvider } from '../util/cpk'
import { getLogger } from '../util/logger'
import { networkIds } from '../util/networks'
import { TransactionStep } from '../util/types'

const logger = getLogger('Hooks::ConnectedWeb3')

export interface ConnectedWeb3Context {
  account: Maybe<string>
  library: providers.Web3Provider
  networkId: number
  rawWeb3Context: any
  relay: boolean
  cpk: Maybe<CPKService>
  balances: ConnectedBalance
  toggleRelay: () => void
  txHash: string
  txState: TransactionStep
  setTxHash: (arg0: string) => void
  setTxState: (step: TransactionStep) => void
}

const ConnectedWeb3Context = React.createContext<Maybe<ConnectedWeb3Context>>(null)

/**
 * This hook can only be used by components under the `ConnectedWeb3` component. Otherwise it will throw.
 */
export const useConnectedWeb3Context = () => {
  const context = React.useContext(ConnectedWeb3Context)

  if (!context) {
    throw new Error('Component rendered outside the provider tree')
  }

  return context
}
interface Props {
  children?: React.ReactNode
}
/**
 * Component used to render components that depend on Web3 being available. These components can then
 * `useConnectedWeb3Context` safely to get web3 stuff without having to null check it.
 */
export const ConnectedWeb3: React.FC<Props> = (props: Props) => {
  const [connection, setConnection] = useState<ConnectedWeb3Context | null>(null)
  const [networkId, setNetworkId] = useState<number | null>(null)
  const [txState, setTxState] = useState<TransactionStep>(TransactionStep.idle)
  const [txHash, setTxHash] = useState('')
  const safeAppInfo = useSafeApp()
  const context = useWeb3Context()

  const { account, active, error, library } = context

  const cpk = useCpk(connection)
  const balances = useBalance(connection)

  useEffect(() => {
    async function switchNetwork() {
      if (library && account && connection?.networkId === 1) {
        try {
          await library.send('wallet_switchEthereumChain', [{ chainId: '0x64' }])
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if ('code' in (switchError as any) && (switchError as any).code === 4902) {
            try {
              await library.send('wallet_addEthereumChain', [
                {
                  chainId: '0x64',
                  rpcUrls: ['https://rpc.gnosischain.com/'],
                  chainName: 'Gnosis Chain',
                  nativeCurrency: {
                    name: 'xDAI',
                    symbol: 'xDAI',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://gnosis.blockscout.com/'],
                },
              ])
            } catch (addError) {
              console.error(addError)
            }
          }
        }
      }
    }

    switchNetwork()
  }, [library, account, connection])

  const rpcAddress: string | null = localStorage.getItem('rpcAddress')

  const [relay, setRelay] = useState(false)
  const toggleRelay = () => {
    setRelay(!relay)
  }

  // debug particular address and network id
  const url = new URL(window.location.href.replace('#', ''))
  const debugAddress = url.searchParams.get('debugAddress')
  const debugNetworkId = url.searchParams.get('debugNetworkId')

  useEffect(() => {
    if (networkId && !error) {
      const enableRelay = context.connectorName !== 'Safe' || debugAddress !== ''

      const { address, isRelay, netId, provider } = getRelayProvider(relay && enableRelay, networkId, library, account)

      const value = {
        account: address || null,
        library: provider,
        networkId: netId,
        rawWeb3Context: context,
        relay: isRelay,
        cpk,
        balances,
        toggleRelay,
        txHash,
        txState,
        setTxHash,
        setTxState,
      }

      setConnection(value)
    }
    // eslint-disable-next-line
  }, [relay, networkId, context, library, account, txHash, txState])

  useEffect(() => {
    let isSubscribed = true
    const connector = localStorage.getItem('CONNECTOR')

    if (error) {
      logger.log(error.message)
      localStorage.removeItem('CONNECTOR')
      context.setConnector('Infura')
    } else if (safeAppInfo) {
      if (context.connectorName !== 'Safe') {
        localStorage.removeItem('CONNECTOR')
        const netId = (networkIds as any)[safeAppInfo.network.toUpperCase()]
        connectors.Safe.init(safeAppInfo.safeAddress, netId)
        context.setConnector('Safe')
      }
    } else if (connector && connector in connectors) {
      if (context.connectorName !== connector) {
        context.setConnector(connector)
      }
    } else {
      context.setConnector('Infura')
    }

    if (debugAddress) {
      connectors.Safe.init(debugAddress, debugNetworkId ? Number(debugNetworkId) : 1)
      context.setConnector('Safe')
    }

    // disabled block tracker
    if (context.connector) {
      if (
        context.connector.engine &&
        context.connector.engine._blockTracker &&
        context.connector.engine._blockTracker._isRunning
      ) {
        context.connector.engine.stop()
      }
      if (connector === 'WalletConnect' && context.connector.connect && context.connector.connect._running) {
        context.connector.connect.stop()
      }
    }

    const checkIfReady = async () => {
      const network = await library.ready
      if (isSubscribed) setNetworkId(network.chainId)
    }

    if (library) {
      checkIfReady()
    }

    return () => {
      isSubscribed = false
    }
  }, [context, library, active, error, networkId, safeAppInfo, rpcAddress, debugAddress, debugNetworkId])

  if (
    !networkId ||
    !library ||
    !connection ||
    (connection.account && !cpk) ||
    (connection.account && connection.networkId !== cpk?.provider?.network?.chainId) ||
    !balances.fetched
  ) {
    return null
  }

  const value = {
    ...connection,
    cpk,
    balances,
  }

  return <ConnectedWeb3Context.Provider value={value}>{props.children}</ConnectedWeb3Context.Provider>
}

export const WhenConnected: React.FC<Props> = props => {
  const { account } = useConnectedWeb3Context()

  return <>{account && props.children}</>
}
