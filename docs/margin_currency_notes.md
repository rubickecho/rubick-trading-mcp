# 保证金/结算币种说明（官方）

OKX
- OKX 存在 USDT 本位永续（USDT 结算）。
- OKX 也存在 USDC/USDG/USD 等结算的永续/合约（不同地区与产品）。
参考：
- https://www.okx.com/en-us/help/i-perpetual-swaps

Binance USD-M
- USD-M 期货为 USDT 本位，使用 fapi 端点。
参考：
- https://developers.binance.com/docs/derivatives/usds-margined-futures/general-info

Hyperliquid
- Hyperliquid 永续使用 USDC 作为保证金；价格常以 USDT 作为 oracle，但抵押资产为 USDC。
参考：
- https://hyperliquid.gitbook.io/hyperliquid-docs/trading/contract-specifications

决策
- 本项目中“U 本位”指 **稳定币本位（USDT/USDC）**，不要求严格 USDT-only。
- OKX：优先 USDT 结算永续；USDC 结算可后续支持。
- Binance：使用 USD-M（USDT 本位）端点。
- Hyperliquid：仅 USDC 本位。
