# OKX REST 鉴权与签名（官方）

官方文档：
- https://www.okx.com/docs-v5/en/#rest-api-authentication

私有 REST 请求必须包含以下请求头：
- OK-ACCESS-KEY
- OK-ACCESS-SIGN
- OK-ACCESS-TIMESTAMP（UTC ISO 时间戳，例如 2020-12-08T09:08:57.715Z）
- OK-ACCESS-PASSPHRASE
- Content-Type: application/json

签名规则：
- 预签名串 = timestamp + method + requestPath + body
- 使用 SecretKey 做 HMAC SHA256
- Base64 编码签名结果
- GET 的 query 参数放在 requestPath 中（body 为空）

备注：
- method 必须大写（GET/POST）
- requestPath 仅包含路径（例如 /api/v5/account/balance）
