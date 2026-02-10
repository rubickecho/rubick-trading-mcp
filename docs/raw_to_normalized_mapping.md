# Raw -> Normalized 映射表（账户数据）

范围
- OKX / Binance USD-M / Hyperliquid
- 仅稳定币本位

说明
- raw.*：交易所原始字段
- norm.*：统一字段

================================================================================
OKX
================================================================================

get_balance
- norm.assets[].ccy           <- raw.data[].details[].ccy
- norm.assets[].free          <- raw.data[].details[].availEq
- norm.assets[].used          <- raw.data[].details[].frozenBal（或 eq - availEq）
- norm.assets[].total         <- raw.data[].details[].eq
- norm.marginCcy / settleCcy  <- 若 ccy 为 USDT/USDC
- norm.timestamp              <- raw.data[].uTime

备注
- OKX balance 返回数组，每个账户包含多币种详情。
- 字段名称以官方文档为准（eq、availEq、frozenBal、uTime）。

get_positions
- norm.positions[].instId      <- raw.data[].instId
- norm.positions[].symbol      <- convert instId（例如 BTC-USDT-SWAP -> BTC/USDT）
- norm.positions[].side        <- raw.data[].posSide（long/short）
- norm.positions[].size        <- raw.data[].pos
- norm.positions[].entryPrice  <- raw.data[].avgPx
- norm.positions[].markPrice   <- raw.data[].markPx
- norm.positions[].liqPrice    <- raw.data[].liqPx
- norm.positions[].unrealizedPnl <- raw.data[].upl
- norm.positions[].leverage    <- raw.data[].lever
- norm.positions[].marginMode  <- raw.data[].mgnMode
- norm.positions[].notional    <- raw.data[].notionalUsd（如存在）
- norm.marginCcy / settleCcy   <- raw.data[].ctValCcy 或 raw.data[].settleCcy
- norm.timestamp               <- raw.data[].uTime

备注
- posSide 需归一化为 long/short。
- 若 posSide 为 net，需要根据 pos 正负判断方向（见 OKX 文档）。

get_pending_orders
- norm.orders[].orderId        <- raw.data[].ordId
- norm.orders[].instId         <- raw.data[].instId
- norm.orders[].symbol         <- convert instId
- norm.orders[].side           <- raw.data[].side（buy/sell）
- norm.orders[].type           <- raw.data[].ordType（limit/market/...）映射枚举
- norm.orders[].price          <- raw.data[].px
- norm.orders[].size           <- raw.data[].sz
- norm.orders[].filled         <- raw.data[].fillSz
- norm.orders[].status         <- raw.data[].state
- norm.orders[].createTime     <- raw.data[].cTime
- norm.orders[].updateTime     <- raw.data[].uTime

get_history_orders
- 与 pending orders 类似（ordId、instId、side、ordType、px、sz、fillSz、state、cTime、uTime）

--------------------------------------------------------------------------------
Binance USD-M（USDT-M）
--------------------------------------------------------------------------------

get_balance
- norm.assets[].ccy           <- raw[].asset
- norm.assets[].free          <- raw[].availableBalance
- norm.assets[].used          <- raw[].balance - raw[].availableBalance
- norm.assets[].total         <- raw[].balance
- norm.marginCcy / settleCcy  <- raw[].asset（USDT）
- norm.timestamp              <- 服务器时间（响应头）或本地时间

备注
- balance 返回资产数组。
- 具体字段以官方文档为准。

get_positions
- norm.positions[].instId      <- raw[].symbol
- norm.positions[].symbol      <- raw[].symbol（例如 BTCUSDT -> BTC/USDT）
- norm.positions[].side        <- raw[].positionAmt（正数=long，负数=short）
- norm.positions[].size        <- abs(raw[].positionAmt)
- norm.positions[].entryPrice  <- raw[].entryPrice
- norm.positions[].markPrice   <- raw[].markPrice
- norm.positions[].liqPrice    <- raw[].liquidationPrice
- norm.positions[].unrealizedPnl <- raw[].unRealizedProfit
- norm.positions[].leverage    <- raw[].leverage
- norm.positions[].marginMode  <- raw[].marginType
- norm.positions[].notional    <- raw[].notional
- norm.marginCcy / settleCcy   <- USDT

备注
- symbol 需转换为统一格式。
- positionAmt 的正负决定多空方向。

get_pending_orders
- norm.orders[].orderId        <- raw[].orderId
- norm.orders[].instId         <- raw[].symbol
- norm.orders[].symbol         <- raw[].symbol（convert）
- norm.orders[].side           <- raw[].side
- norm.orders[].type           <- raw[].type
- norm.orders[].price          <- raw[].price
- norm.orders[].size           <- raw[].origQty
- norm.orders[].filled         <- raw[].executedQty
- norm.orders[].status         <- raw[].status
- norm.orders[].createTime     <- raw[].time
- norm.orders[].updateTime     <- raw[].updateTime

get_history_orders
- 同 pending orders（来自 allOrders）

--------------------------------------------------------------------------------
Hyperliquid
--------------------------------------------------------------------------------

get_balance
- norm.assets[].ccy           <- 'USDC'
- norm.assets[].free          <- raw.clearinghouseState.marginSummary.accountValue
- norm.assets[].used          <- raw.clearinghouseState.marginSummary.totalMarginUsed
- norm.assets[].total         <- raw.clearinghouseState.marginSummary.accountValue
- norm.marginCcy / settleCcy  <- 'USDC'
- norm.timestamp              <- 服务器时间（如有）或本地时间

备注
- Hyperliquid 使用 USDC 本位，accountValue 为 USDC 计价。

get_positions
- norm.positions[].instId      <- raw.clearinghouseState.assetPositions[].position.coin
- norm.positions[].symbol      <- raw...coin + '/USDC'
- norm.positions[].side        <- raw...szi（正=long，负=short）
- norm.positions[].size        <- abs(raw...szi)
- norm.positions[].entryPrice  <- raw...entryPx
- norm.positions[].markPrice   <- raw...markPx
- norm.positions[].liqPrice    <- raw...liquidationPx
- norm.positions[].unrealizedPnl <- raw...unrealizedPnl
- norm.positions[].leverage    <- raw...leverage
- norm.positions[].marginMode  <- 'cross'（Hyperliquid 仅 cross）
- norm.positions[].notional    <- raw...positionValue
- norm.marginCcy / settleCcy   <- 'USDC'

get_pending_orders
- norm.orders[].orderId        <- raw[].oid
- norm.orders[].instId         <- raw[].coin
- norm.orders[].symbol         <- raw[].coin + '/USDC'
- norm.orders[].side           <- raw[].side
- norm.orders[].type           <- raw[].orderType
- norm.orders[].price          <- raw[].limitPx
- norm.orders[].size           <- raw[].sz
- norm.orders[].filled         <- raw[].filledSz
- norm.orders[].status         <- 'open'（openOrders）
- norm.orders[].createTime     <- raw[].timestamp

get_history_orders（fills）
- norm.orders[].orderId        <- raw[].oid
- norm.orders[].instId         <- raw[].coin
- norm.orders[].symbol         <- raw[].coin + '/USDC'
- norm.orders[].side           <- raw[].side
- norm.orders[].type           <- raw[].orderType
- norm.orders[].price          <- raw[].px
- norm.orders[].size           <- raw[].sz
- norm.orders[].filled         <- raw[].sz
- norm.orders[].status         <- 'closed'
- norm.orders[].createTime     <- raw[].time

备注
- Hyperliquid 历史使用 fills，字段与订单不一定 1:1。
- 字段名需以官方 info 文档确认。

