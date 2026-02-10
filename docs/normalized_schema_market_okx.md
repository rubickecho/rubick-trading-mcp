# 统一行情 Schema（仅 OKX）

范围
- OKX 行情工具
- 稳定币本位永续（USDT），后续可扩展 USDC

通用字段
- exchange: 'okx'
- instId: string
- symbol: string
- timestamp: ISO8601 string

get_ticker.normalized
- last: number
- bid: number
- ask: number
- high24h: number
- low24h: number
- vol24h: number

get_candles.normalized
- candles: Array<
  - timestamp: ISO8601
  - open: number
  - high: number
  - low: number
  - close: number
  - volume: number
  - isComplete?: boolean
  >

get_order_book.normalized
- bids: Array<[price, size]>
- asks: Array<[price, size]>
- depth: number

get_funding_rate.normalized
- fundingRate: number
- nextFundingRate?: number
- fundingTime?: ISO8601

get_open_interest.normalized（可选）
- openInterest: number
- openInterestCcy?: number
- openInterestUsd?: number

备注
- raw 数据保留在 structuredContent.raw
- normalized 仅做基础转换，不做主观分析
