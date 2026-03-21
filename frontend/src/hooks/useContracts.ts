import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { CONTRACTS, VAULT_ABI, ORDERBOOK_ABI, YIELD_ROUTER_ABI, ERC20_ABI } from '../config/contracts'

export function useUSDCBalance() {
  const { address } = useAccount()
  return useReadContract({
    address: CONTRACTS.MockUSDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  })
}

export function useVaultBalance(token: `0x${string}`) {
  const { address } = useAccount()
  return useReadContract({
    address: CONTRACTS.EarnWhileVault,
    abi: VAULT_ABI,
    functionName: 'getUserBalance',
    args: address ? [address, token] : undefined,
    query: { enabled: !!address },
  })
}

export function useBestRate() {
  return useReadContract({
    address: CONTRACTS.YieldRouter,
    abi: YIELD_ROUTER_ABI,
    functionName: 'getBestRate',
    args: [CONTRACTS.MockUSDC],
  })
}

export function useActiveOrders() {
  const { address } = useAccount()
  return useReadContract({
    address: CONTRACTS.OrderBook,
    abi: ORDERBOOK_ABI,
    functionName: 'getActiveOrders',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  })
}

export { formatUnits, parseUnits }
