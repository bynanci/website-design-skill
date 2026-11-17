/* Public synthetic inputs shared by both visual directions. */
window.DashboardFixtureData = {
  "AccountSummary": {
    "name": "Harbor Cloud",
    "summary": "雲端基礎設施與企業網路服務",
    "details": [
      "林示範",
      "資訊服務",
      "策略成長",
      "2026/11/16"
    ]
  },
  "MetricGrid": {
    "items": [
      {
        "title": "服務營收",
        "glyph": "▦",
        "value": "NT$ 842",
        "unit": "萬",
        "positive": false,
        "foot": "2026 Q3 · 季營收"
      },
      {
        "title": "營收變化",
        "glyph": "⌁",
        "value": "+12.8",
        "unit": "%",
        "positive": true,
        "foot": "相較上一季"
      },
      {
        "title": "進行中案件",
        "glyph": "≡",
        "value": "03",
        "unit": "件",
        "positive": false,
        "foot": "其中 1 件需優先關注"
      },
      {
        "title": "商機線索",
        "glyph": "✳",
        "value": "02",
        "unit": "項",
        "positive": false,
        "foot": "待 AM 確認可行性"
      }
    ]
  },
  "InsightList": {
    "items": [
      {
        "title": "雲端專線營收連續上升",
        "description": "近三個月雲端專線費用增加，可能與容量擴充有關；尚須確認實際部署原因。",
        "source": "來源：雲端專線月結明細",
        "href": "#evidence-01",
        "kind": "推論 · 待驗證",
        "question": "近期是否有新的系統上雲或跨區備援需求？",
        "priority": "優先關注"
      },
      {
        "title": "網路維運案件回覆時間拉長",
        "description": "本季維運工單有兩次超過內部預估處理時間，建議確認客戶的實際影響。",
        "source": "來源：維運案件紀錄",
        "href": "#evidence-02",
        "kind": "事實摘要",
        "question": "目前案件回覆速度有影響貴司的作業安排嗎？",
        "priority": null
      },
      {
        "title": "既有服務續約期接近",
        "description": "企業網路服務預定於下季評估續約，需由 AM 確認合約與需求變更。",
        "source": "來源：合約到期清單",
        "href": "#evidence-03",
        "kind": "事實摘要",
        "question": "對既有網路服務是否有預期調整？",
        "priority": null
      },
      {
        "title": "異地備援可能有擴充空間",
        "description": "依既有產品組合推測備援覆蓋範圍可再盤點，目前沒有直接購買意向證據。",
        "source": "來源：產品持有清單",
        "href": "#evidence-04",
        "kind": "假設 · 待驗證",
        "question": "目前異地備援規劃最在意的風險是什麼？",
        "priority": null
      }
    ]
  },
  "OpportunityList": {
    "items": [
      {
        "title": "備援專線容量盤點",
        "description": "先驗證高可用性需求，再評估適合的方案。",
        "status": "待需求訪談"
      },
      {
        "title": "維運監測服務升級",
        "description": "若回覆時效影響營運，可討論主動告警與 SLA。",
        "status": "待內部確認"
      }
    ]
  },
  "CaseTable": {
    "items": [
      [
        "CS-2026-081",
        "雲端專線延遲",
        "高",
        "許工程師",
        "11/18",
        "調查中",
        "查看詳情"
      ],
      [
        "CS-2026-076",
        "備援路由調整",
        "一般",
        "陳工程師",
        "11/20",
        "待確認",
        "查看詳情"
      ],
      [
        "CS-2026-070",
        "服務監測報表",
        "一般",
        "張工程師",
        "11/21",
        "處理中",
        "查看詳情"
      ]
    ]
  },
  "RevenueMix": {
    "title": "營收組成",
    "mix": [
      [
        "雲端專線",
        302
      ],
      [
        "企業網路",
        226
      ],
      [
        "資訊安全",
        138
      ],
      [
        "資料中心",
        102
      ],
      [
        "其他服務",
        74
      ]
    ]
  },
  "NotesEditor": {
    "title": "人工記錄"
  },
  "RevenueTrend": {
    "title": "服務營收趨勢",
    "months": [
      "6 月",
      "7 月",
      "8 月",
      "9 月",
      "10 月",
      "11 月"
    ],
    "trend": [
      [
        "雲端專線",
        [
          82,
          88,
          91,
          101,
          108,
          121
        ]
      ],
      [
        "企業網路",
        [
          78,
          79,
          77,
          80,
          81,
          84
        ]
      ],
      [
        "資訊安全",
        [
          36,
          38,
          42,
          46,
          49,
          52
        ]
      ]
    ]
  }
};
