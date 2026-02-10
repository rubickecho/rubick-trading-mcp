# 统一账户 Schema（稳定币本位）

范围
- 仅账户数据（OKX / Binance USD-M / Hyperliquid）
- “U 本位”= 稳定币本位（USDT/USDC）

通用字段
- exchange: 'okx' | 'binance' | 'hyperliquid'
- accountType: 'swap' | 'future'
- marginCcy: 'USDT' | 'USDC'
- settleCcy: 'USDT' | 'USDC'
- timestamp: ISO8601 string

get_balance.normalized
- assets: Array<
  - ccy: string
  - free: number
  - used: number
  - total: number
  - usdValue?: number
  >

get_positions.normalized
- positions: Array<
  - instId: string
  - symbol: string
  - side: 'long' | 'short'
  - size: number
  - entryPrice: number
  - markPrice?: number
  - liqPrice?: number
  - unrealizedPnl?: number
  - leverage?: number
  - marginMode?: 'cross' | 'isolated'
  - notional?: number
  >

get_pending_orders.normalized
- orders: Array<
  - orderId: string
  - instId: string
  - symbol: string
  - side: 'buy' | 'sell'
  - type: 'limit' | 'market' | 'post_only' | 'ioc' | 'fok'
  - price?: number
  - size: number
  - filled?: number
  - status: 'open' | 'closed' | 'canceled'
  - createTime: ISO8601 string
  >

get_history_orders.normalized
- orders: Array<
  - orderId: string
  - instId: string
  - symbol: string
  - side: 'buy' | 'sell'
  - type: 'limit' | 'market' | 'post_only' | 'ioc' | 'fok'
  - price?: number
  - size: number
  - filled?: number
  - status: 'open' | 'closed' | 'canceled'
  - createTime: ISO8601 string
  - updateTime?: ISO8601 string
  >

备注
- raw 数据保留在 structuredContent.raw
- normalized 字段只做基础转换，不做主观分析
- 分页字段应作为工具输入（since/limit/cursor）
