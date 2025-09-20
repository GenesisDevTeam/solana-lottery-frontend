/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/watcher_referral.json`.
 */
export type WatcherReferral = {
  "address": "j9RyfMTz4dc9twnFCUZLJzMmhacUqTFHQkCXr7uDpQf",
  "metadata": {
    "name": "watcherReferral",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Referral watcher program"
  },
  "instructions": [
    {
      "name": "generateReferralCode",
      "discriminator": [
        12,
        100,
        187,
        67,
        23,
        63,
        135,
        211
      ],
      "accounts": [
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "codeRef",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  100,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "codeIndex",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  100,
                  101,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "codeHash"
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "codeHash",
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
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
        },
        {
          "name": "signer",
          "type": "pubkey"
        },
        {
          "name": "lottery",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "presetReferralPercentage",
      "discriminator": [
        13,
        197,
        132,
        18,
        255,
        51,
        160,
        22
      ],
      "accounts": [
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "referrerSettings",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "referrer"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "referrer",
          "type": "pubkey"
        },
        {
          "name": "percentageBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "registerWithReferral",
      "discriminator": [
        225,
        60,
        154,
        41,
        165,
        127,
        133,
        130
      ],
      "accounts": [
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "userRef",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  101,
                  102
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "codeIndex",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  100,
                  101,
                  95,
                  104,
                  97,
                  115,
                  104
                ]
              },
              {
                "kind": "arg",
                "path": "codeHash"
              }
            ]
          }
        },
        {
          "name": "registrationStats",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "codeHash"
              }
            ]
          }
        },
        {
          "name": "referrerSettings",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "code_index.owner",
                "account": "codeIndex"
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
          "name": "backendSigner",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "codeHash",
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
      "name": "setCustomLimit",
      "discriminator": [
        109,
        217,
        88,
        253,
        56,
        15,
        0,
        46
      ],
      "accounts": [
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "referrerSettings",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "referrer"
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "state"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "referrer",
          "type": "pubkey"
        },
        {
          "name": "limit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDefaultProfitBps",
      "discriminator": [
        59,
        240,
        135,
        22,
        91,
        124,
        126,
        109
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        }
      ],
      "args": [
        {
          "name": "newBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setDefaultReferralLimit",
      "discriminator": [
        69,
        39,
        250,
        27,
        137,
        23,
        221,
        54
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "admin",
          "signer": true,
          "relations": [
            "state"
          ]
        }
      ],
      "args": [
        {
          "name": "newLimit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setSigner",
      "discriminator": [
        127,
        120,
        252,
        184,
        97,
        4,
        88,
        68
      ],
      "accounts": [
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newSigner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateProfit",
      "discriminator": [
        168,
        124,
        231,
        68,
        107,
        42,
        6,
        163
      ],
      "accounts": [
        {
          "name": "state",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  116,
                  99,
                  104,
                  101,
                  114,
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
          "name": "caller"
        },
        {
          "name": "userRefForPlayer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  101,
                  102
                ]
              },
              {
                "kind": "arg",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "referrerSettingsForPlayer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user_ref_for_player.referrer",
                "account": "userReferral"
              }
            ]
          }
        },
        {
          "name": "profitForRound",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user_ref_for_player.referrer",
                "account": "userReferral"
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "roundTotalProfit",
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
                  112,
                  114,
                  111,
                  102,
                  105,
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
          "name": "referralEscrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              }
            ]
          }
        },
        {
          "name": "systemPayer",
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
          "name": "player",
          "type": "pubkey"
        },
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "totalAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "viewReferrerForUser",
      "discriminator": [
        14,
        23,
        27,
        231,
        187,
        228,
        11,
        156
      ],
      "accounts": [
        {
          "name": "userRefForPlayer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  101,
                  102
                ]
              },
              {
                "kind": "arg",
                "path": "player"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "player",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "viewReferrerProfitForRound",
      "discriminator": [
        247,
        174,
        14,
        97,
        117,
        214,
        56,
        183
      ],
      "accounts": [
        {
          "name": "profitForRound",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "referrer"
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "referrer",
          "type": "pubkey"
        },
        {
          "name": "roundId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "viewReferrerSettings",
      "discriminator": [
        13,
        1,
        132,
        230,
        57,
        110,
        193,
        46
      ],
      "accounts": [
        {
          "name": "referrerSettings",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "referrer"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "referrer",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "viewRegistrationStats",
      "discriminator": [
        8,
        112,
        185,
        176,
        77,
        255,
        23,
        77
      ],
      "accounts": [
        {
          "name": "registrationStats",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  103
                ]
              },
              {
                "kind": "arg",
                "path": "codeHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "codeHash",
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
      "name": "viewRoundTotalProfit",
      "discriminator": [
        17,
        16,
        234,
        109,
        35,
        94,
        7,
        116
      ],
      "accounts": [
        {
          "name": "roundTotalProfit",
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
                  112,
                  114,
                  111,
                  102,
                  105,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
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
      "name": "withdrawProfitForRound",
      "docs": [
        "Вывод профита за конкретный раунд из escrow на кошелёк реферера"
      ],
      "discriminator": [
        241,
        146,
        0,
        151,
        55,
        70,
        123,
        191
      ],
      "accounts": [
        {
          "name": "profitForRound",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  102,
                  105,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "referrer"
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "roundTotalProfit",
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
                  112,
                  114,
                  111,
                  102,
                  105,
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
          "name": "referralEscrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  101,
                  114,
                  114,
                  97,
                  108,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              }
            ]
          }
        },
        {
          "name": "referrer",
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
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "codeIndex",
      "discriminator": [
        28,
        203,
        17,
        105,
        237,
        92,
        123,
        25
      ]
    },
    {
      "name": "codeRef",
      "discriminator": [
        102,
        77,
        88,
        26,
        218,
        79,
        62,
        193
      ]
    },
    {
      "name": "referrerProfitForRound",
      "discriminator": [
        14,
        205,
        92,
        112,
        103,
        173,
        18,
        199
      ]
    },
    {
      "name": "referrerSettings",
      "discriminator": [
        13,
        215,
        12,
        95,
        216,
        205,
        147,
        67
      ]
    },
    {
      "name": "registrationStats",
      "discriminator": [
        35,
        11,
        27,
        132,
        190,
        110,
        210,
        160
      ]
    },
    {
      "name": "roundTotalProfit",
      "discriminator": [
        174,
        194,
        19,
        122,
        71,
        106,
        44,
        104
      ]
    },
    {
      "name": "userReferral",
      "discriminator": [
        60,
        72,
        219,
        164,
        122,
        102,
        170,
        140
      ]
    },
    {
      "name": "watcherState",
      "discriminator": [
        34,
        71,
        47,
        31,
        166,
        132,
        100,
        255
      ]
    }
  ],
  "events": [
    {
      "name": "profitUpdated",
      "discriminator": [
        168,
        129,
        145,
        65,
        168,
        45,
        68,
        14
      ]
    },
    {
      "name": "profitWithdrawn",
      "discriminator": [
        165,
        15,
        185,
        73,
        134,
        218,
        84,
        78
      ]
    },
    {
      "name": "referrerForUser",
      "discriminator": [
        186,
        121,
        215,
        89,
        142,
        238,
        123,
        52
      ]
    },
    {
      "name": "referrerProfitView",
      "discriminator": [
        198,
        218,
        119,
        140,
        160,
        238,
        200,
        141
      ]
    },
    {
      "name": "referrerSettingsView",
      "discriminator": [
        130,
        13,
        56,
        133,
        66,
        148,
        232,
        89
      ]
    },
    {
      "name": "registrationStatsView",
      "discriminator": [
        8,
        210,
        73,
        59,
        179,
        48,
        151,
        5
      ]
    },
    {
      "name": "roundTotalProfitView",
      "discriminator": [
        4,
        125,
        224,
        21,
        245,
        59,
        62,
        3
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Нет авторизации"
    },
    {
      "code": 6001,
      "name": "alreadyRegistered",
      "msg": "Уже зарегистрирован"
    },
    {
      "code": 6002,
      "name": "referralLimitExceeded",
      "msg": "Превышен дневной лимит для кода"
    },
    {
      "code": 6003,
      "name": "invalidPercentage",
      "msg": "Неверный процент"
    },
    {
      "code": 6004,
      "name": "invalidLimit",
      "msg": "Неверный лимит"
    },
    {
      "code": 6005,
      "name": "insufficientEscrow",
      "msg": "Недостаточно средств в escrow"
    }
  ],
  "types": [
    {
      "name": "codeIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "codeHash",
            "type": {
              "array": [
                "u8",
                32
              ]
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
      "name": "codeRef",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "codeHash",
            "type": {
              "array": [
                "u8",
                32
              ]
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
      "name": "profitUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrerCode",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "profitWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "referrerForUser",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "codeHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "referrerProfitForRound",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "amount",
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
      "name": "referrerProfitView",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "referrerSettings",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "percentageBps",
            "type": "u16"
          },
          {
            "name": "customLimit",
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
      "name": "referrerSettingsView",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "percentageBps",
            "type": "u16"
          },
          {
            "name": "customLimit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "registrationStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "codeHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "day",
            "type": "i64"
          },
          {
            "name": "count",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "registrationStatsView",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "codeHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "day",
            "type": "i64"
          },
          {
            "name": "count",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "roundTotalProfit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "totalAmount",
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
      "name": "roundTotalProfitView",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userReferral",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "referrer",
            "type": "pubkey"
          },
          {
            "name": "referrerCode",
            "type": {
              "array": [
                "u8",
                32
              ]
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
      "name": "watcherState",
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
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "defaultProfitBps",
            "type": "u16"
          },
          {
            "name": "defaultReferralLimit",
            "type": "u64"
          },
          {
            "name": "lottery",
            "type": "pubkey"
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
