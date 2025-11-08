/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_lottery.json`.
 */
export type SolanaLottery = {
  "address": "7V4NGWsmQhdUrNtnmUN61Y8Edrq2mAyHt1gLy4XXrqA",
  "metadata": {
    "name": "solanaLottery",
    "version": "0.1.1",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelRound",
      "docs": [
        "Cancel a round if there are zero purchases (close the round account)"
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
          "name": "roundEscrow",
          "docs": [
            "Escrow account to hold round SOL (закрываем вместе с раундом)"
          ],
          "writable": true
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
          "name": "roundId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimAdminFees",
      "docs": [
        "Withdraw fees by the owner (SOL)"
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
      "name": "finishRound",
      "docs": [
        "Finish round: distribute SOL to winners and the fee",
        "NOTE: Используется когда победители уже были определены off-chain"
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
          "name": "roundEscrow",
          "docs": [
            "Escrow account to hold round SOL"
          ],
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
                  100,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "roundEscrow",
          "docs": [
            "Escrow account to hold round SOL"
          ],
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
                  100,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
        "Buy tickets (paid in SOL)"
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
          "name": "roundEscrow",
          "docs": [
            "Escrow account to hold round SOL (separate from data PDA)"
          ],
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
                  100,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "referrerSettingsForPlayer",
          "writable": true
        },
        {
          "name": "watcherProgram",
          "address": "DEZuxh9EX8XaXb7AcsQJq9JxY3aN8huHSvTiP35AZGP4"
        },
        {
          "name": "profitForRound",
          "writable": true
        },
        {
          "name": "roundTotalProfit",
          "writable": true
        },
        {
          "name": "referralEscrow",
          "writable": true
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
    },
    {
      "name": "requestOnDemandRandomness",
      "docs": [
        "Persist VRF state with validated Switchboard randomness account"
      ],
      "discriminator": [
        146,
        145,
        162,
        229,
        141,
        144,
        115,
        53
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
          "name": "randomnessAccount"
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
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
      "name": "settleOnDemandRandomness",
      "docs": [
        "Read randomness from Switchboard On-Demand, generate winners, and finish the round with payouts",
        "SECURITY NOTE: Админ выбирает randomness account и вызывает settle.",
        "Это централизованная модель доверия к администратору."
      ],
      "discriminator": [
        147,
        4,
        137,
        96,
        249,
        227,
        98,
        48
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
          "name": "roundEscrow",
          "docs": [
            "Escrow account to hold round SOL"
          ],
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
                  100,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
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
          "name": "randomnessAccount"
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
      "name": "prizePaid",
      "discriminator": [
        6,
        20,
        237,
        248,
        90,
        77,
        102,
        211
      ]
    },
    {
      "name": "randomnessRequested",
      "discriminator": [
        10,
        64,
        183,
        29,
        104,
        63,
        90,
        149
      ]
    },
    {
      "name": "randomnessSettled",
      "discriminator": [
        219,
        235,
        45,
        239,
        116,
        19,
        92,
        74
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
      "msg": "Invalid round timing"
    },
    {
      "code": 6001,
      "name": "invalidTicketPrice",
      "msg": "Invalid ticket price"
    },
    {
      "code": 6002,
      "name": "invalidFee",
      "msg": "Invalid fee"
    },
    {
      "code": 6003,
      "name": "invalidRewardSharing",
      "msg": "Invalid reward sharing configuration"
    },
    {
      "code": 6004,
      "name": "roundNotInProgress",
      "msg": "Round not in progress"
    },
    {
      "code": 6005,
      "name": "roundNotFinished",
      "msg": "Round not finished"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6007,
      "name": "overflow",
      "msg": "overflow"
    },
    {
      "code": 6008,
      "name": "roundHasPurchases",
      "msg": "Cannot cancel round: purchases exist"
    },
    {
      "code": 6009,
      "name": "alreadyConsumed",
      "msg": "Winners already generated"
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
      "name": "prizePaid",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "ticket",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "pubkey"
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
      "name": "randomnessRequested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "randomnessAccount",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "randomnessSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "winningTickets",
            "type": {
              "vec": "u64"
            }
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

export {  };