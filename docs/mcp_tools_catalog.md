# MCP Tools Catalog

This document is generated from the tool registry.

## get_balance

Get account balances (OKX/Binance USD-M/Hyperliquid)

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "symbol": {
      "type": "string"
    },
    "instId": {
      "type": "string"
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "since": {
      "type": "number"
    },
    "end": {
      "type": "number"
    },
    "limit": {
      "type": "number"
    },
    "cursor": {
      "type": "string"
    },
    "extra": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "accountType",
    "marginCcy",
    "settleCcy",
    "timestamp",
    "assets"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "accountType": {
      "type": "string",
      "enum": [
        "swap",
        "future"
      ]
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "timestamp": {
      "type": "string"
    },
    "assets": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "ccy",
          "free",
          "used",
          "total"
        ],
        "properties": {
          "ccy": {
            "type": "string"
          },
          "free": {
            "type": "number"
          },
          "used": {
            "type": "number"
          },
          "total": {
            "type": "number"
          },
          "usdValue": {
            "type": "number"
          }
        }
      }
    }
  }
}
```

## get_positions

Get open positions (OKX/Binance USD-M/Hyperliquid)

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "symbol": {
      "type": "string"
    },
    "instId": {
      "type": "string"
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "since": {
      "type": "number"
    },
    "end": {
      "type": "number"
    },
    "limit": {
      "type": "number"
    },
    "cursor": {
      "type": "string"
    },
    "extra": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "accountType",
    "marginCcy",
    "settleCcy",
    "timestamp",
    "positions"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "accountType": {
      "type": "string",
      "enum": [
        "swap",
        "future"
      ]
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "timestamp": {
      "type": "string"
    },
    "positions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "instId",
          "symbol",
          "side",
          "size",
          "entryPrice"
        ],
        "properties": {
          "instId": {
            "type": "string"
          },
          "symbol": {
            "type": "string"
          },
          "side": {
            "type": "string",
            "enum": [
              "long",
              "short"
            ]
          },
          "size": {
            "type": "number"
          },
          "entryPrice": {
            "type": "number"
          },
          "markPrice": {
            "type": "number"
          },
          "liqPrice": {
            "type": "number"
          },
          "unrealizedPnl": {
            "type": "number"
          },
          "leverage": {
            "type": "number"
          },
          "marginMode": {
            "type": "string",
            "enum": [
              "cross",
              "isolated"
            ]
          },
          "notional": {
            "type": "number"
          }
        }
      }
    }
  }
}
```

## get_pending_orders

Get open orders (OKX/Binance USD-M/Hyperliquid)

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "symbol": {
      "type": "string"
    },
    "instId": {
      "type": "string"
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "since": {
      "type": "number"
    },
    "end": {
      "type": "number"
    },
    "limit": {
      "type": "number"
    },
    "cursor": {
      "type": "string"
    },
    "extra": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "accountType",
    "marginCcy",
    "settleCcy",
    "timestamp",
    "orders"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "accountType": {
      "type": "string",
      "enum": [
        "swap",
        "future"
      ]
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "timestamp": {
      "type": "string"
    },
    "orders": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "orderId",
          "instId",
          "symbol",
          "side",
          "type",
          "size",
          "status",
          "createTime"
        ],
        "properties": {
          "orderId": {
            "type": "string"
          },
          "instId": {
            "type": "string"
          },
          "symbol": {
            "type": "string"
          },
          "side": {
            "type": "string",
            "enum": [
              "buy",
              "sell"
            ]
          },
          "type": {
            "type": "string",
            "enum": [
              "limit",
              "market",
              "post_only",
              "ioc",
              "fok"
            ]
          },
          "price": {
            "type": "number"
          },
          "size": {
            "type": "number"
          },
          "filled": {
            "type": "number"
          },
          "status": {
            "type": "string",
            "enum": [
              "open",
              "closed",
              "canceled"
            ]
          },
          "createTime": {
            "type": "string"
          },
          "updateTime": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

## get_history_orders

Get historical orders/fills (OKX/Binance USD-M/Hyperliquid)

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "symbol": {
      "type": "string"
    },
    "instId": {
      "type": "string"
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "since": {
      "type": "number"
    },
    "end": {
      "type": "number"
    },
    "limit": {
      "type": "number"
    },
    "cursor": {
      "type": "string"
    },
    "extra": {
      "type": "object",
      "additionalProperties": true
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "accountType",
    "marginCcy",
    "settleCcy",
    "timestamp",
    "orders"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx",
        "binance",
        "hyperliquid"
      ]
    },
    "accountType": {
      "type": "string",
      "enum": [
        "swap",
        "future"
      ]
    },
    "marginCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "settleCcy": {
      "type": "string",
      "enum": [
        "USDT",
        "USDC"
      ]
    },
    "timestamp": {
      "type": "string"
    },
    "orders": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "orderId",
          "instId",
          "symbol",
          "side",
          "type",
          "size",
          "status",
          "createTime"
        ],
        "properties": {
          "orderId": {
            "type": "string"
          },
          "instId": {
            "type": "string"
          },
          "symbol": {
            "type": "string"
          },
          "side": {
            "type": "string",
            "enum": [
              "buy",
              "sell"
            ]
          },
          "type": {
            "type": "string",
            "enum": [
              "limit",
              "market",
              "post_only",
              "ioc",
              "fok"
            ]
          },
          "price": {
            "type": "number"
          },
          "size": {
            "type": "number"
          },
          "filled": {
            "type": "number"
          },
          "status": {
            "type": "string",
            "enum": [
              "open",
              "closed",
              "canceled"
            ]
          },
          "createTime": {
            "type": "string"
          },
          "updateTime": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

## get_ticker

Get OKX ticker data

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "anyOf": [
    {
      "required": [
        "instId"
      ]
    },
    {
      "required": [
        "symbol"
      ]
    }
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    },
    "limit": {
      "type": "number"
    },
    "depth": {
      "type": "number"
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "instId",
    "symbol",
    "timestamp",
    "last",
    "bid",
    "ask",
    "high24h",
    "low24h",
    "vol24h"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "last": {
      "type": "number"
    },
    "bid": {
      "type": "number"
    },
    "ask": {
      "type": "number"
    },
    "high24h": {
      "type": "number"
    },
    "low24h": {
      "type": "number"
    },
    "vol24h": {
      "type": "number"
    }
  }
}
```

## get_candles

Get OKX candles

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "anyOf": [
    {
      "required": [
        "instId"
      ]
    },
    {
      "required": [
        "symbol"
      ]
    }
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    },
    "limit": {
      "type": "number"
    },
    "depth": {
      "type": "number"
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "instId",
    "symbol",
    "timestamp",
    "candles"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "candles": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "timestamp",
          "open",
          "high",
          "low",
          "close",
          "volume"
        ],
        "properties": {
          "timestamp": {
            "type": "string"
          },
          "open": {
            "type": "number"
          },
          "high": {
            "type": "number"
          },
          "low": {
            "type": "number"
          },
          "close": {
            "type": "number"
          },
          "volume": {
            "type": "number"
          },
          "isComplete": {
            "type": "boolean"
          }
        }
      }
    }
  }
}
```

## get_order_book

Get OKX order book

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "anyOf": [
    {
      "required": [
        "instId"
      ]
    },
    {
      "required": [
        "symbol"
      ]
    }
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    },
    "limit": {
      "type": "number"
    },
    "depth": {
      "type": "number"
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "instId",
    "symbol",
    "timestamp",
    "bids",
    "asks",
    "depth"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "bids": {
      "type": "array",
      "items": {
        "type": "array",
        "items": [
          {
            "type": "number"
          },
          {
            "type": "number"
          }
        ],
        "minItems": 2,
        "maxItems": 2
      }
    },
    "asks": {
      "type": "array",
      "items": {
        "type": "array",
        "items": [
          {
            "type": "number"
          },
          {
            "type": "number"
          }
        ],
        "minItems": 2,
        "maxItems": 2
      }
    },
    "depth": {
      "type": "number"
    }
  }
}
```

## get_funding_rate

Get OKX funding rate

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "anyOf": [
    {
      "required": [
        "instId"
      ]
    },
    {
      "required": [
        "symbol"
      ]
    }
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    },
    "limit": {
      "type": "number"
    },
    "depth": {
      "type": "number"
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "instId",
    "symbol",
    "timestamp",
    "fundingRate"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "fundingRate": {
      "type": "number"
    },
    "nextFundingRate": {
      "type": "number"
    },
    "fundingTime": {
      "type": "string"
    }
  }
}
```

## get_open_interest

Get OKX open interest

Input Schema
```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "exchange"
  ],
  "anyOf": [
    {
      "required": [
        "instId"
      ]
    },
    {
      "required": [
        "symbol"
      ]
    }
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "bar": {
      "type": "string"
    },
    "limit": {
      "type": "number"
    },
    "depth": {
      "type": "number"
    }
  }
}
```

Output Schema
```json
{
  "type": "object",
  "required": [
    "exchange",
    "instId",
    "symbol",
    "timestamp",
    "openInterest"
  ],
  "properties": {
    "exchange": {
      "type": "string",
      "enum": [
        "okx"
      ]
    },
    "instId": {
      "type": "string"
    },
    "symbol": {
      "type": "string"
    },
    "timestamp": {
      "type": "string"
    },
    "openInterest": {
      "type": "number"
    },
    "openInterestCcy": {
      "type": "number"
    },
    "openInterestUsd": {
      "type": "number"
    }
  }
}
```
