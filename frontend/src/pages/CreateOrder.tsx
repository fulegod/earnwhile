import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import SideNavBar from '../components/SideNavBar'
import ConnectWallet from '../components/ConnectWallet'
import { useUSDCBalance, useBestRate } from '../hooks/useContracts'
import { CONTRACTS, ERC20_ABI, ORDERBOOK_ABI } from '../config/contracts'

const strategies = [
  { id: 'vault', icon: 'account_balance', name: 'Base Vault', desc: 'Capital en el vault EarnWhile generando yield automático via AI Agent.' },
  { id: 'swap', icon: 'swap_horizontal_circle', name: 'Liquid Swap', desc: 'Auto-swap a stablecoin de mayor yield mientras espera.' },
  { id: 'wallet', icon: 'wallet', name: 'Wallet Hold', desc: 'El capital permanece en tu wallet hasta la ejecución.' },
]

export default function CreateOrder() {
  const { address, isConnected } = useAccount()
  const [limitPrice, setLimitPrice] = useState('2000')
  const [amount, setAmount] = useState('')
  const [expiry, setExpiry] = useState('7 Días')
  const [strategy, setStrategy] = useState('vault')

  const { data: usdcBalance, refetch: refetchBalance } = useUSDCBalance()
  const { data: bestRateData } = useBestRate()

  // Mint
  const { writeContract: doMint, data: mintHash, isPending: isMinting } = useWriteContract()
  const { isLoading: isMintConfirming, isSuccess: mintDone } = useWaitForTransactionReceipt({ hash: mintHash })

  // Approve
  const { writeContract: doApprove, data: approveHash, isPending: isApproving } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: approveDone } = useWaitForTransactionReceipt({ hash: approveHash })

  // Place order
  const { writeContract: doOrder, data: orderHash, isPending: isOrdering } = useWriteContract()
  const { isLoading: isOrderConfirming, isSuccess: orderDone } = useWaitForTransactionReceipt({ hash: orderHash })

  const formattedBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0'
  const bestApy = bestRateData ? Number((bestRateData as readonly [bigint, bigint])[1]) / 100 : 5.0
  const dailyYield = amount ? (parseFloat(amount) * bestApy / 100 / 365).toFixed(4) : '0.00'

  const handleMint = () => {
    if (!address) return
    doMint({
      address: CONTRACTS.MockUSDC,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [address, parseUnits('10000', 6)],
    })
  }

  // Contract math: lockAmount = buyAmount(18dec) * priceInUSDC(6dec) / 1e18
  // So: lockAmount = 1e18 * 2000e6 / 1e18 = 2000e6 = 2000 USDC
  // User inputs USDC amount → we calculate WETH amount = usdc / price
  // Price is passed in USDC decimals (6), NOT 18!
  // Approve OrderBook (not Vault) because OrderBook does transferFrom

  const handleApprove = () => {
    if (!amount) return
    doApprove({
      address: CONTRACTS.MockUSDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.OrderBook, parseUnits(amount, 6)],
    })
  }

  const handlePlaceOrder = () => {
    if (!amount || !limitPrice) return
    const priceNum = parseFloat(limitPrice)
    const usdcNum = parseFloat(amount)
    const wethAmount = usdcNum / priceNum // e.g. 1000 USDC / 2000 price = 0.5 WETH

    doOrder({
      address: CONTRACTS.OrderBook,
      abi: ORDERBOOK_ABI,
      functionName: 'placeBuyOrder',
      args: [
        CONTRACTS.MockWETH,
        CONTRACTS.MockUSDC,
        parseUnits(limitPrice, 6),          // price in USDC decimals (6)
        parseUnits(wethAmount.toFixed(18), 18), // WETH amount (18 decimals)
      ],
    })
  }

  // Refetch balance after mint
  if (mintDone) refetchBalance()

  // Flow state
  const needsApproval = !approveDone
  const needsOrder = approveDone && !orderDone

  return (
    <div className="bg-background font-body text-on-surface min-h-screen flex">
      <SideNavBar />

      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-background/70 backdrop-blur-3xl flex justify-end items-center px-4 lg:px-12 h-16 lg:h-20">
          <ConnectWallet />
        </header>

        <div className="pt-24 lg:pt-28 pb-24 px-4 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12">
          <div className="lg:col-span-8 space-y-20">
            {/* Step 1: Asset */}
            <section>
              <header className="mb-10">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Paso 01</span>
                <h1 className="text-4xl font-headline font-extrabold tracking-tight mt-2">Seleccionar Activo</h1>
                <p className="text-on-surface-variant mt-2 max-w-lg">Elige la liquidez que deseas desplegar en el ecosistema del protocolo.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group relative p-6 bg-surface-container-lowest border border-outline-variant/15 rounded-xl ring-2 ring-primary">
                  <div className="flex justify-between items-start mb-4">
                    <img src="/tokens/usdc.png" alt="USDC" className="w-12 h-12 rounded-full" />
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl">USDC</h3>
                  <p className="text-on-surface-variant text-sm mt-1">USD Coin · Stablecoin</p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10 flex justify-between">
                    <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Balance en Wallet</span>
                    <span className="text-sm font-semibold">
                      {isConnected ? parseFloat(formattedBalance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : 'Conectar wallet'}
                    </span>
                  </div>
                </div>
                <div className="group relative p-6 bg-surface-container-lowest border border-outline-variant/15 rounded-xl opacity-50">
                  <div className="flex justify-between items-start mb-4">
                    <img src="/tokens/eth.png" alt="WETH" className="w-12 h-12 rounded-full" />
                  </div>
                  <h3 className="font-headline font-bold text-xl">WETH</h3>
                  <p className="text-on-surface-variant text-sm mt-1">Wrapped Ether · Token</p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Próximamente</span>
                  </div>
                </div>
              </div>

              {/* Mint */}
              {isConnected && (
                <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-primary font-medium">Testnet — Mintear tokens de prueba gratis</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Balance: {parseFloat(formattedBalance).toLocaleString()} USDC
                      {mintDone && ' — Minteado exitosamente!'}
                    </p>
                  </div>
                  <button
                    onClick={handleMint}
                    disabled={isMinting || isMintConfirming}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 whitespace-nowrap"
                  >
                    {isMinting ? 'Firmando...' : isMintConfirming ? 'Confirmando...' : 'Mintear 10,000 USDC'}
                  </button>
                </div>
              )}
            </section>

            {/* Step 2: Parameters */}
            <section>
              <header className="mb-10">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Paso 02</span>
                <h2 className="text-4xl font-headline font-extrabold tracking-tight mt-2">Configurar Parámetros</h2>
              </header>
              <div className="space-y-12">
                <div className="p-8 bg-surface-container-low rounded-xl">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold block mb-4">
                    Precio Límite (USDC por WETH)
                  </label>
                  <div className="flex items-end gap-4">
                    <input
                      className="bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 text-6xl font-headline font-bold p-0 w-full max-w-[300px] transition-all outline-none"
                      placeholder="2000"
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                    />
                    <span className="text-2xl font-headline font-bold text-primary mb-1">USDC/WETH</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">info</span>
                    La orden se ejecuta cuando el precio de WETH alcanza este valor.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Cantidad USDC a Depositar</label>
                    <div className="relative">
                      <input
                        className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-4 text-2xl font-headline font-semibold focus:border-primary focus:ring-0 outline-none"
                        placeholder="0.00"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <button onClick={() => setAmount(formattedBalance)} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">MAX</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Expiración del Intent</label>
                    <select
                      className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 py-4 text-lg font-body focus:border-primary focus:ring-0 outline-none"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    >
                      <option>24 Horas</option>
                      <option>7 Días</option>
                      <option>30 Días</option>
                      <option>GTC (Hasta Cancelar)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3: Strategy */}
            <section>
              <header className="mb-10">
                <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface-variant font-semibold">Paso 03</span>
                <h2 className="text-4xl font-headline font-extrabold tracking-tight mt-2">Estrategia de Espera</h2>
                <p className="text-on-surface-variant mt-2">Define dónde descansa tu capital mientras espera el yield objetivo.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategies.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setStrategy(s.id)}
                    className={`p-6 bg-surface-container-lowest border border-outline-variant/15 rounded-xl cursor-pointer transition-all ${
                      strategy === s.id ? 'ring-2 ring-primary' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <span className={`material-symbols-outlined ${strategy === s.id ? 'text-primary' : 'text-on-surface-variant'} mb-4`}>{s.icon}</span>
                    <h4 className="font-headline font-bold">{s.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 mt-20 lg:mt-0">
            <div className="sticky top-32 space-y-6">
              <div className="p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl shadow-xl shadow-on-surface/[0.02]">
                <h3 className="font-headline font-extrabold text-xl mb-8">Resumen de Ejecución</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Activo', value: 'USDC' },
                    { label: 'Precio límite', value: `${limitPrice} USDC/WETH` },
                    { label: 'Mejor APY disponible', value: `${bestApy.toFixed(1)}%`, highlight: true },
                    { label: 'Yield diario estimado', value: `$${dailyYield}`, highlight: true },
                    { label: 'Estrategia de espera', value: strategies.find((s) => s.id === strategy)?.name || '' },
                    { label: 'Fee de Red', value: '~0.02 AVAX' },
                    { label: 'Fee del Protocolo', value: '10% del yield' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center pb-4 border-b border-outline-variant/10">
                      <span className="text-on-surface-variant text-sm">{item.label}</span>
                      <span className={`font-bold ${item.highlight ? 'text-primary' : ''}`}>{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-between items-baseline">
                    <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold">Valor Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-headline font-bold">{amount || '0.00'}</div>
                      <div className="text-xs text-on-surface-variant uppercase font-medium">USDC Tokens</div>
                    </div>
                  </div>
                </div>

                {orderDone ? (
                  <div className="mt-10 p-4 bg-primary/10 rounded-xl text-center">
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">check_circle</span>
                    <p className="font-headline font-bold text-primary">Orden Creada</p>
                    <p className="text-xs text-on-surface-variant mt-1">Tu capital está generando yield mientras espera.</p>
                    {orderHash && (
                      <a href={`https://testnet.snowtrace.io/tx/${orderHash}`} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-2 block">
                        Ver en SnowTrace
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!isConnected || !amount || isOrdering || isOrderConfirming}
                    className="w-full mt-10 bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-xl font-headline font-bold text-lg hover:brightness-105 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {isOrdering ? 'Firmando orden...' : isOrderConfirming ? 'Confirmando en Fuji...' : 'Ejecutar Intent'}
                  </button>
                )}

                <p className="text-[10px] text-center text-on-surface-variant mt-6 uppercase tracking-widest leading-relaxed">
                  Paso 1: aprobar tokens. Paso 2: crear la orden on-chain.
                </p>
              </div>

              <div className="p-6 bg-surface-container border border-outline-variant/20 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">shield</span>
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-wider font-bold">Contratos Verificados</p>
                  <p className="text-[11px] text-on-surface-variant">Desplegados en Avalanche Fuji Testnet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}
