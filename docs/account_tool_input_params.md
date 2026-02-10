# 账户工具输入参数（统一版）

范围
- 账户工具：get_balance、get_positions、get_pending_orders、get_history_orders
- 交易所：OKX、Binance USD-M、Hyperliquid
- 稳定币本位（USDT/USDC）

通用字段（所有工具）
- exchange: 'okx' | 'binance' | 'hyperliquid'
- symbol?: string        // 统一 symbol，例如 BTC/USDT
- instId?: string        // 交易所 instId，例如 BTC-USDT-SWAP
- marginCcy?: 'USDT' | 'USDC'
- settleCcy?: 'USDT' | 'USDC'
- since?: number         // ms 时间戳
- end?: number           // ms 时间戳
- limit?: number
- cursor?: string
- extra?: Record<string, any> // 交易所专用参数

工具级建议

get_balance
- 推荐不传 symbol/instId（返回全量账户）
- OKX：balance 支持 ccy 过滤；只有明确指定时才做映射
- Binance USD-M：balance 返回资产列表；recvWindow 放在 extra
- Hyperliquid：balance 来自 clearinghouseState；需要 extra.user（地址）

get_positions
- symbol/instId 可选（按交易所支持过滤）
- OKX：支持 instId 过滤
- Binance USD-M：支持 symbol 过滤
- Hyperliquid：positions 来自 clearinghouseState；客户端过滤

get_pending_orders
- OKX：orders-pending 支持 instId
- Binance USD-M：openOrders 支持 symbol（可选）
- Hyperliquid：openOrders 需要 user；不支持 symbol 过滤（客户端过滤）

get_history_orders
- OKX：orders-history 支持 instId 与时间范围
- Binance USD-M：allOrders 需要 symbol（必填）+ 时间范围
- Hyperliquid：userFills/userFillsByTime 需要 user + 时间范围/limit

交易所差异说明
- Binance USD-M 所有 signed 端点需 timestamp + signature；recvWindow 可放 extra
- OKX 需 access headers
- Hyperliquid info 端点使用 POST {type, user}

推荐校验规则
- exchange 必填
- exchange == 'binance' 时，get_history_orders 必须传 symbol
- exchange == 'hyperliquid' 时，所有账户工具必须传 extra.user（地址）
- exchange == 'okx' 时，instId 可选；不传则返回全量

