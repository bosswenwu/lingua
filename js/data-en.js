/* ==========================================================================
   Lingua · 课程内容 — 英语 (English)
   数据结构：
   COURSES.<lang> = { code,name,native,flag,locale,scriptFont,greeting,blurb,levels[] }
   level = { id,name,badge,goal,units[] }
   unit  = { id,name,theme,lessons[] }
   lesson= { id,title,minutes,xp,focus,vocab[],grammar[],listening[],speaking[] }
     vocab    : { t 词条, r 音标/罗马字, m 释义, ex 例句 }
     grammar  : { point 语法点, rule 一句话规则, examples[], drills[{q,opts[],a,why}] }
     listening: { text 音频文本, q 问题, opts[], a, tr 中文翻译 }
     speaking : { text 跟读文本, tr 中文翻译 }
   ========================================================================== */
window.COURSES_EN = {
  code: "en",
  name: "英语",
  native: "English",
  flag: "🇬🇧",
  locale: "en-US",
  scriptFont: "en",
  greeting: "Hello",
  color: "#2F4B7C",
  blurb: "从日常问候到职场表达，用最短的路径打通听说读写。",
  highlights: ["全球通用度最高", "12 个高频场景", "商务与考试双线"],
  levels: [
    {
      id: "en-a1",
      name: "A1 入门",
      badge: "A1",
      goal: "能完成自我介绍、问路、点餐等日常对话。",
      units: [
        {
          id: "en-u1",
          name: "初次见面",
          theme: "问候、自我介绍与基础句型",
          lessons: [
            {
              id: "en-l1",
              title: "打招呼与道别",
              minutes: 8,
              xp: 40,
              focus: "日常问候",
              vocab: [
                { t: "hello", r: "/həˈloʊ/", m: "你好", ex: "Hello, it's nice to see you again." },
                { t: "good morning", r: "/ɡʊd ˈmɔːrnɪŋ/", m: "早上好", ex: "Good morning, everyone. Let's begin." },
                { t: "nice to meet you", r: "/naɪs tə miːt juː/", m: "很高兴认识你", ex: "I'm Lin. Nice to meet you." },
                { t: "how are you", r: "/haʊ ɑːr juː/", m: "你好吗", ex: "How are you today? I'm fine, thanks." },
                { t: "see you later", r: "/siː juː ˈleɪtər/", m: "回头见", ex: "See you later, Tom. Have a good day." },
                { t: "thank you", r: "/θæŋk juː/", m: "谢谢", ex: "Thank you for your help today." }
              ],
              grammar: [
                {
                  point: "be 动词：am / is / are",
                  rule: "主语决定形式——I 跟 am，he/she/it 跟 is，you/we/they 跟 are。",
                  examples: ["I am a student.", "She is my teacher.", "They are from Japan."],
                  drills: [
                    { q: "___ you from China?", opts: ["Am", "Is", "Are", "Be"], a: 2, why: "主语 you 固定搭配 are。" },
                    { q: "He ___ my new classmate.", opts: ["am", "is", "are", "be"], a: 1, why: "第三人称单数 he 用 is。" }
                  ]
                },
                {
                  point: "问候语的回答方式",
                  rule: "How are you? 的常见回答是 I'm fine / I'm good，并回问一句 And you?",
                  examples: ["How are you? — I'm fine, thanks. And you?", "How's it going? — Pretty good!"],
                  drills: [
                    { q: "别人说 Nice to meet you，最自然的回应是？", opts: ["Nice to meet you, too.", "You are welcome.", "Yes, I do."], a: 0, why: "同句回敬是英语里最标准的礼貌回应。" }
                  ]
                }
              ],
              listening: [
                { text: "Hi, I'm Anna. Nice to meet you.", q: "说话人的名字是什么？", opts: ["Emma", "Anna", "Amy"], a: 1, tr: "你好，我是 Anna。很高兴认识你。" },
                { text: "Good morning! How are you today?", q: "这句话最可能出现在什么时间？", opts: ["早上", "深夜", "傍晚"], a: 0, tr: "早上好！你今天怎么样？" }
              ],
              speaking: [
                { text: "Hello, I'm Lin. Nice to meet you.", tr: "你好，我是林。很高兴认识你。" },
                { text: "Good morning! How are you today?", tr: "早上好！你今天过得怎么样？" }
              ]
            },
            {
              id: "en-l2",
              title: "介绍自己",
              minutes: 9,
              xp: 45,
              focus: "个人信息表达",
              vocab: [
                { t: "I'm from", r: "/aɪm frəm/", m: "我来自", ex: "I'm from Guangzhou, a city in the south." },
                { t: "I live in", r: "/aɪ lɪv ɪn/", m: "我住在", ex: "I live in Beijing now." },
                { t: "I work as", r: "/aɪ wɜːrk æz/", m: "我从事……工作", ex: "I work as a designer." },
                { t: "student", r: "/ˈstuːdnt/", m: "学生", ex: "I'm a second-year student." },
                { t: "hobby", r: "/ˈhɑːbi/", m: "爱好", ex: "My hobby is photography." },
                { t: "years old", r: "/jɪrz oʊld/", m: "……岁", ex: "My brother is ten years old." }
              ],
              grammar: [
                {
                  point: "一般现在时（实义动词）",
                  rule: "第三人称单数动词加 -s/-es；其他人称用动词原形，疑问和否定借用 do/does。",
                  examples: ["I live in Shanghai.", "She lives in Osaka.", "Do you speak Japanese?"],
                  drills: [
                    { q: "She ___ in Tokyo.", opts: ["live", "lives", "living", "is live"], a: 1, why: "主语 she 是第三人称单数，动词加 -s。" },
                    { q: "___ you work here?", opts: ["Does", "Do", "Are", "Is"], a: 1, why: "主语 you 用助动词 do 提问。" }
                  ]
                },
                {
                  point: "a / an 的选择",
                  rule: "看后面单词的读音：辅音音素前用 a，元音音素前用 an。",
                  examples: ["a teacher", "an engineer", "an hour", "a university"],
                  drills: [
                    { q: "I'm ___ engineer.", opts: ["a", "an", "the", "/"], a: 1, why: "engineer 以元音音素 /e/ 开头，用 an。" }
                  ]
                }
              ],
              listening: [
                { text: "I'm Ken. I live in Seoul and I work as a chef.", q: "Ken 的职业是什么？", opts: ["厨师", "老师", "医生"], a: 0, tr: "我是 Ken。我住在首尔，是一名厨师。" },
                { text: "Hi, my name is Yuki. I'm from Japan and I'm a student.", q: "Yuki 来自哪里？", opts: ["韩国", "日本", "中国"], a: 1, tr: "你好，我叫 Yuki。我来自日本，是一名学生。" }
              ],
              speaking: [
                { text: "I'm Lin. I live in Shenzhen and I work as an engineer.", tr: "我是林。我住在深圳，是一名工程师。" },
                { text: "Nice to meet you. My hobby is hiking.", tr: "很高兴认识你。我的爱好是徒步。" }
              ]
            }
          ]
        },
        {
          id: "en-u2",
          name: "日常所需",
          theme: "时间、数字与消费场景",
          lessons: [
            {
              id: "en-l3",
              title: "数字与时间",
              minutes: 8,
              xp: 40,
              focus: "时间表达",
              vocab: [
                { t: "o'clock", r: "/əˈklɑːk/", m: "……点整", ex: "The meeting starts at nine o'clock." },
                { t: "half past", r: "/hæf pæst/", m: "……点半", ex: "It's half past six now." },
                { t: "quarter", r: "/ˈkwɔːrtər/", m: "一刻钟", ex: "It's a quarter to eight." },
                { t: "noon", r: "/nuːn/", m: "中午", ex: "We'll have lunch at noon." },
                { t: "minute", r: "/ˈmɪnɪt/", m: "分钟", ex: "Please wait five minutes." },
                { t: "delay", r: "/dɪˈleɪ/", m: "延误", ex: "There is a ten-minute delay." }
              ],
              grammar: [
                {
                  point: "询问与表达时间",
                  rule: "What time is it? 回答用 It's + 时间；介词 at 用于具体时刻。",
                  examples: ["What time is it? — It's seven thirty.", "The train leaves at 6 p.m."],
                  drills: [
                    { q: "7:45 的正确读法是？", opts: ["a quarter past seven", "a quarter to eight", "half past seven"], a: 1, why: "接近下个整点时用 a quarter to + 下一个小时。" },
                    { q: "The class begins ___ nine.", opts: ["in", "on", "at", "for"], a: 2, why: "具体时刻前用介词 at。" }
                  ]
                }
              ],
              listening: [
                { text: "The train to Boston leaves at half past eight.", q: "火车几点出发？", opts: ["8:00", "8:30", "8:15"], a: 1, tr: "去波士顿的火车八点半出发。" },
                { text: "Sorry, there is a twenty-minute delay.", q: "延误了多久？", opts: ["10 分钟", "20 分钟", "30 分钟"], a: 1, tr: "抱歉，延误了二十分钟。" }
              ],
              speaking: [
                { text: "Excuse me, what time is it now?", tr: "打扰一下，现在几点了？" },
                { text: "It's a quarter to nine.", tr: "现在是八点四十五。" }
              ]
            },
            {
              id: "en-l4",
              title: "点餐与购物",
              minutes: 10,
              xp: 50,
              focus: "消费场景",
              vocab: [
                { t: "menu", r: "/ˈmenjuː/", m: "菜单", ex: "Could I see the menu, please?" },
                { t: "order", r: "/ˈɔːrdər/", m: "点（餐）", ex: "I'd like to order a coffee." },
                { t: "bill", r: "/bɪl/", m: "账单", ex: "Can we have the bill, please?" },
                { t: "receipt", r: "/rɪˈsiːt/", m: "收据", ex: "Keep the receipt for the refund." },
                { t: "size", r: "/saɪz/", m: "尺码", ex: "Do you have this in a larger size?" },
                { t: "discount", r: "/ˈdɪskaʊnt/", m: "折扣", ex: "Members get a ten percent discount." }
              ],
              grammar: [
                {
                  point: "礼貌请求：Could I / I'd like",
                  rule: "Could I have... 比 Can I have... 更客气；I'd like to... 用于表达想要的。",
                  examples: ["Could I have a glass of water?", "I'd like to order the salmon."],
                  drills: [
                    { q: "最礼貌的点单方式是？", opts: ["Give me a coffee.", "Could I have a coffee, please?", "I want coffee."], a: 1, why: "Could I ... please 是餐厅里最得体的表达。" }
                  ]
                },
                {
                  point: "How much / How many",
                  rule: "how much 修饰不可数名词，how many 修饰可数名词复数。",
                  examples: ["How much is this shirt?", "How many tickets do you need?"],
                  drills: [
                    { q: "___ water do you need?", opts: ["How many", "How much", "How long"], a: 1, why: "water 不可数，用 how much。" }
                  ]
                }
              ],
              listening: [
                { text: "Welcome! Are you ready to order?", q: "服务员在问什么？", opts: ["是否要结账", "是否可以点餐", "是否需要打包"], a: 1, tr: "欢迎光临！您准备好点餐了吗？" },
                { text: "That comes to forty-five dollars, and you get a ten percent discount today.", q: "今天有什么优惠？", opts: ["打九折", "打八折", "免运费"], a: 0, tr: "一共四十五美元，今天可以打九折。" }
              ],
              speaking: [
                { text: "Could I have the menu, please?", tr: "可以给我看一下菜单吗？" },
                { text: "I'd like to order a large coffee.", tr: "我想点一杯大杯咖啡。" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "en-a2",
      name: "A2 进阶",
      badge: "A2",
      goal: "能叙述过去与计划未来，应付旅行和日常事务。",
      units: [
        {
          id: "en-u3",
          name: "串联生活",
          theme: "时态：过去与将来",
          lessons: [
            {
              id: "en-l5",
              title: "讲述昨天",
              minutes: 10,
              xp: 55,
              focus: "一般过去时",
              vocab: [
                { t: "yesterday", r: "/ˈjestərdeɪ/", m: "昨天", ex: "I finished the report yesterday." },
                { t: "last night", r: "/læst naɪt/", m: "昨晚", ex: "We watched a movie last night." },
                { t: "ago", r: "/əˈɡoʊ/", m: "……以前", ex: "She moved here two years ago." },
                { t: "visited", r: "/ˈvɪzɪtɪd/", m: "参观、拜访", ex: "They visited the museum on Sunday." },
                { t: "happened", r: "/ˈhæpənd/", m: "发生", ex: "What happened after that?" },
                { t: "already", r: "/ɔːlˈredi/", m: "已经", ex: "I had already left when you called." }
              ],
              grammar: [
                {
                  point: "一般过去时：规则与不规则",
                  rule: "规则动词加 -ed；不规则动词需记忆（go→went, see→saw, take→took）。",
                  examples: ["I worked late last night.", "She went to Kyoto last spring.", "We saw a great film."],
                  drills: [
                    { q: "Yesterday I ___ to the gym.", opts: ["go", "goes", "went", "going"], a: 2, why: "过去的动作用 go 的过去式 went。" },
                    { q: "They ___ the project last week.", opts: ["finish", "finished", "finishing", "finishes"], a: 1, why: "规则动词 finish 的过去式加 -ed。" }
                  ]
                },
                {
                  point: "过去时间的标志词",
                  rule: "yesterday / last ... / ... ago / in 2020 都提示使用一般过去时。",
                  examples: ["last month", "three days ago", "in 2019"],
                  drills: [
                    { q: "He arrived ___ .", opts: ["tomorrow", "two days ago", "next week"], a: 1, why: "two days ago 是典型的过去时间标志。" }
                  ]
                }
              ],
              listening: [
                { text: "I went to a small town last weekend and stayed there for two days.", q: "说话人上周末做了什么？", opts: ["去了小镇待了两天", "加班两天", "在家休息"], a: 0, tr: "我上周末去了一个小镇，在那里待了两天。" },
                { text: "Sorry, I missed your call. I was in a meeting an hour ago.", q: "一小时前说话人在做什么？", opts: ["开会", "开车", "睡觉"], a: 0, tr: "抱歉错过了你的电话，一小时前我在开会。" }
              ],
              speaking: [
                { text: "I visited Nanjing last summer and loved the food there.", tr: "我去年夏天去了南京，特别喜欢那里的食物。" },
                { text: "What did you do last weekend?", tr: "你上周末做了什么？" }
              ]
            },
            {
              id: "en-l6",
              title: "计划未来",
              minutes: 10,
              xp: 55,
              focus: "将来时",
              vocab: [
                { t: "tomorrow", r: "/təˈmɑːroʊ/", m: "明天", ex: "I'll call you tomorrow morning." },
                { t: "next week", r: "/nekst wiːk/", m: "下周", ex: "The course starts next week." },
                { t: "plan to", r: "/plæn tə/", m: "计划做", ex: "We plan to travel in October." },
                { t: "probably", r: "/ˈprɑːbəbli/", m: "大概、很可能", ex: "She'll probably arrive late." },
                { t: "decide", r: "/dɪˈsaɪd/", m: "决定", ex: "I haven't decided yet." },
                { t: "appointment", r: "/əˈpɔɪntmənt/", m: "预约", ex: "I have a dentist appointment at four." }
              ],
              grammar: [
                {
                  point: "be going to 与 will",
                  rule: "已计划好的安排用 be going to；临时决定或预测用 will。",
                  examples: ["I'm going to start a Japanese course.", "It will probably rain tonight."],
                  drills: [
                    { q: "I ___ meet my manager at ten tomorrow.", opts: ["am going to", "will be", "went to"], a: 0, why: "已约定好的安排用 be going to。" },
                    { q: "The phone is ringing. — I ___ get it.", opts: ["am going to", "will", "would"], a: 1, why: "当场做出的决定用 will。" }
                  ]
                }
              ],
              listening: [
                { text: "I'm going to take a Korean class next week, and I'll practice every morning.", q: "说话人下周要做什么？", opts: ["开始上韩语课", "去韩国旅行", "换工作"], a: 0, tr: "我下周要开始上韩语课，每天早上都会练习。" },
                { text: "We plan to move to a bigger apartment this year.", q: "今年的计划是什么？", opts: ["买辆车", "换更大的房子", "出国"], a: 1, tr: "我们计划今年搬到更大的房子。" }
              ],
              speaking: [
                { text: "I'm going to start learning Korean next month.", tr: "我下个月打算开始学韩语。" },
                { text: "What are you going to do this weekend?", tr: "这周末你打算做什么？" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "en-b1",
      name: "B1 中阶",
      badge: "B1",
      goal: "能就熟悉话题表达观点、处理突发问题与投诉。",
      units: [
        {
          id: "en-u4",
          name: "表达与解决",
          theme: "观点论证与问题处理",
          lessons: [
            {
              id: "en-l7",
              title: "表达观点",
              minutes: 12,
              xp: 65,
              focus: "论证与转折",
              vocab: [
                { t: "in my opinion", r: "/ɪn maɪ əˈpɪnjən/", m: "在我看来", ex: "In my opinion, the plan is too risky." },
                { t: "I agree", r: "/aɪ əˈɡriː/", m: "我同意", ex: "I agree with your first point." },
                { t: "on the other hand", r: "/ɑːn ði ˈʌðər hænd/", m: "另一方面", ex: "It's cheap; on the other hand, it's slow." },
                { t: "however", r: "/haʊˈevər/", m: "然而", ex: "However, the data tells a different story." },
                { t: "suggest", r: "/səˈdʒest/", m: "建议", ex: "I suggest we start with a small test." },
                { t: "point of view", r: "/pɔɪnt əv vjuː/", m: "观点", ex: "From my point of view, it works." }
              ],
              grammar: [
                {
                  point: "让步与转折的连接",
                  rule: "although / though 引导让步从句，however 作副词单独使用并用逗号隔开。",
                  examples: ["Although it's expensive, it works well.", "It's expensive. However, it works well."],
                  drills: [
                    { q: "___ the price is high, the quality is excellent.", opts: ["Although", "Because", "So"], a: 0, why: "表示让步用 Although。" },
                    { q: "The idea is good. ___ , we need more time.", opts: ["However", "Therefore", "Because"], a: 0, why: "前后语义转折，用 However。" }
                  ]
                },
                {
                  point: "表达建议的句式",
                  rule: "I suggest + 动名词 / I suggest that + 主语 (should) + 动词原形。",
                  examples: ["I suggest waiting one more week.", "I suggest that we should wait."],
                  drills: [
                    { q: "I suggest ___ a second opinion.", opts: ["to get", "getting", "get"], a: 1, why: "suggest 后接动名词，不接不定式。" }
                  ]
                }
              ],
              listening: [
                { text: "Although the proposal looks attractive, I'd like to see the numbers first.", q: "说话人的态度是？", opts: ["完全支持", "谨慎保留", "明确反对"], a: 1, tr: "虽然这个方案看上去很吸引人，但我想先看看数据。" },
                { text: "In my opinion, we should test it with a small group before the launch.", q: "说话人建议什么？", opts: ["直接上线", "先小范围测试", "放弃项目"], a: 1, tr: "在我看来，我们应该在正式发布前先在小范围测试。" }
              ],
              speaking: [
                { text: "In my opinion, the first option is more practical.", tr: "在我看来，第一个方案更实际。" },
                { text: "Although it costs more, it saves us time in the long run.", tr: "虽然成本更高，但长期来看能节省时间。" }
              ]
            },
            {
              id: "en-l8",
              title: "处理突发问题",
              minutes: 12,
              xp: 70,
              focus: "投诉与致歉",
              vocab: [
                { t: "complaint", r: "/kəmˈpleɪnt/", m: "投诉", ex: "We received a complaint about the delay." },
                { t: "refund", r: "/ˈriːfʌnd/", m: "退款", ex: "You can ask for a full refund." },
                { t: "apologize", r: "/əˈpɑːlədʒaɪz/", m: "道歉", ex: "I apologize for the inconvenience." },
                { t: "solve", r: "/sɑːlv/", m: "解决", ex: "Let's solve it before Friday." },
                { t: "responsible", r: "/rɪˈspɑːnsəbl/", m: "负责的", ex: "Who is responsible for this task?" },
                { t: "inconvenience", r: "/ˌɪnkənˈviːniəns/", m: "不便", ex: "We are sorry for the inconvenience." }
              ],
              grammar: [
                {
                  point: "情态动词表推测",
                  rule: "must 表肯定推测，might/may 表可能，can't 表否定推测。",
                  examples: ["She must be in a meeting.", "He might have missed the train.", "It can't be that hard."],
                  drills: [
                    { q: "The lights are off — she ___ be at home.", opts: ["must", "can't", "should"], a: 1, why: "灯是关的，推测她不在家，用 can't。" },
                    { q: "He's not answering. He ___ be busy.", opts: ["must", "can't", "needn't"], a: 0, why: "有依据的肯定推测用 must。" }
                  ]
                },
                {
                  point: "正式致歉结构",
                  rule: "I apologize for + 名词 / 动名词，再接补救措施。",
                  examples: ["I apologize for the late reply.", "I apologize for keeping you waiting."],
                  drills: [
                    { q: "I apologize ___ the mistake.", opts: ["to", "for", "about"], a: 1, why: "apologize for + 事由 是固定搭配。" }
                  ]
                }
              ],
              listening: [
                { text: "I'm calling about a complaint. My order arrived two days late.", q: "顾客投诉的问题是什么？", opts: ["商品损坏", "到货延迟两天", "发错地址"], a: 1, tr: "我打来是想投诉，我的订单晚到了两天。" },
                { text: "We sincerely apologize for the inconvenience. We'll send a full refund today.", q: "解决方案是什么？", opts: ["更换商品", "全额退款", "延长保修"], a: 1, tr: "我们为造成的不便真诚道歉，今天会全额退款。" }
              ],
              speaking: [
                { text: "I apologize for the delay. We'll solve it right away.", tr: "我为延误致歉，我们会立刻解决。" },
                { text: "He must have taken the wrong exit.", tr: "他一定是走错出口了。" }
              ]
            }
          ]
        }
      ]
    }
  ]
};