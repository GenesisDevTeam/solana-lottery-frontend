/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_lottery.json`.
 */
export type SolanaLottery = {
  "address": "AHw5KYiCeU2Bj2KvQR6YcCAcQcqusp58mz3MRyiT61M9",
  "metadata": {
    "name": "solanaLottery",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelRound",
      "docs": [
        "Отмена раунда при нуле покупок (закрытие аккаунта раунда)"
      ],
      "discriminator": [
        82,
        70,
        134,
        54,
        46,
        96,
        148,
        8
      ],
      "accounts": [
        {
          "name": "lotteryState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "lotteryState"
          ]
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimAdminFees",
      "docs": [
        "Вывод комиссий администратором (SOL)"
      ],
      "discriminator": [
        68,
        216,
        128,
        44,
        49,
        31,
        91,
        149
      ],
      "accounts": [
        {
          "name": "lotteryState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "lotteryState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "consumeRandomness",
      "docs": [
        "Callback от Switchboard: сохраняем рандом и генерируем winning_tickets"
      ],
      "discriminator": [
        190,
        217,
        49,
        162,
        99,
        26,
        73,
        234
      ],
      "accounts": [
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "vrfState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  114,
                  102,
                  95,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "vrf"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "finishRound",
      "docs": [
        "Завершение раунда: распределение SOL по победителям и комиссия"
      ],
      "discriminator": [
        23,
        104,
        163,
        186,
        110,
        225,
        11,
        242
      ],
      "accounts": [
        {
          "name": "lotteryState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "lotteryState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initVrfClient",
      "docs": [
        "Инициализация VRF-клиента для раунда"
      ],
      "discriminator": [
        4,
        73,
        63,
        122,
        161,
        36,
        223,
        68
      ],
      "accounts": [
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "vrfState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  114,
                  102,
                  95,
                  99,
                  108,
                  105,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "vrf",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "lotteryState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "pubkey"
        },
        {
          "name": "admin",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeRound",
      "discriminator": [
        43,
        135,
        19,
        93,
        14,
        225,
        131,
        188
      ],
      "accounts": [
        {
          "name": "lotteryState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  111,
                  116,
                  116,
                  101,
                  114,
                  121,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "lottery_state.latest_round_id.checked_add(1)",
                "account": "lotteryState"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "lotteryState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "startTimestamp",
          "type": "i64"
        },
        {
          "name": "finishTimestamp",
          "type": "i64"
        },
        {
          "name": "feeBps",
          "type": "u16"
        },
        {
          "name": "winnersCount",
          "type": "u16"
        },
        {
          "name": "rewardSharingBps",
          "type": {
            "vec": "u16"
          }
        },
        {
          "name": "ticketPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "play",
      "docs": [
        "Покупка билетов (оплата в SOL)"
      ],
      "discriminator": [
        213,
        157,
        193,
        142,
        228,
        56,
        248,
        150
      ],
      "accounts": [
        {
          "name": "round",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "purchase",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  117,
                  114,
                  99,
                  104,
                  97,
                  115,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              },
              {
                "kind": "account",
                "path": "round.purchase_count",
                "account": "round"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "watcherState"
        },
        {
          "name": "userRefForPlayer"
        },
        {
          "name": "referrerSettingsForPlayer"
        },
        {
          "name": "lotteryProgram"
        },
        {
          "name": "watcherProgram",
          "address": "j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf"
        },
        {
          "name": "profitForRound"
        },
        {
          "name": "roundTotalProfit"
        },
        {
          "name": "referralEscrow"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "ticketCount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "lotteryState",
      "discriminator": [
        196,
        210,
        202,
        219,
        204,
        63,
        133,
        85
      ]
    },
    {
      "name": "purchase",
      "discriminator": [
        33,
        203,
        1,
        252,
        231,
        228,
        8,
        67
      ]
    },
    {
      "name": "round",
      "discriminator": [
        87,
        127,
        165,
        51,
        73,
        78,
        116,
        174
      ]
    },
    {
      "name": "vrfClientState",
      "discriminator": [
        173,
        240,
        159,
        11,
        226,
        117,
        124,
        97
      ]
    }
  ],
  "events": [
    {
      "name": "newRoundInitialized",
      "discriminator": [
        20,
        177,
        197,
        31,
        194,
        14,
        225,
        254
      ]
    },
    {
      "name": "roundCanceled",
      "discriminator": [
        183,
        233,
        3,
        121,
        24,
        77,
        193,
        199
      ]
    },
    {
      "name": "roundFinished",
      "discriminator": [
        219,
        203,
        57,
        176,
        225,
        115,
        234,
        93
      ]
    },
    {
      "name": "ticketPurchased",
      "discriminator": [
        108,
        59,
        246,
        95,
        84,
        145,
        13,
        71
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidRoundTiming",
      "msg": "Неверное время раунда"
    },
    {
      "code": 6001,
      "name": "invalidTicketPrice",
      "msg": "Неверная цена билета"
    },
    {
      "code": 6002,
      "name": "invalidFee",
      "msg": "Неверная комиссия"
    },
    {
      "code": 6003,
      "name": "invalidRewardSharing",
      "msg": "Неверное распределение наград"
    },
    {
      "code": 6004,
      "name": "roundNotInProgress",
      "msg": "Раунд не в процессе"
    },
    {
      "code": 6005,
      "name": "roundNotFinished",
      "msg": "Раунд не завершен"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "Нет авторизации"
    },
    {
      "code": 6007,
      "name": "overflow",
      "msg": ""
    },
    {
      "code": 6008,
      "name": "roundHasPurchases",
      "msg": "Нельзя отменить раунд: есть покупки"
    }
  ],
  "types": [
    {
      "name": "lotteryState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "latestRoundId",
            "type": "u64"
          },
          {
            "name": "feeBalance",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "newRoundInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "startTimestamp",
            "type": "i64"
          },
          {
            "name": "finishTimestamp",
            "type": "i64"
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "purchase",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "ticketCount",
            "type": "u64"
          },
          {
            "name": "cumulativeTickets",
            "type": "u64"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "purchaseIndex",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "round",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "startTimestamp",
            "type": "i64"
          },
          {
            "name": "finishTimestamp",
            "type": "i64"
          },
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "winnersCount",
            "type": "u16"
          },
          {
            "name": "rewardSharingBps",
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "ticketPrice",
            "type": "u64"
          },
          {
            "name": "isFinished",
            "type": "bool"
          },
          {
            "name": "totalTickets",
            "type": "u64"
          },
          {
            "name": "pot",
            "type": "u64"
          },
          {
            "name": "purchaseCount",
            "type": "u64"
          },
          {
            "name": "winningTickets",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "roundCanceled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundFinished",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "pot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ticketPurchased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "startTicket",
            "type": "u64"
          },
          {
            "name": "endTicket",
            "type": "u64"
          },
          {
            "name": "ticketCount",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vrfClientState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "vrf",
            "type": "pubkey"
          },
          {
            "name": "randomness",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
