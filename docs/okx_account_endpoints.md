# OKX 账户数据端点（官方）

基础
- OKX REST v5 API

账户
- 余额：`/api/v5/account/balance`
  - 官方：https://www.okx.com/docs-v5/en/#rest-api-account-get-balance
- 持仓：`/api/v5/account/positions`
  - 官方：https://www.okx.com/docs-v5/en/#rest-api-account-get-positions

交易
- 当前委托：`/api/v5/trade/orders-pending`
  - 官方：https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-list
- 历史订单：`/api/v5/trade/orders-history`
  - 官方：https://www.okx.com/docs-v5/en/#rest-api-trade-get-order-history

备注
- OKX 私有接口需要 API Key 鉴权。
- 必须以官方文档为准核对参数、字段与限频。
