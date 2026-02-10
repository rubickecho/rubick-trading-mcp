# Binance USD-M（USDT-M）期货账户端点（官方）

基础
- Base URL：`https://fapi.binance.com`（USD-M Futures）
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/general-info

账户
- 期货账户余额（V3）：`GET /fapi/v3/balance`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Account-Balance-V3
- 账户信息（V3）：`GET /fapi/v3/account`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V3

持仓
- 持仓信息（V2）：`GET /fapi/v2/positionRisk`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
- 持仓信息（V3）：`GET /fapi/v3/positionRisk`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V3

订单
- 当前全部委托：`GET /fapi/v1/openOrders`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders
- 历史订单：`GET /fapi/v1/allOrders`
  - 官方：https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders

备注
- 必须参考官方文档确认参数、字段与限频权重（权重会随参数变化）。
