# Binance COIN-M 期货账户端点（官方）

基础
- Base URL：`https://dapi.binance.com`（COIN-M Futures）
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/general-info

账户
- 期货账户余额：`GET /dapi/v1/balance`
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Futures-Account-Balance
- 账户信息：`GET /dapi/v1/account`
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/account/rest-api/Account-Information

持仓
- 持仓信息：`GET /dapi/v1/positionRisk`
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Position-Information

订单
- 当前全部委托：`GET /dapi/v1/openOrders`
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/Current-All-Open-Orders
- 历史订单：`GET /dapi/v1/allOrders`
  - 官方：https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/rest-api/All-Orders

备注
- 必须参考官方文档确认参数（symbol / pair）、字段与限频。
