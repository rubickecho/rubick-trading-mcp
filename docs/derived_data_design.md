# 数据深度处理（Derived）方案设计

本方案面向 `rubick-trading-mcp` 的“深度数据处理但不输出分析结论”的核心边界，采用独立包实现，确保可复用、可验证、可扩展。

-------------------------------------------------------------------------------
## 1. 背景与目标

**背景**
- 当前系统定位为统一数据层：provider 只返回 raw，core 负责 normalized，MCP 层输出结构化数据。
- 需要补足“深度数据处理能力”，但明确禁止硬编码结论或建议。

**目标**
- 新增 `derived` 数据层，提供可复用的统计特征与指标数值。
- 在不破坏现有 `raw/normalized` 输出的前提下增强结构化输出。
- 支持 OKX / Binance / Hyperliquid 的市场与账户数据。

**非目标**
- 不输出任何结论性标签、建议、判断。
- 不引入 SDK 或新数据源。
- 不在 MCP 服务端输出“策略”“风险提示”“买卖建议”。

-------------------------------------------------------------------------------
## 2. 设计原则（必须遵守）

- 数据处理 ≠ 分析结论。
- `derived` 只包含可复现、可验证、可回放的数值特征或客观状态量。
- 不输出带立场的文本或结论字段。
- 纯函数、无副作用、无网络调用。
- 跨交易所一致的字段语义与单位。
- 保持向后兼容，避免破坏现有工具输入输出。

-------------------------------------------------------------------------------
## 3. 术语定义

- `raw`：交易所原始返回。
- `normalized`：统一口径后的标准化数据。
- `derived`：基于 normalized 的统计与特征数据，无结论。

-------------------------------------------------------------------------------
## 4. 方案范围

**交易所（阶段 1）**
- OKX：市场 + 账户（全量支持）
- Binance：暂不在 derived 中启用（阶段 2 评估）
- Hyperliquid：暂不在 derived 中启用（阶段 2 评估）

**工具类型**
- 市场类：`get_ticker` / `get_candles` / `get_order_book` / `get_funding_rate` / `get_open_interest`
- 账户类：`get_balance` / `get_positions` / `get_pending_orders` / `get_history_orders`
- 组合型（可选，后续阶段）：聚合多个端点的深度特征工具

-------------------------------------------------------------------------------
## 5. Provider 数据与官方文档核对

本节用于核对**当前 provider 实现**与**官方文档**的一致性，并标记 derived 所需的可用字段与缺口。

### 5.1 当前 provider 覆盖（以代码为准）

**OKX**
- 账户：
  - `/api/v5/account/balance`
  - `/api/v5/account/positions`
  - `/api/v5/trade/orders-pending`
  - `/api/v5/trade/orders-history`
- 行情：
  - `/api/v5/market/ticker`
  - `/api/v5/market/candles`
  - `/api/v5/market/books`
  - `/api/v5/public/funding-rate`
  - `/api/v5/public/open-interest`

**Binance USD-M**
- 账户：
  - `/fapi/v3/balance`
  - `/fapi/v2/positionRisk`
  - `/fapi/v1/openOrders`
  - `/fapi/v1/allOrders`
- 行情（当前 provider 未实现，需新增）：
  - `/fapi/v1/ticker/24hr`
  - `/fapi/v1/klines`
  - `/fapi/v1/depth`
  - `/fapi/v1/fundingRate`
  - `/fapi/v1/openInterest`
  - `/futures/data/openInterestHist`
  - `/futures/data/takerlongshortRatio`
  - `/futures/data/globalLongShortAccountRatio`（可选）

**Hyperliquid**
- 账户（`POST /info`）：
  - `clearinghouseState`
  - `openOrders`
  - `userFills`
  - `userFillsByTime`
- 行情（当前 provider 未实现，需新增/评估）

### 5.2 官方文档核对（关键端点）

**OKX 官方文档（市场类）**
- `GET /api/v5/market/ticker`
- `GET /api/v5/market/candles`
- `GET /api/v5/market/books`
- `GET /api/v5/public/funding-rate`
- `GET /api/v5/public/open-interest`
  - 参考：
    - https://www.okx.com/docs-v5/en/#rest-api-market-data-get-ticker
    - https://www.okx.com/docs-v5/en/#rest-api-market-data-get-candlesticks
    - https://www.okx.com/docs-v5/en/#rest-api-market-data-get-order-book
    - https://www.okx.com/docs-v5/en/#rest-api-public-data-get-funding-rate
    - https://www.okx.com/docs-v5/en/#rest-api-public-data-get-open-interest

**Binance 官方文档（USD-M 市场类）**
- `GET /fapi/v1/ticker/24hr`
- `GET /fapi/v1/klines`
- `GET /fapi/v1/depth`
- `GET /fapi/v1/fundingRate`
- `GET /fapi/v1/openInterest`
- `GET /futures/data/openInterestHist`
- `GET /futures/data/takerlongshortRatio`
  - 参考：
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-ticker-price-change-statistics
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest-Statistics
    - https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Long-Short-Ratio

**Hyperliquid 官方文档（Info 接口）**
- `POST /info` with `type=clearinghouseState`
- `POST /info` with `type=openOrders`
- `POST /info` with `type=userFills`
- `POST /info` with `type=userFillsByTime`
  - 参考：
    - https://hyperliquid.gitbook.io/hyperliquid-docs/api/info

### 5.3 缺口与影响

- Binance / Hyperliquid **市场类 provider 缺失**会限制 derived 的跨交易所一致性。
- OKX 市场类 provider 已覆盖大部分 derived 需求，可优先落地。
- 若要实现跨交易所市场 derived，需要先补齐 Binance/Hyperliquid 的行情 provider。
- OKX 官方文档在部分自动化环境下可能无法抓取（HTTP 400），需要人工核对链接。

-------------------------------------------------------------------------------
## 6. 架构与包结构

新增独立包 `packages/core-derived`，并保持纯函数设计。

```
packages/
  core-derived/
    src/
      index.ts
      market/
        ticker.ts
        candles.ts
        order-book.ts
        funding-rate.ts
        open-interest.ts
      account/
        balance.ts
        positions.ts
        orders.ts
      utils/
        stats.ts
        indicators.ts
        math.ts
    test/
      market/*.test.ts
      account/*.test.ts
```

依赖关系：
- `core-derived` 仅依赖 `core-schema` 的类型与 `core-utils` 的纯函数工具。
- 不依赖 provider，不做网络请求。

-------------------------------------------------------------------------------
## 7. 数据流设计

```
Provider (raw) -> Normalizer (normalized) -> Derived (features) -> MCP Response

structuredContent = { raw, normalized, derived }
```

输出保持稳定：
- `outputSchema` 仍用于校验 `normalized`（兼容现有实现）
- `derived` 使用 `DERIVED_SCHEMA_MAP` 做硬校验，失败返回 `OUTPUT_SCHEMA_ERROR`

-------------------------------------------------------------------------------
## 8. Derived 统一结构

统一的 `derived` 信封结构，避免随工具发散。

```json
{
  "derived": {
    "version": "v1",
    "asOf": "2026-02-13T12:00:00.000Z",
    "level": "basic",
    "features": { ... },
    "warnings": []
  }
}
```

字段说明：
- `version`: derived 版本号，便于后续演进。
- `asOf`: 生成时间，ISO 字符串。
- `level`: `basic | standard | full`，控制深度与计算成本。
- `features`: 工具级特征集合。
- `warnings`: 计算降级或缺失字段时的提示。

-------------------------------------------------------------------------------
## 8.1 Derived Level 语义与默认参数

**basic（当前已实现）**
- 指标集合：
  - EMA：20 / 50
  - RSI：14
  - MACD：12 / 26 / 9
  - Bollinger Bands：20 / 2
  - ATR：14
  - Order Book：TopN=5
- 默认参数：
  - `ema_fast=20`
  - `ema_slow=50`
  - `rsi_period=14`
  - `macd=(12,26,9)`
  - `bb=(20,2)`
  - `atr=14`
  - `orderbook_topn=5`

**standard（未来扩展，not implemented）**
- 指标集合（建议）：
  - EMA：20 / 50 / 100
  - RSI：14 / 21
  - MACD：12 / 26 / 9
  - Bollinger Bands：20 / 2
  - ATR：14
  - Order Book：TopN=10
- 默认参数：
  - `ema_fast=20`
  - `ema_slow=50`
  - `ema_long=100`
  - `rsi_period=14`
  - `rsi_period_alt=21`
  - `macd=(12,26,9)`
  - `bb=(20,2)`
  - `atr=14`
  - `orderbook_topn=10`

**full（未来扩展，not implemented）**
- 指标集合（建议）：
  - EMA：20 / 50 / 100 / 200
  - RSI：14 / 21
  - MACD：12 / 26 / 9
  - Bollinger Bands：20 / 2
  - ATR：14
  - Order Book：TopN=20
- 默认参数：
  - `ema_fast=20`
  - `ema_slow=50`
  - `ema_long=100`
  - `ema_ultra=200`
  - `rsi_period=14`
  - `rsi_period_alt=21`
  - `macd=(12,26,9)`
  - `bb=(20,2)`
  - `atr=14`
  - `orderbook_topn=20`

-------------------------------------------------------------------------------
## 9. Derived 字段设计（按工具）

### 9.1 市场类（OKX v1）

**get_ticker（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `mid_price` | (bid + ask) / 2；来源 `normalized.bid`/`normalized.ask` | bid/ask 缺失 -> null |
| `spread_abs` | ask - bid | bid/ask 缺失 -> null |
| `spread_bps` | (spread_abs / mid_price) * 10000 | mid/ spread 缺失 -> null |
| `high_low_range_24h_pct` | (high24h - low24h) / low24h * 100 | low24h=0 或缺失 -> null |

备注：不输出 `change_24h_pct`（normalized 无 `open24h` 字段）。

**get_candles（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `returns_pct` | (close - open) / open * 100；来源 `normalized.candles[i].open/close` | open=0 -> 0 |
| `volatility_std` | `stddev(returns_pct)` | <2 条 -> null |
| `atr` | 14-period ATR；按时间升序，用 `max(high-low, abs(high-prevClose), abs(low-prevClose))` | K线数 < 15 -> null |
| `ema_fast` | EMA(20) 最新值；close 按时间升序 | 数据不足 -> null |
| `ema_slow` | EMA(50) 最新值；close 按时间升序 | 数据不足 -> null |
| `ema_diff` | `ema_fast - ema_slow` | 任一缺失 -> null |
| `rsi` | RSI(14) 最新值；close 按时间升序 | 数据不足 -> null |
| `macd` | MACD(12/26/9) 最新值；close 按时间升序 | 数据不足 -> null |
| `macd_signal` | MACD signal(12/26/9) 最新值 | 数据不足 -> null |
| `macd_hist` | macd - macd_signal | 任一缺失 -> null |
| `bb_upper` | Bollinger(20,2) 上轨；close 按时间升序 | 数据不足 -> null |
| `bb_middle` | Bollinger(20,2) 中轨 | 数据不足 -> null |
| `bb_lower` | Bollinger(20,2) 下轨 | 数据不足 -> null |
| `bb_width` | (upper - lower) / middle | middle=0 或缺失 -> null |
| `trend_state_raw` | ema_fast > ema_slow => `up`；< => `down`；= => `sideways` | 任一缺失 -> `undefined` |
| `volume_zscore` | zscore(最新 volume, 全部 volume)；最新值取 `candles[0].volume` | stddev=0 或 <2 条 -> null |

**get_order_book（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `weighted_mid` | (weightedBid + weightedAsk)/2；weightedBid/Ask=Σ(price*size)/Σ(size)，TopN=5 | bidVol/askVol=0 或不足 -> null |
| `imbalance_top_n` | (bidVol - askVol)/(bidVol + askVol)，TopN=5 | bidVol+askVol=0 -> null |
| `depth_ratio` | bidVol / askVol，TopN=5 | askVol=0 -> null |
| `spread_abs` | bestAsk - bestBid | 缺失 -> null |
| `spread_bps` | (spread_abs / mid) * 10000；mid=(bestBid+bestAsk)/2 | 缺失 -> null |

**get_funding_rate（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `funding_rate` | `normalized.fundingRate` | 非有限值 -> null |
| `funding_rate_annualized` | funding_rate * 3 * 365（OKX 8h 结算） | funding_rate 缺失 -> null |

**get_open_interest（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `open_interest` | `normalized.openInterest` | 非有限值 -> null |
| `open_interest_ccy` | `normalized.openInterestCcy` | 缺失或非有限 -> null |
| `open_interest_usd` | `normalized.openInterestUsd` | 缺失或非有限 -> null |

### 9.2 账户类（OKX v1）

**get_balance（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `free_pct` | sum(free) / sum(total) | sum(total)=0 -> null |
| `used_pct` | sum(used) / sum(total) | sum(total)=0 -> null |
| `asset_concentration_top1` | max(total) / sum(total) | sum(total)=0 -> null |
| `asset_count` | assets.length | 无 |

**get_positions（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `gross_exposure` | Σ notional；notional=normalized.notional ?? size * (markPrice ?? entryPrice) | gross=0 -> null |
| `net_exposure` | Σ longNotional - Σ shortNotional | gross=0 -> null |
| `unrealized_pnl_pct` | Σ unrealizedPnl / gross（仅统计有 unrealizedPnl 的仓位） | gross=0 -> null |
| `leverage_effective` | Σ(leverage * notional) / gross（仅统计有 leverage 的仓位） | gross=0 或无 leverage -> null |

**get_pending_orders / get_history_orders（features）**
| 字段 | 来源/公式 | 缺失处理 |
| --- | --- | --- |
| `order_count` | orders.length | 无 |
| `buy_sell_ratio` | buyCount / sellCount | sellCount=0 -> null |
| `avg_order_size` | mean(size) | 无订单 -> null |
| `fill_ratio_avg` | mean(filled/size)，忽略 filled 缺失 | 无 filled -> null |

-------------------------------------------------------------------------------
## 10. 组合型 Derived 工具（可选阶段）

组合型工具仅输出“特征”，不输出结论。

**get_contract_features（OKX 优先）**
- 输入：`instId`, `period`, `limit`
- 内部取：OI history + taker volume + candles
- 输出：`oi_change_pct`, `taker_buy_sell_ratio`, `price_change_pct`, `trend_state_raw`

**get_market_overview_features（OKX 优先）**
- 输入：`ccy`, `period`, `limit`
- 内部取：OI volume + spot candles
- 输出：`oi_trend_slope`, `volume_trend_slope`, `price_trend_slope`, `percentile`, `zscore`

-------------------------------------------------------------------------------
## 11. 交易所差异与降级策略

- OKX：完整字段计算，支持 basic level（阶段 1）。
- Binance：阶段 2 再接入，需补齐行情 provider。
- Hyperliquid：阶段 2 再接入，按现有端点降级。

降级规则：
- 计算所需字段缺失时，对应特征输出 `null`。
- `warnings` 目前不填充（保留扩展）。

-------------------------------------------------------------------------------
## 12. 配置与输入控制

新增统一的派生级别控制：
- `derived.level`: `basic` / `standard` / `full`
- 默认 `basic`

输入扩展方案：
- 账户类：使用已有 `extra` 扩展 `derived` 配置
- 行情类：在 input schema 中新增可选 `derived` 字段

-------------------------------------------------------------------------------
## 13. 校验策略

阶段一：
- 引入 `DERIVED_SCHEMA_MAP`，与工具一一对应，对 `derived` 做结构校验。
- `derived` 校验为硬失败，失败返回 `OUTPUT_SCHEMA_ERROR`（与 normalized 一致）。

-------------------------------------------------------------------------------
## 14. 测试策略

- 单元测试：`core-derived` 纯函数计算覆盖。
- 契约测试：基于 fixtures 验证 derived 结构稳定性。
- 集成测试：MCP 输出包含 `derived` 字段但不影响 `normalized` 校验。

-------------------------------------------------------------------------------
## 15. 分阶段实施计划（一步一步）

**阶段 1：基础设施**
- 新建 `packages/core-derived`
- 定义 derived 信封结构与基础工具函数
- 完成最小测试框架

**阶段 2：市场类 derived**
- 接入 `get_ticker` / `get_candles` / `get_order_book`
- 保证输出字段稳定与可复现

**阶段 3：账户类 derived**
- 接入 `get_balance` / `get_positions` / `get_orders`
- 增加聚合与统计字段

**阶段 4：组合型特征工具（可选）**
- `get_contract_features`
- `get_market_overview_features`

**阶段 5：跨交易所能力矩阵**
- 对 Binance/Hyperliquid 做降级适配
- 完成文档与输入矩阵更新

-------------------------------------------------------------------------------
## 16. 风险与约束

- 技术指标计算成本增加，需在 `level` 控制范围内运行。
- 部分交易所字段缺失导致 derived 不完整，需依赖 `warnings` 提示。
- 输出字段必须保持稳定，避免 agent 依赖断裂。

-------------------------------------------------------------------------------
## 17. 开放问题

- 是否为 `derived` 增加独立 schema 校验与版本管理策略。
- 组合型 derived 是否作为新工具对外暴露，还是内部聚合。
- 标准化的指标窗口长度与默认参数。

-------------------------------------------------------------------------------
## 18. 对外接口变化（文档说明）

- MCP 输出 `structuredContent` 结构为 `{ raw, normalized, derived }`。
- `derived` v1 字段在 OKX 范围内保持稳定（当前仅 OKX）。
