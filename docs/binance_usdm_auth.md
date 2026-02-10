# Binance USD-M 期货鉴权与签名（官方）

官方文档：
- https://binance-docs.github.io/apidocs/delivery_testnet/en/

安全类型：
- SIGNED 端点需要 API key + 签名
- API key 通过请求头：X-MBX-APIKEY

签名规则：
- totalParams（query string + body）做 HMAC SHA256
- 签名作为 `signature` 参数
- `signature` 必须放在 query/body 的最后

时间参数：
- SIGNED 端点必须带 `timestamp`
- `recvWindow` 可选，默认 5000ms
- 时间偏差超过服务端允许范围会被拒绝

备注：
- Binance 分 USD-M 与 COIN-M 两套文档，务必按 USD-M 文档确认参数放置（query/body）。
