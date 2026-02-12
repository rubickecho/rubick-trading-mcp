# 交易所接入准备清单

用于账户类工具真实联调与集成测试的凭据与参数要求如下。

OKX
- OKX_API_KEY
- OKX_API_SECRET
- OKX_API_PASSPHRASE

权限建议
- 只读权限即可（账户、持仓、订单查询）
- 不需要提币权限

Binance USD-M
- BINANCE_API_KEY
- BINANCE_API_SECRET

权限建议
- 只读权限即可（合约账户、持仓、订单查询）
- 不需要提币权限

Hyperliquid
- HYPERLIQUID_USER
  - 钱包地址（用于 info 查询）
  - 只读接口不需要 API key

可选环境变量（非必需）
- OKX_BASE_URL
- BINANCE_BASE_URL
- HYPERLIQUID_BASE_URL

--------------------------------------------------------------------------------
获取凭据指南（简版）
--------------------------------------------------------------------------------

说明
- 交易所后台界面可能会更新，以下为通用路径与注意事项。
- 强烈建议仅开启只读权限，避免开启提币权限。

OKX
1. 登录 OKX Web 端，进入 API 管理页（个人中心/安全设置内通常可找到）。
2. 创建新的 API Key。
3. 只勾选只读权限（账户/持仓/订单查询）。
4. 保存并记录 API Key、Secret 与 Passphrase（Passphrase 只在创建时可见）。
5. 如需安全加固，开启 IP 白名单。

Binance（USD-M 合约）
1. 登录 Binance Web 端，进入 API Management。
2. 创建新的 API Key。
3. 只勾选只读权限（合约账户/持仓/订单查询）。
4. 保存并记录 API Key 与 Secret（Secret 只在创建时可见）。
5. 建议启用 IP 白名单与 2FA。

Hyperliquid
- 只读查询：无需 API Key/Token，仅需主账户钱包地址（HYPERLIQUID_USER）。
  - 本项目使用 info 端点查询账户数据，传入 user 地址即可。
- 若需要交易/签名：
  1. 在 Hyperliquid Web 端创建并授权 API Wallet（或 Agent Wallet）。
  2. 保存私钥（用于签名请求）。
  3. 仍需保留主账户地址用于查询。
