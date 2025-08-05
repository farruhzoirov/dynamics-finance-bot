const trains = {
  data: {
    directions: {
      forward: {
        trains: [
          {
            type: 'Скоростные',
            number: '710Ф',
            departureDate: '31.08.2025 08:40',
            timeOnWay: '201',
            originRoute: {
              depStationName: 'Ташкент-Пассажирский',
              arvStationName: 'Бухара'
            },
            arrivalDate: '31.08.2025 12:05',
            brand: 'Sharq',
            cars: [
              {
                type: 'Econom - Bukhara',
                freeSeats: 477,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 477,
                    tariff: 179250
                  }
                ]
              },
              {
                type: 'Biznes - Andijan',
                freeSeats: 29,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 29,
                    tariff: 266700
                  }
                ]
              },
              {
                type: 'VIP-Andijon',
                freeSeats: 23,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 23,
                    tariff: 498030
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'Ташкент-Пассажирский',
              depStationCode: '2900001',
              arvStationName: 'Самарканд',
              arvStationCode: '2900700'
            },
            trainId: '710Ф_2025-08-31',
            comment: null
          },
          {
            type: 'Высокоскоростные',
            number: '768Ф',
            departureDate: '31.08.2025 07:30',
            timeOnWay: '133',
            originRoute: {
              depStationName: 'Ташкент-Пассажирский',
              arvStationName: 'Бухара'
            },
            arrivalDate: '31.08.2025 09:43',
            brand: 'Afrosiyob',
            cars: [
              {
                type: 'Ekonom - Afrosyob',
                freeSeats: 215,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 215,
                    tariff: 270000
                  }
                ]
              },
              {
                type: 'Biznes - Afrosiyob',
                freeSeats: 48,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 48,
                    tariff: 396000
                  }
                ]
              },
              {
                type: 'VIP-Afrosiyob',
                freeSeats: 22,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 22,
                    tariff: 545000
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'Ташкент-Пассажирский',
              depStationCode: '2900001',
              arvStationName: 'Самарканд',
              arvStationCode: '2900700'
            },
            trainId: '768Ф_2025-08-31',
            comment: null
          },
          {
            type: 'Скоростные',
            number: '716Ф',
            departureDate: '31.08.2025 09:12',
            timeOnWay: '201',
            originRoute: {
              depStationName: 'Ташкент-Пассажирский',
              arvStationName: 'Карши'
            },
            arrivalDate: '31.08.2025 12:37',
            brand: 'Nasaf',
            cars: [
              {
                type: 'Econom 47',
                freeSeats: 188,
                tariffs: [
                  {
                    classServiceType: '',
                    freeSeats: 188,
                    tariff: 179250
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'Ташкент-Пассажирский',
              depStationCode: '2900001',
              arvStationName: 'Самарканд',
              arvStationCode: '2900700'
            },
            trainId: '716Ф_2025-08-31',
            comment: null
          },
          {
            type: 'СК',
            number: '127Ф',
            departureDate: '31.08.2025 01:07',
            timeOnWay: '04:11',
            originRoute: {
              depStationName: 'Andijan1',
              arvStationName: 'Qung`irot'
            },
            arrivalDate: '31.08.2025 05:18',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 109,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 26,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'СКРСТ',
            number: '778Ф',
            departureDate: '31.08.2025 06:03',
            timeOnWay: '02:18',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buxoro'
            },
            arrivalDate: '31.08.2025 08:21',
            brand: 'Afrosiyob',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 83,
                tariffs: [
                  {
                    classServiceType: '2Е',
                    freeSeats: 83,
                    tariff: 270000
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'скрст',
            number: '774Ф',
            departureDate: '31.08.2025 06:30',
            timeOnWay: '02:18',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Shahrisabz'
            },
            arrivalDate: '31.08.2025 08:48',
            brand: 'Afrosiyob',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 102,
                tariffs: [
                  {
                    classServiceType: '2Е',
                    freeSeats: 102,
                    tariff: 270000
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'скрст',
            number: '768Ф',
            departureDate: '31.08.2025 07:21',
            timeOnWay: '02:18',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buхoro'
            },
            arrivalDate: '31.08.2025 09:39',
            brand: 'Afrosiyob',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 50,
                tariffs: [
                  {
                    classServiceType: '2Е',
                    freeSeats: 50,
                    tariff: 270000
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'скрст',
            number: '766Ф',
            departureDate: '31.08.2025 07:52',
            timeOnWay: '02:30',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Samarqand'
            },
            arrivalDate: '31.08.2025 10:22',
            brand: 'Afrosiyob',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 3,
                tariffs: [
                  {
                    classServiceType: '2Е',
                    freeSeats: 3,
                    tariff: 270000
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'СК',
            number: '710Ф',
            departureDate: '31.08.2025 08:40',
            timeOnWay: '03:25',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buxoro'
            },
            arrivalDate: '31.08.2025 12:05',
            brand: 'Sharq',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 408,
                tariffs: [
                  {
                    classServiceType: '1С',
                    freeSeats: 7,
                    tariff: 266700
                  },
                  {
                    classServiceType: '1В',
                    freeSeats: 19,
                    tariff: 498030
                  },
                  {
                    classServiceType: '2В',
                    freeSeats: 382,
                    tariff: 179250
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'СК',
            number: '716Ф',
            departureDate: '31.08.2025 09:12',
            timeOnWay: '03:25',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Qarshi'
            },
            arrivalDate: '31.08.2025 12:37',
            brand: 'Nasaf',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 143,
                tariffs: [
                  {
                    classServiceType: '2В',
                    freeSeats: 143,
                    tariff: 179250
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'ск',
            number: '054Ф',
            departureDate: '31.08.2025 13:15',
            timeOnWay: '03:50',
            originRoute: {
              depStationName: 'Toshkent janubiy',
              arvStationName: 'Qung`irot'
            },
            arrivalDate: '31.08.2025 17:05',
            brand: 'скорый',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 259,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 32,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'СК',
            number: '712Ф',
            departureDate: '31.08.2025 20:13',
            timeOnWay: '03:32',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buxoro'
            },
            arrivalDate: '31.08.2025 23:45',
            brand: 'Sharq',
            cars: [
              {
                type: "O'rindiqli",
                freeSeats: 370,
                tariffs: [
                  {
                    classServiceType: '1С',
                    freeSeats: 6,
                    tariff: 266700
                  },
                  {
                    classServiceType: '2В',
                    freeSeats: 190,
                    tariff: 179250
                  },
                  {
                    classServiceType: '2В',
                    freeSeats: 174,
                    tariff: 179250
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'ск',
            number: '082Ф',
            departureDate: '31.08.2025 20:49',
            timeOnWay: '04:03',
            originRoute: {
              depStationName: 'Toshkent janubiy',
              arvStationName: 'Sariosiyo'
            },
            arrivalDate: '01.09.2025 00:52',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 133,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 35,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              },
              {
                type: 'SV',
                freeSeats: 6,
                tariffs: [
                  {
                    classServiceType: '1Л',
                    freeSeats: 0,
                    tariff: 315060
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'ск',
            number: '080Ф',
            departureDate: '31.08.2025 20:50',
            timeOnWay: '04:02',
            originRoute: {
              depStationName: 'Toshkent janubiy',
              arvStationName: 'Termez'
            },
            arrivalDate: '01.09.2025 00:52',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Umumiy',
                freeSeats: 81,
                tariffs: [
                  {
                    classServiceType: '3О',
                    freeSeats: 81,
                    tariff: 90390
                  }
                ]
              },
              {
                type: 'Plaskartli',
                freeSeats: 120,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 63,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              },
              {
                type: 'SV',
                freeSeats: 9,
                tariffs: [
                  {
                    classServiceType: '1Л',
                    freeSeats: 0,
                    tariff: 315060
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'ск',
            number: '058З',
            departureDate: '31.08.2025 21:40',
            timeOnWay: '04:02',
            originRoute: {
              depStationName: 'Toshkent janubiy',
              arvStationName: 'Shovot'
            },
            arrivalDate: '01.09.2025 01:42',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 294,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 62,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'СК',
            number: '125Ч',
            departureDate: '31.08.2025 22:48',
            timeOnWay: '03:55',
            originRoute: {
              depStationName: 'Andijon 1',
              arvStationName: 'Urganch'
            },
            arrivalDate: '01.09.2025 02:43',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 170,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 18,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'ск',
            number: '129Ф',
            departureDate: '31.08.2025 23:29',
            timeOnWay: '03:50',
            originRoute: {
              depStationName: 'Andijon',
              arvStationName: 'Termez'
            },
            arrivalDate: '01.09.2025 03:19',
            brand: 'Пассажирский',
            cars: [
              {
                type: 'Plaskartli',
                freeSeats: 174,
                tariffs: [
                  {
                    classServiceType: '3П',
                    freeSeats: 0,
                    tariff: 140980
                  }
                ]
              },
              {
                type: 'Kupe',
                freeSeats: 32,
                tariffs: [
                  {
                    classServiceType: '2К',
                    freeSeats: 0,
                    tariff: 186820
                  }
                ]
              }
            ],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'скрст',
            number: '770Ф',
            departureDate: '31.08.2025 08:29',
            timeOnWay: '02:24',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buxoro'
            },
            arrivalDate: '31.08.2025 10:53',
            brand: 'Afrosiyob',
            cars: [],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          },
          {
            type: 'скрст',
            number: '772Ф',
            departureDate: '31.08.2025 19:41',
            timeOnWay: '02:29',
            originRoute: {
              depStationName: 'Toshkent Markaziy',
              arvStationName: 'Buxoro'
            },
            arrivalDate: '31.08.2025 22:10',
            brand: 'Afrosiyob',
            cars: [],
            subRoute: {
              depStationName: 'TOSHKENT',
              depStationCode: '2900000',
              arvStationName: 'SAMARQAND',
              arvStationCode: '2900700'
            },
            trainId: null,
            comment: null
          }
        ]
      }
    }
  },
  error: null
};

const findTrain = trains.data.directions.forward.trains.filter(
  (num) => num.number === '710Ф'
);

console.log(findTrain[1].cars);

console.log(new Date().toLocaleDateString('ru-RU'));
