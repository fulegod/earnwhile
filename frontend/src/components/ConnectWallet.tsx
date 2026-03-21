import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="text-xs text-on-surface-variant hover:text-error transition-colors font-medium"
        >
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        const metamask = connectors.find(c => c.name === 'MetaMask') || connectors[0]
        if (metamask) connect({ connector: metamask })
      }}
      className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-all active:scale-95"
    >
      Conectar Wallet
    </button>
  )
}
