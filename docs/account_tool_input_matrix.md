# 账户工具输入矩阵（必填/可选）

范围
- 工具：get_balance、get_positions、get_pending_orders、get_history_orders
- 交易所：OKX、Binance USD-M、Hyperliquid
- 仅稳定币本位

图例
- R：必填
- O：可选
- N/A：不支持 / 忽略

---------------------------------------------------------------------
get_balance
---------------------------------------------------------------------
字段         | OKX | Binance USD-M | Hyperliquid | 备注
exchange     | R   | R             | R           | 必须为 okx/binance/hyperliquid
symbol       | O   | N/A           | N/A         | OKX balance 支持 ccy 过滤；建议不传
instId       | O   | N/A           | N/A         | 仅在明确指定时映射为 ccy
marginCcy    | O   | O             | O           | USDT/USDC；HL 固定 USDC
settleCcy    | O   | O             | O           | USDT/USDC；HL 固定 USDC
since/end    | N/A | N/A           | N/A         | balance 不支持时间范围
limit/cursor | N/A | N/A           | N/A         | balance 不分页
extra.user   | N/A | N/A           | R           | Hyperliquid 必须 user 地址
extra.recvWindow | N/A | O          | N/A         | Binance signed 端点

---------------------------------------------------------------------
get_positions
---------------------------------------------------------------------
字段         | OKX | Binance USD-M | Hyperliquid | 备注
exchange     | R   | R             | R           |
symbol       | O   | O             | N/A         | Binance 支持 symbol 过滤
instId       | O   | N/A           | N/A         | OKX instId 过滤
marginCcy    | O   | O             | O           | USDT/USDC；HL 固定 USDC
settleCcy    | O   | O             | O           | USDT/USDC；HL 固定 USDC
since/end    | N/A | N/A           | N/A         | 不支持
limit/cursor | N/A | N/A           | N/A         | 不支持
extra.user   | N/A | N/A           | R           | Hyperliquid 必须 user 地址
extra.recvWindow | N/A | O          | N/A         | Binance signed 端点

---------------------------------------------------------------------
get_pending_orders
---------------------------------------------------------------------
字段         | OKX | Binance USD-M | Hyperliquid | 备注
exchange     | R   | R             | R           |
symbol       | O   | O             | N/A         | Binance 支持 symbol 过滤
instId       | O   | N/A           | N/A         | OKX instId 过滤
marginCcy    | O   | O             | O           |
settleCcy    | O   | O             | O           |
since/end    | N/A | N/A           | N/A         | pending 为当前委托
limit/cursor | N/A | N/A           | N/A         | pending 不分页
extra.user   | N/A | N/A           | R           | Hyperliquid 必须 user 地址
extra.recvWindow | N/A | O          | N/A         | Binance signed 端点

---------------------------------------------------------------------
get_history_orders
---------------------------------------------------------------------
字段         | OKX | Binance USD-M | Hyperliquid | 备注
exchange     | R   | R             | R           |
symbol       | O   | R             | N/A         | Binance allOrders 必须 symbol
instId       | O   | N/A           | N/A         | OKX instId 过滤
marginCcy    | O   | O             | O           |
settleCcy    | O   | O             | O           |
since        | O   | O             | O           | Binance 对应 startTime
end          | O   | O             | O           | Binance 对应 endTime
limit        | O   | O             | O           | 分页/limit
cursor       | O   | N/A           | O           | OKX before/after；HL 时间游标
extra.user   | N/A | N/A           | R           | Hyperliquid 必须 user 地址
extra.recvWindow | N/A | O          | N/A         | Binance signed 端点

备注
- Hyperliquid 历史为 fills（userFills / userFillsByTime）。
- OKX orders-history 支持时间范围与 before/after 分页（以官方文档为准）。
