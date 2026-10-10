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
        },
        {
          id: "en-u5",
          name: "生活场景",
          theme: "家庭、人物与日常",
          lessons: [
            {
              id: "en-l9",
              title: "家庭与朋友",
              minutes: 10,
              xp: 50,
              focus: "家庭成员与人物描述",
              vocab: [
                { t: "family", r: "/ˈfæməli/", m: "家庭、家人", ex: "There are five people in my family." },
                { t: "parents", r: "/ˈperənts/", m: "父母", ex: "My parents live in a small town." },
                { t: "husband", r: "/ˈhʌzbənd/", m: "丈夫", ex: "Her husband works in a bank." },
                { t: "wife", r: "/waɪf/", m: "妻子", ex: "His wife is a nurse." },
                { t: "daughter", r: "/ˈdɔːtər/", m: "女儿", ex: "Their daughter is six years old." },
                { t: "son", r: "/sʌn/", m: "儿子", ex: "My son loves playing football." },
                { t: "cousin", r: "/ˈkʌzn/", m: "堂（表）兄弟姐妹", ex: "My cousin studies in London." },
                { t: "tall", r: "/tɔːl/", m: "高的", ex: "My older brother is very tall." },
                { t: "friendly", r: "/ˈfrendli/", m: "友好的", ex: "Our neighbors are kind and friendly." }
              ],
              grammar: [
                {
                  point: "形容词性物主代词",
                  rule: "my / your / his / her / its / our / their 放在名词前，表示“……的”。",
                  examples: ["Her name is Lucy.", "Their house is near the park.", "My father is a teacher."],
                  drills: [
                    { q: "This is my sister. ___ name is Amy.", opts: ["His", "Her", "She"], a: 1, why: "sister 是女性，名词前用形容词性物主代词 her。" },
                    { q: "They have a dog. ___ dog is cute.", opts: ["They", "Them", "Their"], a: 2, why: "名词 dog 前要用 their 表示“他们的”。" },
                    { q: "He loves ___ family very much.", opts: ["he", "him", "his"], a: 2, why: "family 前需要物主代词 his。" }
                  ]
                },
                {
                  point: "have / has 的用法",
                  rule: "have 用于 I / you / we / they，has 用于 he / she / it。",
                  examples: ["I have two brothers.", "She has a lovely daughter.", "We have a big family."],
                  drills: [
                    { q: "My sister ___ a new baby.", opts: ["have", "has", "having"], a: 1, why: "my sister 相当于第三人称单数，用 has。" },
                    { q: "They ___ three children.", opts: ["has", "have", "is"], a: 1, why: "主语 they 用 have。" }
                  ]
                }
              ],
              listening: [
                { text: "This is my family. My father is tall and my mother is very friendly.", q: "说话人的妈妈是什么样的人？", opts: ["很高", "很友好", "很安静"], a: 1, tr: "这是我的家人。我爸爸很高，我妈妈非常友好。" },
                { text: "Tom has a brother and a sister. His sister is only five.", q: "Tom 的妹妹几岁？", opts: ["三岁", "五岁", "七岁"], a: 1, tr: "Tom 有一个弟弟和一个妹妹，他妹妹只有五岁。" },
                { text: "My cousin Emma lives in London with her husband.", q: "Emma 和谁住在伦敦？", opts: ["她的丈夫", "她的父母", "她的孩子"], a: 0, tr: "我的表姐 Emma 和她丈夫住在伦敦。" }
              ],
              speaking: [
                { text: "There are four people in my family.", tr: "我家有四口人。" },
                { text: "My sister has a cute daughter.", tr: "我姐姐有一个可爱的女儿。" },
                { text: "His wife is friendly and tall.", tr: "他的妻子既友好又高挑。" }
              ]
            },
            {
              id: "en-l10",
              title: "食物与饮料",
              minutes: 10,
              xp: 55,
              focus: "餐饮词汇与表达",
              vocab: [
                { t: "rice", r: "/raɪs/", m: "米饭", ex: "We eat rice every day." },
                { t: "noodles", r: "/ˈnuːdlz/", m: "面条", ex: "The noodles here are delicious." },
                { t: "vegetable", r: "/ˈvedʒtəbl/", m: "蔬菜", ex: "Eat more vegetables, please." },
                { t: "chicken", r: "/ˈtʃɪkɪn/", m: "鸡肉", ex: "She doesn't eat chicken." },
                { t: "juice", r: "/dʒuːs/", m: "果汁", ex: "I'd like a glass of orange juice." },
                { t: "breakfast", r: "/ˈbrekfəst/", m: "早餐", ex: "I have breakfast at seven." },
                { t: "hungry", r: "/ˈhʌŋɡri/", m: "饿的", ex: "I'm hungry. Let's eat now." },
                { t: "thirsty", r: "/ˈθɜːrsti/", m: "渴的", ex: "Are you thirsty? Have some water." },
                { t: "delicious", r: "/dɪˈlɪʃəs/", m: "美味的", ex: "This soup is really delicious." }
              ],
              grammar: [
                {
                  point: "some / any 的用法",
                  rule: "some 用于肯定句，any 用于否定句和疑问句。",
                  examples: ["There is some juice in the fridge.", "Do you have any bread?", "We don't have any rice."],
                  drills: [
                    { q: "I'd like ___ water, please.", opts: ["some", "any", "a"], a: 0, why: "肯定句中用 some，water 不可数不能用 a。" },
                    { q: "Do you have ___ eggs?", opts: ["some", "any", "much"], a: 1, why: "疑问句中用 any。" },
                    { q: "We don't have ___ milk at home.", opts: ["some", "any", "a"], a: 1, why: "否定句中用 any。" }
                  ]
                },
                {
                  point: "祈使句（肯定与否定）",
                  rule: "祈使句以动词原形开头；否定形式在前面加 Don't。",
                  examples: ["Have some tea, please.", "Don't eat too fast.", "Open the menu, please."],
                  drills: [
                    { q: "___ some more rice, please.", opts: ["Has", "Have", "Having"], a: 1, why: "祈使句用动词原形 have。" },
                    { q: "___ drink cold water. It's bad for you.", opts: ["Don't", "Not", "No"], a: 0, why: "否定祈使句在句首加 Don't。" }
                  ]
                }
              ],
              listening: [
                { text: "I'm hungry. I'd like some noodles and a glass of juice, please.", q: "说话人想要什么？", opts: ["米饭和水", "面条和果汁", "鸡肉和牛奶"], a: 1, tr: "我饿了，我想要一些面条和一杯果汁。" },
                { text: "Don't add any sugar, please. I don't like sweet coffee.", q: "说话人不喜欢什么？", opts: ["苦咖啡", "热咖啡", "加糖的咖啡"], a: 2, tr: "请不要加糖，我不喜欢甜咖啡。" },
                { text: "We usually have breakfast at seven thirty.", q: "这家人几点吃早餐？", opts: ["7:00", "7:30", "8:00"], a: 1, tr: "我们通常七点半吃早餐。" }
              ],
              speaking: [
                { text: "I'd like some rice and chicken, please.", tr: "我想要一些米饭和鸡肉。" },
                { text: "Don't add any sugar, please.", tr: "请不要加糖。" },
                { text: "The noodles here are really delicious.", tr: "这里的面条真的很好吃。" }
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
        },
        {
          id: "en-u6",
          name: "出门旅行",
          theme: "交通、住宿与观光",
          lessons: [
            {
              id: "en-l11",
              title: "交通与问路",
              minutes: 11,
              xp: 58,
              focus: "交通工具与问路表达",
              vocab: [
                { t: "subway", r: "/ˈsʌbweɪ/", m: "地铁", ex: "I take the subway to work." },
                { t: "station", r: "/ˈsteɪʃn/", m: "车站", ex: "The station is five minutes away." },
                { t: "turn left", r: "/tɜːrn left/", m: "向左转", ex: "Turn left at the corner." },
                { t: "go straight", r: "/ɡoʊ streɪt/", m: "直走", ex: "Go straight for two blocks." },
                { t: "corner", r: "/ˈkɔːrnər/", m: "拐角", ex: "The bank is on the corner." },
                { t: "traffic light", r: "/ˈtræfɪk laɪt/", m: "红绿灯", ex: "Wait at the traffic light." },
                { t: "get off", r: "/ɡet ɔːf/", m: "下车", ex: "Get off at the next stop." },
                { t: "far", r: "/fɑːr/", m: "远的", ex: "Is the airport far from here?" },
                { t: "next to", r: "/nekst tə/", m: "紧挨着", ex: "The hotel is next to the station." }
              ],
              grammar: [
                {
                  point: "there be 句型",
                  rule: "There is + 单数/不可数名词，There are + 复数名词，表示“某地有某物”。",
                  examples: ["There is a bank near here.", "There are two stations in this area.", "Is there a restroom on this floor?"],
                  drills: [
                    { q: "There ___ a subway station near my office.", opts: ["is", "are", "be"], a: 0, why: "a subway station 是单数，用 there is。" },
                    { q: "___ there any buses to the airport?", opts: ["Is", "Are", "Do"], a: 1, why: "buses 是复数，疑问句用 are there。" },
                    { q: "There ___ many taxis in front of the hotel.", opts: ["is", "are", "has"], a: 1, why: "taxis 是复数，用 there are。" }
                  ]
                },
                {
                  point: "方位介词",
                  rule: "next to 紧挨着，between 在两者之间，across from 在对面，behind 在后面。",
                  examples: ["The bank is next to the post office.", "The hotel is across from the station.", "The park is behind the museum."],
                  drills: [
                    { q: "The pharmacy is ___ the bank and the café.", opts: ["between", "across", "behind to"], a: 0, why: "between... and... 表示“在两者之间”。" },
                    { q: "The bus stop is ___ from the hotel.", opts: ["next", "across", "between"], a: 1, why: "across from 表示“在……对面”。" }
                  ]
                }
              ],
              listening: [
                { text: "Excuse me, how can I get to the Central Station?", q: "说话人想去哪里？", opts: ["中心车站", "机场", "博物馆"], a: 0, tr: "打扰一下，请问中心车站怎么走？" },
                { text: "Go straight and turn left at the traffic light. The bank is on your right.", q: "银行在哪个方向？", opts: ["左边", "右边", "对面"], a: 1, tr: "直走，在红绿灯处左转，银行就在你的右边。" },
                { text: "Take the subway and get off at Park Station. The museum is next to it.", q: "博物馆在哪里？", opts: ["公园车站旁边", "红绿灯旁边", "银行对面"], a: 0, tr: "坐地铁在公园站下车，博物馆就在车站旁边。" }
              ],
              speaking: [
                { text: "Excuse me, is there a subway station near here?", tr: "打扰一下，这附近有地铁站吗？" },
                { text: "Go straight and turn right at the corner.", tr: "直走，在拐角处右转。" },
                { text: "You can get off at the next stop.", tr: "你可以在下一站下车。" }
              ]
            },
            {
              id: "en-l12",
              title: "酒店与住宿",
              minutes: 12,
              xp: 60,
              focus: "预订与办理入住",
              vocab: [
                { t: "book a room", r: "/bʊk ə ruːm/", m: "预订房间", ex: "I booked a room online yesterday." },
                { t: "single room", r: "/ˈsɪŋɡl ruːm/", m: "单人房", ex: "A single room is enough for me." },
                { t: "double room", r: "/ˈdʌbl ruːm/", m: "双人房", ex: "We'd like a double room, please." },
                { t: "check in", r: "/tʃek ɪn/", m: "办理入住", ex: "You can check in after 2 p.m." },
                { t: "check out", r: "/tʃek aʊt/", m: "办理退房", ex: "We must check out before noon." },
                { t: "reservation", r: "/ˌrezərˈveɪʃn/", m: "预订", ex: "I have a reservation for two nights." },
                { t: "available", r: "/əˈveɪləbl/", m: "可用的、有空房的", ex: "Is a double room available tonight?" },
                { t: "floor", r: "/flɔːr/", m: "楼层", ex: "Your room is on the fifth floor." },
                { t: "include", r: "/ɪnˈkluːd/", m: "包含", ex: "The price includes breakfast." }
              ],
              grammar: [
                {
                  point: "现在进行时表将来安排",
                  rule: "已经确定的近期安排可以用现在进行时表达，常搭配 tonight / tomorrow 等时间词。",
                  examples: ["I'm staying at the Grand Hotel tonight.", "We're checking out tomorrow morning.", "She is flying to Paris on Friday."],
                  drills: [
                    { q: "We ___ at a small hotel near the beach this weekend.", opts: ["stay", "are staying", "stayed"], a: 1, why: "已确定的将来安排用现在进行时。" },
                    { q: "They ___ out at noon tomorrow.", opts: ["are checking", "check", "checked"], a: 0, why: "tomorrow 提示将来的安排，用 are checking。" }
                  ]
                },
                {
                  point: "形容词比较级",
                  rule: "比较级用 形容词 + -er 或 more + 形容词，后接 than。",
                  examples: ["This room is bigger than that one.", "A double room is more expensive than a single room.", "The beds here are softer."],
                  drills: [
                    { q: "This hotel is ___ than the one near the station.", opts: ["cheap", "cheaper", "cheapest"], a: 1, why: "两者之间比较用比较级 cheaper。" },
                    { q: "A suite is ___ than a single room.", opts: ["more expensive", "expensiver", "most expensive"], a: 0, why: "多音节形容词用 more 构成比较级。" }
                  ]
                }
              ],
              listening: [
                { text: "Good evening. I have a reservation for a double room for three nights.", q: "客人预订了什么？", opts: ["单人房住两晚", "双人房住三晚", "套房住一晚"], a: 1, tr: "晚上好，我预订了一间双人房，住三个晚上。" },
                { text: "Your room is on the fifth floor, and the price includes breakfast.", q: "房价包含什么？", opts: ["晚餐", "机场接送", "早餐"], a: 2, tr: "您的房间在五楼，房价包含早餐。" },
                { text: "I'm afraid you must check out before twelve o'clock.", q: "退房时间是什么时候？", opts: ["中午十二点前", "下午两点前", "上午十点前"], a: 0, tr: "恐怕您必须在十二点前退房。" }
              ],
              speaking: [
                { text: "I have a reservation for two nights.", tr: "我预订了两个晚上。" },
                { text: "Is breakfast included in the price?", tr: "房价包含早餐吗？" },
                { text: "We're checking out tomorrow morning.", tr: "我们明天早上退房。" }
              ]
            }
          ]
        },
        {
          id: "en-u7",
          name: "购物达人",
          theme: "服饰、价格与砍价",
          lessons: [
            {
              id: "en-l13",
              title: "服饰与试穿",
              minutes: 12,
              xp: 62,
              focus: "服装词汇与试穿表达",
              vocab: [
                { t: "shirt", r: "/ʃɜːrt/", m: "衬衫", ex: "This shirt is made of cotton." },
                { t: "jacket", r: "/ˈdʒækɪt/", m: "夹克", ex: "He bought a black jacket." },
                { t: "dress", r: "/dres/", m: "连衣裙", ex: "She looks great in that red dress." },
                { t: "shoes", r: "/ʃuːz/", m: "鞋子", ex: "These shoes are very comfortable." },
                { t: "try on", r: "/traɪ ɑːn/", m: "试穿", ex: "Can I try on this jacket?" },
                { t: "fit", r: "/fɪt/", m: "合身", ex: "The dress fits you perfectly." },
                { t: "tight", r: "/taɪt/", m: "紧的", ex: "These jeans are too tight." },
                { t: "loose", r: "/luːs/", m: "宽松的", ex: "I prefer loose shirts in summer." },
                { t: "fitting room", r: "/ˈfɪtɪŋ ruːm/", m: "试衣间", ex: "The fitting room is over there." }
              ],
              grammar: [
                {
                  point: "形容词最高级",
                  rule: "三者及以上比较用最高级：the + 形容词 + -est 或 the most + 形容词。",
                  examples: ["This is the cheapest jacket in the store.", "It's the most beautiful dress I've ever seen.", "Which one is the best?"],
                  drills: [
                    { q: "This is ___ dress in the shop.", opts: ["the most expensive", "more expensive", "expensive"], a: 0, why: "整个店铺范围内比较，用最高级 the most expensive。" },
                    { q: "These are ___ shoes I've ever tried.", opts: ["comfortable", "more comfortable", "the most comfortable"], a: 2, why: "最高级前加 the，多音节词用 the most。" }
                  ]
                },
                {
                  point: "too 与 enough",
                  rule: "too + 形容词 表示“太……”；形容词 + enough 表示“足够……”。",
                  examples: ["This shirt is too tight.", "The jacket is warm enough.", "These shoes are too big for me."],
                  drills: [
                    { q: "The sleeves are ___ long. I can't wear it.", opts: ["too", "enough", "very"], a: 0, why: "表示“太……（不合适）”用 too。" },
                    { q: "Is this coat warm ___ for the winter?", opts: ["too", "enough", "so"], a: 1, why: "enough 放在形容词后，表示“足够”。" }
                  ]
                }
              ],
              listening: [
                { text: "Excuse me, can I try on this jacket? Where is the fitting room?", q: "顾客想做什么？", opts: ["退掉夹克", "试穿夹克", "修改夹克"], a: 1, tr: "打扰一下，我可以试穿这件夹克吗？试衣间在哪里？" },
                { text: "These jeans are too tight. Do you have a larger size?", q: "这条牛仔裤怎么了？", opts: ["太紧", "太长", "太贵"], a: 0, tr: "这条牛仔裤太紧了，有大一号的吗？" },
                { text: "The red dress is the most beautiful one in the store, and it fits you perfectly.", q: "店员觉得这条裙子怎么样？", opts: ["颜色不合适", "非常合身好看", "价格太高"], a: 1, tr: "这条红裙子是店里最漂亮的，你穿着非常合身。" }
              ],
              speaking: [
                { text: "Can I try on this dress, please?", tr: "我可以试穿这条连衣裙吗？" },
                { text: "These shoes are too tight. Do you have a larger size?", tr: "这双鞋太紧了，有大一号的吗？" },
                { text: "The jacket fits me perfectly.", tr: "这件夹克我穿很合身。" }
              ]
            },
            {
              id: "en-l14",
              title: "价格与付款",
              minutes: 12,
              xp: 65,
              focus: "询价、折扣与支付方式",
              vocab: [
                { t: "price", r: "/praɪs/", m: "价格", ex: "The price is on the tag." },
                { t: "expensive", r: "/ɪkˈspensɪv/", m: "昂贵的", ex: "This watch is too expensive for me." },
                { t: "cheap", r: "/tʃiːp/", m: "便宜的", ex: "The T-shirts are cheap but good." },
                { t: "pay", r: "/peɪ/", m: "付款", ex: "You can pay by card or cash." },
                { t: "cash", r: "/kæʃ/", m: "现金", ex: "Sorry, we don't accept cash here." },
                { t: "credit card", r: "/ˈkredɪt kɑːrd/", m: "信用卡", ex: "Can I pay by credit card?" },
                { t: "change", r: "/tʃeɪndʒ/", m: "零钱、找零", ex: "Here's your change, twenty dollars." },
                { t: "on sale", r: "/ɑːn seɪl/", m: "特价出售", ex: "These bags are on sale this week." },
                { t: "total", r: "/ˈtoʊtl/", m: "总额", ex: "The total is eighty-five dollars." }
              ],
              grammar: [
                {
                  point: "one / ones 替代名词",
                  rule: "用 one 替代前面提到的单数可数名词，ones 替代复数，避免重复。",
                  examples: ["I like the blue one.", "Which ones do you prefer?", "The red one is cheaper than the black one."],
                  drills: [
                    { q: "Which shirt do you want? — The blue ___, please.", opts: ["one", "ones", "it"], a: 0, why: "替代单数名词 shirt 用 one。" },
                    { q: "I don't like these shoes. I prefer those ___.", opts: ["one", "ones", "that"], a: 1, why: "替代复数名词 shoes 用 ones。" },
                    { q: "The green bag is nice, but the brown ___ is cheaper.", opts: ["one", "ones", "they"], a: 0, why: "单数名词 bag 用 one 替代。" }
                  ]
                },
                {
                  point: "名词性物主代词",
                  rule: "mine / yours / his / hers / ours / theirs 单独使用，后面不接名词。",
                  examples: ["This wallet is mine.", "Is this umbrella yours?", "My card is here; hers is on the table."],
                  drills: [
                    { q: "This receipt isn't mine. Maybe it's ___.", opts: ["your", "yours", "you"], a: 1, why: "后面没有名词，用名词性物主代词 yours。" },
                    { q: "My bag is black. ___ is the brown one over there.", opts: ["Her", "Hers", "She"], a: 1, why: "空格作主语且后无名词，用 hers。" }
                  ]
                }
              ],
              listening: [
                { text: "These bags are on sale this week. The total is eighty-five dollars.", q: "说话人在说什么？", opts: ["包包本周特价", "包包已经售罄", "包包需要预订"], a: 0, tr: "这些包本周特价，总共八十五美元。" },
                { text: "Can I pay by credit card? — Sorry, we only accept cash.", q: "这家店接受什么支付方式？", opts: ["信用卡", "手机支付", "现金"], a: 2, tr: "可以用信用卡付款吗？——抱歉，我们只收现金。" },
                { text: "Here's your change, twenty dollars. Thank you for shopping with us.", q: "找零是多少？", opts: ["十美元", "十五美元", "二十美元"], a: 2, tr: "这是找您的二十美元，感谢您在我们店购物。" }
              ],
              speaking: [
                { text: "How much is the red one?", tr: "红色的那个多少钱？" },
                { text: "Can I pay by credit card?", tr: "可以用信用卡付款吗？" },
                { text: "That's too expensive. Is it on sale?", tr: "太贵了，有特价吗？" }
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
        },
        {
          id: "en-u8",
          name: "职场英语",
          theme: "会议、邮件与协作",
          lessons: [
            {
              id: "en-l15",
              title: "会议与讨论",
              minutes: 12,
              xp: 70,
              focus: "会议发言与讨论表达",
              vocab: [
                { t: "meeting", r: "/ˈmiːtɪŋ/", m: "会议", ex: "The meeting starts at ten." },
                { t: "agenda", r: "/əˈdʒendə/", m: "议程", ex: "Let's look at today's agenda." },
                { t: "deadline", r: "/ˈdedlaɪn/", m: "截止日期", ex: "We can't miss the deadline." },
                { t: "interrupt", r: "/ˌɪntəˈrʌpt/", m: "打断", ex: "Sorry to interrupt, but may I add something?" },
                { t: "clarify", r: "/ˈklærɪfaɪ/", m: "澄清", ex: "Could you clarify the last point?" },
                { t: "decision", r: "/dɪˈsɪʒn/", m: "决定", ex: "We made a decision at the meeting." },
                { t: "postpone", r: "/poʊˈspoʊn/", m: "推迟", ex: "Let's postpone the launch until May." },
                { t: "summary", r: "/ˈsʌməri/", m: "总结", ex: "Let me give a quick summary." },
                { t: "come up with", r: "/kʌm ʌp wɪð/", m: "想出、提出", ex: "She came up with a great idea." }
              ],
              grammar: [
                {
                  point: "现在完成时（经历与持续）",
                  rule: "have/has + 过去分词，表示已完成或持续到现在的动作，常搭配 already / yet / for / since。",
                  examples: ["We have already discussed the budget.", "Has the meeting started yet?", "I have worked here for five years."],
                  drills: [
                    { q: "Sorry, the meeting has ___ started.", opts: ["already", "yet", "ever"], a: 0, why: "肯定句中表示“已经”用 already；yet 用于疑问和否定句。" },
                    { q: "We haven't made a decision ___.", opts: ["already", "yet", "since"], a: 1, why: "否定句句尾用 yet 表示“还（没）”。" },
                    { q: "She has worked on this project ___ 2020.", opts: ["for", "since", "ago"], a: 1, why: "since + 时间点，for + 时间段。" }
                  ]
                },
                {
                  point: "会议中的打断与澄清",
                  rule: "Sorry to interrupt, but... 礼貌打断；Could you clarify...? 请求澄清。",
                  examples: ["Sorry to interrupt, but I have a question.", "Could you clarify what you mean by 'soon'?", "May I add something here?"],
                  drills: [
                    { q: "会议中想礼貌打断别人，最合适的是？", opts: ["Stop talking now.", "Sorry to interrupt, but may I add something?", "I don't agree with you at all."], a: 1, why: "Sorry to interrupt, but... 是会议中礼貌打断的固定表达。" },
                    { q: "没听懂对方的意思，想请他澄清，应该说？", opts: ["Could you clarify that point?", "You are wrong.", "Speak louder, please."], a: 0, why: "Could you clarify... 用于请对方解释清楚。" }
                  ]
                }
              ],
              listening: [
                { text: "Let's start with the first item on the agenda — the new deadline.", q: "会议首先讨论什么？", opts: ["新的截止日期", "预算问题", "人员安排"], a: 0, tr: "我们先从议程上的第一项开始——新的截止日期。" },
                { text: "Sorry to interrupt, but could you clarify the last point?", q: "说话人想做什么？", opts: ["结束会议", "澄清上一点", "提出新议题"], a: 1, tr: "抱歉打断一下，您能澄清一下最后一点吗？" },
                { text: "We've already made a decision: the launch will be postponed until May.", q: "会议的决定是什么？", opts: ["提前发布", "如期发布", "推迟到五月发布"], a: 2, tr: "我们已经做出决定：发布会将推迟到五月。" }
              ],
              speaking: [
                { text: "Let's start with the first item on the agenda.", tr: "我们从议程的第一项开始吧。" },
                { text: "Sorry to interrupt, but could you clarify that?", tr: "抱歉打断一下，您能澄清一下那一点吗？" },
                { text: "We haven't made a final decision yet.", tr: "我们还没有做出最终决定。" }
              ]
            },
            {
              id: "en-l16",
              title: "邮件与电话",
              minutes: 13,
              xp: 72,
              focus: "邮件措辞与电话沟通",
              vocab: [
                { t: "attachment", r: "/əˈtætʃmənt/", m: "附件", ex: "Please find the report in the attachment." },
                { t: "subject line", r: "/ˈsʌbdʒekt laɪn/", m: "主题行", ex: "Write a clear subject line." },
                { t: "reply", r: "/rɪˈplaɪ/", m: "回复", ex: "I'll reply to your email this afternoon." },
                { t: "forward", r: "/ˈfɔːrwərd/", m: "转发", ex: "Could you forward the file to me?" },
                { t: "follow up", r: "/ˈfɑːloʊ ʌp/", m: "跟进", ex: "I'm following up on our meeting last week." },
                { t: "as soon as possible", r: "/æz suːn æz ˈpɑːsəbl/", m: "尽快", ex: "Please reply as soon as possible." },
                { t: "leave a message", r: "/liːv ə ˈmesɪdʒ/", m: "留言", ex: "He's not here. Can I leave a message?" },
                { t: "hold on", r: "/hoʊld ɑːn/", m: "稍等（电话用语）", ex: "Hold on a moment, please." },
                { t: "get back to", r: "/ɡet bæk tə/", m: "回复（某人）", ex: "I'll get back to you by Friday." }
              ],
              grammar: [
                {
                  point: "委婉请求：Would you mind / I was wondering if",
                  rule: "Would you mind + 动名词 与 I was wondering if + 句子 都是邮件中非常礼貌的请求方式。",
                  examples: ["Would you mind sending me the file?", "I was wondering if you could reply by Friday.", "Would you mind if we moved the meeting?"],
                  drills: [
                    { q: "Would you mind ___ the report before noon?", opts: ["send", "to send", "sending"], a: 2, why: "Would you mind 后接动名词 sending。" },
                    { q: "邮件中最礼貌的请求方式是？", opts: ["Send me the file now.", "I was wondering if you could send me the file.", "You must send the file."], a: 1, why: "I was wondering if you could... 语气最委婉。" }
                  ]
                },
                {
                  point: "宾语从句的语序",
                  rule: "宾语从句用陈述语序：Could you tell me where the meeting is（不能说 where is the meeting）。",
                  examples: ["Could you tell me when the meeting starts?", "I don't know where he is now.", "Do you know who called this morning?"],
                  drills: [
                    { q: "Could you tell me ___?", opts: ["where is the office", "where the office is", "the office is where"], a: 1, why: "宾语从句用陈述语序 where the office is。" },
                    { q: "Do you know ___?", opts: ["when will she reply", "when she will reply", "when she reply"], a: 1, why: "从句保持“主语 + 谓语”的陈述语序。" }
                  ]
                }
              ],
              listening: [
                { text: "I'm following up on the email I sent last week. Could you reply as soon as possible?", q: "说话人为什么写这封邮件？", opts: ["询问产品价格", "跟进上周的邮件", "投诉服务质量"], a: 1, tr: "我想跟进一下上周发出的邮件，您能尽快回复吗？" },
                { text: "Mr. Brown is not in the office right now. Would you like to leave a message?", q: "接电话的人在提供什么？", opts: ["转接给 Brown 先生", "让来电者留言", "预约下次见面"], a: 1, tr: "Brown 先生现在不在办公室，您要留言吗？" },
                { text: "Hold on a moment, please. I'll check the file and get back to you.", q: "说话人接下来会做什么？", opts: ["立刻挂断电话", "查看文件后回复", "转发邮件给同事"], a: 1, tr: "请稍等，我查看一下文件再回复您。" }
              ],
              speaking: [
                { text: "I'm following up on the email I sent last week.", tr: "我想跟进一下上周发的邮件。" },
                { text: "Hold on a moment, please. I'll get back to you soon.", tr: "请稍等，我很快回复您。" },
                { text: "Would you mind forwarding the attachment to me?", tr: "您介意把附件转发给我吗？" }
              ]
            }
          ]
        },
        {
          id: "en-u9",
          name: "健康与生活",
          theme: "就医、运动与习惯",
          lessons: [
            {
              id: "en-l17",
              title: "看医生",
              minutes: 13,
              xp: 75,
              focus: "描述症状与就医对话",
              vocab: [
                { t: "symptom", r: "/ˈsɪmptəm/", m: "症状", ex: "What are your symptoms?" },
                { t: "fever", r: "/ˈfiːvər/", m: "发烧", ex: "He has a high fever." },
                { t: "headache", r: "/ˈhedeɪk/", m: "头痛", ex: "I've had a headache all day." },
                { t: "sore throat", r: "/sɔːr θroʊt/", m: "喉咙痛", ex: "I have a sore throat and a cough." },
                { t: "medicine", r: "/ˈmedɪsn/", m: "药", ex: "Take this medicine twice a day." },
                { t: "prescription", r: "/prɪˈskrɪpʃn/", m: "处方", ex: "The doctor gave me a prescription." },
                { t: "check-up", r: "/ˈtʃek ʌp/", m: "体检", ex: "I have a check-up every year." },
                { t: "twice a day", r: "/twaɪs ə deɪ/", m: "一天两次", ex: "Take one pill twice a day." },
                { t: "recover", r: "/rɪˈkʌvər/", m: "康复", ex: "I hope you recover soon." }
              ],
              grammar: [
                {
                  point: "should / had better 表建议",
                  rule: "should + 动词原形 表示建议；had better + 动词原形 语气更强，意为“最好”。",
                  examples: ["You should drink more water.", "You'd better see a doctor.", "You shouldn't stay up late."],
                  drills: [
                    { q: "You look tired. You ___ take a rest.", opts: ["should", "would", "could have"], a: 0, why: "表示建议用 should。" },
                    { q: "It's getting worse. You'd better ___ a doctor.", opts: ["seeing", "see", "to see"], a: 1, why: "had better 后接动词原形。" },
                    { q: "You ___ smoke. It's bad for your health.", opts: ["shouldn't", "mustn't to", "don't should"], a: 0, why: "否定建议在 should 后加 not。" }
                  ]
                },
                {
                  point: "现在完成进行时",
                  rule: "have/has been + 动词-ing，表示从过去持续到现在的动作，常与 for / since 连用，就医时常用来描述症状持续的时间。",
                  examples: ["I have been coughing for three days.", "How long have you been feeling this way?", "She has been taking medicine since Monday."],
                  drills: [
                    { q: "How long have you ___ a headache?", opts: ["have", "been having", "had been"], a: 1, why: "询问症状持续时间用现在完成进行时。" },
                    { q: "I ___ well since last night.", opts: ["haven't been sleeping", "don't sleep", "am not sleep"], a: 0, why: "since last night 提示从过去持续到现在，用现在完成进行时的否定式。" }
                  ]
                }
              ],
              listening: [
                { text: "I've been having a sore throat and a fever for three days.", q: "病人的症状持续多久了？", opts: ["一天", "三天", "一周"], a: 1, tr: "我喉咙痛还发烧，已经三天了。" },
                { text: "Take this medicine twice a day, and you'd better stay in bed.", q: "医生给出了什么建议？", opts: ["多运动", "卧床休息", "立刻住院"], a: 1, tr: "这药一天吃两次，你最好卧床休息。" },
                { text: "Don't worry. With some rest, you'll recover in a few days.", q: "医生认为病人会怎样？", opts: ["几天后康复", "需要手术", "病情严重"], a: 0, tr: "别担心，休息几天你就会康复。" }
              ],
              speaking: [
                { text: "I've been having a headache since yesterday.", tr: "我从昨天开始一直头痛。" },
                { text: "Take this medicine twice a day after meals.", tr: "这药饭后吃，一天两次。" },
                { text: "You'd better see a doctor as soon as possible.", tr: "你最好尽快去看医生。" }
              ]
            },
            {
              id: "en-l18",
              title: "运动与习惯",
              minutes: 13,
              xp: 75,
              focus: "谈论习惯与生活方式",
              vocab: [
                { t: "habit", r: "/ˈhæbɪt/", m: "习惯", ex: "Running is a good habit." },
                { t: "exercise", r: "/ˈeksərsaɪz/", m: "锻炼", ex: "I exercise three times a week." },
                { t: "regularly", r: "/ˈreɡjələrli/", m: "规律地", ex: "She swims regularly." },
                { t: "used to", r: "/juːst tə/", m: "过去常常", ex: "I used to smoke, but I quit." },
                { t: "give up", r: "/ɡɪv ʌp/", m: "戒掉、放弃", ex: "He gave up coffee last year." },
                { t: "stay up late", r: "/steɪ ʌp leɪt/", m: "熬夜", ex: "Don't stay up late too often." },
                { t: "jogging", r: "/ˈdʒɑːɡɪŋ/", m: "慢跑", ex: "I go jogging every morning." },
                { t: "healthy", r: "/ˈhelθi/", m: "健康的", ex: "A healthy diet is important." },
                { t: "keep fit", r: "/kiːp fɪt/", m: "保持健康、健身", ex: "She cycles to work to keep fit." }
              ],
              grammar: [
                {
                  point: "used to + 动词原形",
                  rule: "used to + 动词原形 表示过去经常做、现在已经不做的事；疑问与否定用 did ... use to。",
                  examples: ["I used to play basketball every weekend.", "Did you use to stay up late?", "He didn't use to like running."],
                  drills: [
                    { q: "I ___ smoke, but I gave it up two years ago.", opts: ["use to", "used to", "am used to"], a: 1, why: "表示过去常常且已停止，用 used to。" },
                    { q: "___ you use to exercise regularly?", opts: ["Do", "Did", "Have"], a: 1, why: "used to 的疑问句借助 did，动词还原为 use。" },
                    { q: "She didn't use ___ coffee, but now she drinks it every day.", opts: ["drink", "to drink", "drinking"], a: 1, why: "否定结构为 didn't use to + 动词原形。" }
                  ]
                },
                {
                  point: "动名词作宾语",
                  rule: "enjoy / keep / give up / suggest / avoid 等动词后接动名词 doing。",
                  examples: ["I enjoy jogging in the morning.", "He gave up smoking last year.", "Try to avoid staying up late."],
                  drills: [
                    { q: "I enjoy ___ yoga after work.", opts: ["do", "to do", "doing"], a: 2, why: "enjoy 后接动名词 doing。" },
                    { q: "He finally gave up ___ late-night snacks.", opts: ["eat", "eating", "to eat"], a: 1, why: "give up 后接动名词。" },
                    { q: "Keep ___, and you'll get healthier.", opts: ["try", "trying", "to try"], a: 1, why: "keep + doing 表示“持续做某事”。" }
                  ]
                }
              ],
              listening: [
                { text: "I used to stay up late, but now I go to bed before eleven.", q: "说话人现在几点前睡觉？", opts: ["十点", "十一点", "十二点"], a: 1, tr: "我过去常常熬夜，但现在我十一点前就睡了。" },
                { text: "I go jogging every morning to keep fit, and I really enjoy it.", q: "说话人早上做什么？", opts: ["游泳", "慢跑", "骑车"], a: 1, tr: "我每天早上去慢跑来保持健康，而且我很喜欢。" },
                { text: "He gave up smoking last year and started exercising regularly.", q: "他去年做了什么改变？", opts: ["戒烟并开始锻炼", "搬去乡下", "换了工作"], a: 0, tr: "他去年戒了烟，并开始规律锻炼。" }
              ],
              speaking: [
                { text: "I used to stay up late, but not anymore.", tr: "我过去常熬夜，但现在不了。" },
                { text: "I enjoy jogging in the park every morning.", tr: "我喜欢每天早上在公园慢跑。" },
                { text: "He gave up smoking and started keeping fit.", tr: "他戒了烟，开始健身了。" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "en-b2",
      name: "B2 挑战",
      badge: "B2",
      goal: "能就抽象话题深入讨论，理解复杂文本与媒体内容。",
      units: [
        {
          id: "en-u10",
          name: "科技与观点",
          theme: "网络、科技与媒体素养",
          lessons: [
            {
              id: "en-l19",
              title: "科技与网络",
              minutes: 13,
              xp: 78,
              focus: "科技影响与网络生活",
              vocab: [
                { t: "innovation", r: "/ˌɪnəˈveɪʃn/", m: "创新", ex: "Innovation drives the tech industry." },
                { t: "artificial intelligence", r: "/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/", m: "人工智能", ex: "Artificial intelligence is changing how we work." },
                { t: "privacy", r: "/ˈpraɪvəsi/", m: "隐私", ex: "We should protect our privacy online." },
                { t: "digital", r: "/ˈdɪdʒɪtl/", m: "数字的", ex: "Digital skills are essential today." },
                { t: "rely on", r: "/rɪˈlaɪ ɑːn/", m: "依赖", ex: "Many people rely on smartphones for everything." },
                { t: "device", r: "/dɪˈvaɪs/", m: "设备", ex: "This device can translate forty languages." },
                { t: "efficient", r: "/ɪˈfɪʃnt/", m: "高效的", ex: "Online meetings are more efficient for small teams." },
                { t: "security", r: "/sɪˈkjʊrəti/", m: "安全", ex: "Online security should not be ignored." },
                { t: "transform", r: "/trænsˈfɔːrm/", m: "改变、变革", ex: "The internet has transformed the way we learn." },
                { t: "be addicted to", r: "/bi əˈdɪktɪd tə/", m: "沉迷于", ex: "Some teenagers are addicted to social media." }
              ],
              grammar: [
                {
                  point: "被动语态（一般现在与一般过去）",
                  rule: "be + 过去分词，强调动作的承受者；动作发出者可用 by 引出。",
                  examples: ["Smartphones are used by billions of people.", "The first computer was built in the 1940s.", "English is spoken all over the world."],
                  drills: [
                    { q: "Millions of emails ___ every day.", opts: ["send", "are sent", "are sending"], a: 1, why: "主语 emails 是动作的承受者，用被动语态 are sent。" },
                    { q: "The first iPhone ___ in 2007.", opts: ["released", "was released", "is released"], a: 1, why: "in 2007 是过去时间，用一般过去时的被动 was released。" },
                    { q: "Personal data ___ by many apps without permission.", opts: ["collects", "is collected", "collecting"], a: 1, why: "data 被收集，用被动语态。" }
                  ]
                },
                {
                  point: "限制性定语从句（who / which / that）",
                  rule: "先行词是人用 who/that，是物用 which/that，关系词在从句中作主语或宾语。",
                  examples: ["People who work in tech often change jobs.", "The app which I use every day is free.", "This is a device that can save a lot of time."],
                  drills: [
                    { q: "The engineer ___ designed this app won a prize.", opts: ["who", "which", "whose"], a: 0, why: "先行词 engineer 是人，用 who。" },
                    { q: "I like apps ___ are simple and efficient.", opts: ["who", "which", "where"], a: 1, why: "先行词 apps 是物，用 which/that。" },
                    { q: "This is the website ___ helped me learn English.", opts: ["who", "that", "where"], a: 1, why: "先行词 website 是物，用 that。" }
                  ]
                }
              ],
              listening: [
                { text: "Artificial intelligence is transforming the way we work, but many people are worried about privacy.", q: "人们担心的是什么？", opts: ["网速太慢", "隐私问题", "设备太贵"], a: 1, tr: "人工智能正在改变我们的工作方式，但很多人担心隐私问题。" },
                { text: "This device, which was released last month, is said to be more efficient than the old model.", q: "新设备的特点是什么？", opts: ["更便宜", "更高效", "更小巧"], a: 1, tr: "这款上个月发布的设备据说比旧型号更高效。" },
                { text: "A survey shows that many teenagers are addicted to social media and spend hours online every day.", q: "调查显示了什么？", opts: ["青少年沉迷社交媒体", "老年人不用手机", "网络课程很受欢迎"], a: 0, tr: "一项调查显示，很多青少年沉迷社交媒体，每天花好几个小时上网。" }
              ],
              speaking: [
                { text: "Technology has transformed the way we communicate.", tr: "科技改变了我们交流的方式。" },
                { text: "We should protect our privacy when we go online.", tr: "上网时我们应该保护自己的隐私。" },
                { text: "The app that I use every day is very efficient.", tr: "我每天用的这个应用非常高效。" }
              ]
            },
            {
              id: "en-l20",
              title: "媒体与观点",
              minutes: 14,
              xp: 80,
              focus: "媒体素养与观点表达",
              vocab: [
                { t: "media", r: "/ˈmiːdiə/", m: "媒体", ex: "Social media spreads news very fast." },
                { t: "reliable", r: "/rɪˈlaɪəbl/", m: "可靠的", ex: "Is this website a reliable source?" },
                { t: "biased", r: "/ˈbaɪəst/", m: "有偏见的", ex: "The report is biased against young people." },
                { t: "headline", r: "/ˈhedlaɪn/", m: "标题", ex: "Don't believe everything you read in the headlines." },
                { t: "source", r: "/sɔːrs/", m: "来源", ex: "Always check the source of the news." },
                { t: "fake news", r: "/feɪk nuːz/", m: "假新闻", ex: "Fake news can spread quickly online." },
                { t: "criticize", r: "/ˈkrɪtɪsaɪz/", m: "批评", ex: "The article criticizes the new policy." },
                { t: "convince", r: "/kənˈvɪns/", m: "说服", ex: "The evidence convinced me to change my mind." },
                { t: "despite", r: "/dɪˈspaɪt/", m: "尽管", ex: "Despite the risks, many people share personal data." },
                { t: "perspective", r: "/pərˈspektɪv/", m: "视角、观点", ex: "Try to see the problem from another perspective." }
              ],
              grammar: [
                {
                  point: "非限制性定语从句（, which / whose）",
                  rule: "用逗号隔开，对先行词作补充说明，不能用 that；whose 表示“……的”。",
                  examples: ["This newspaper, which was founded in 1851, is still popular.", "The journalist, whose report won a prize, is only 25.", "The internet, which connects billions of people, has changed our lives."],
                  drills: [
                    { q: "The article, ___ was published yesterday, has been widely shared.", opts: ["that", "which", "who"], a: 1, why: "非限制性定语从句用 which，不能用 that。" },
                    { q: "The reporter, ___ story became famous, works for a small website.", opts: ["who", "which", "whose"], a: 2, why: "表示“这位记者的（报道）”用 whose。" }
                  ]
                },
                {
                  point: "despite / in spite of 的用法",
                  rule: "despite / in spite of + 名词或动名词，表示让步；后面不能接完整句子。",
                  examples: ["Despite the criticism, the policy remained popular.", "In spite of being busy, she reads the news every morning.", "Despite the evidence, some people still believed the story."],
                  drills: [
                    { q: "___ the evidence, he refused to change his mind.", opts: ["Despite", "Although", "Because"], a: 0, why: "名词 the evidence 前用 despite；although 后需接句子。" },
                    { q: "In spite of ___ the truth, the website kept the story online.", opts: ["know", "knowing", "to know"], a: 1, why: "in spite of 后接动名词 knowing。" }
                  ]
                }
              ],
              listening: [
                { text: "The headline was shocking, but when I checked the source, I found it was fake news.", q: "说话人发现了什么？", opts: ["新闻是真的", "新闻是假消息", "网站被关闭了"], a: 1, tr: "标题很耸动，但当我核实来源时，发现那是假新闻。" },
                { text: "Despite the criticism, the reporter refused to change the article, which many readers found biased.", q: "读者觉得这篇文章怎么样？", opts: ["客观公正", "有偏见", "很有趣"], a: 1, tr: "尽管受到批评，这位记者仍拒绝修改那篇很多读者认为有偏见的文章。" },
                { text: "A good journalist, whose job is to report the truth, should always stay objective.", q: "好的记者应该怎么做？", opts: ["保持客观", "追求点击量", "引用热门观点"], a: 0, tr: "好的记者的职责是报道真相，应该始终保持客观。" }
              ],
              speaking: [
                { text: "Always check the source before you share the news.", tr: "分享新闻之前一定要核实来源。" },
                { text: "Despite the criticism, the website kept the article online.", tr: "尽管受到批评，这家网站还是把文章保留在网上。" },
                { text: "Try to see the issue from another perspective.", tr: "试着从另一个视角看待这个问题。" }
              ]
            }
          ]
        },
        {
          id: "en-u11",
          name: "文化与社会",
          theme: "节日、习俗与社会话题",
          lessons: [
            {
              id: "en-l21",
              title: "节日与庆祝",
              minutes: 13,
              xp: 78,
              focus: "节日习俗与庆祝活动",
              vocab: [
                { t: "celebrate", r: "/ˈselɪbreɪt/", m: "庆祝", ex: "We celebrate the New Year with our family." },
                { t: "tradition", r: "/trəˈdɪʃn/", m: "传统", ex: "It's a tradition to eat dumplings during the festival." },
                { t: "custom", r: "/ˈkʌstəm/", m: "习俗", ex: "Every country has its own wedding customs." },
                { t: "fireworks", r: "/ˈfaɪərwɜːrks/", m: "烟花", ex: "The fireworks started at midnight." },
                { t: "decorate", r: "/ˈdekəreɪt/", m: "装饰", ex: "We decorate the house with lights." },
                { t: "gather", r: "/ˈɡæðər/", m: "聚集", ex: "The whole family gathers for dinner." },
                { t: "ceremony", r: "/ˈserəmoʊni/", m: "仪式", ex: "The opening ceremony was impressive." },
                { t: "anniversary", r: "/ˌænɪˈvɜːrsəri/", m: "周年纪念", ex: "They celebrated their tenth wedding anniversary." },
                { t: "take place", r: "/teɪk pleɪs/", m: "举行、发生", ex: "The festival takes place every spring." }
              ],
              grammar: [
                {
                  point: "过去进行时与 when / while",
                  rule: "过去进行时描述正在进行的背景动作，when / while 引出另一动作：While we were watching..., the phone rang.",
                  examples: ["While we were watching the fireworks, it started to rain.", "I was cooking dinner when the guests arrived.", "They were dancing when the music suddenly stopped."],
                  drills: [
                    { q: "While we ___ dinner, the fireworks began.", opts: ["have", "were having", "are having"], a: 1, why: "背景动作用过去进行时 were having。" },
                    { q: "I was taking photos when my phone ___.", opts: ["died", "was dying", "dies"], a: 0, why: "短暂动作用一般过去时 died。" },
                    { q: "They ___ down the street when the parade started.", opts: ["walked", "were walking", "walk"], a: 1, why: "表示当时正在走，用过去进行时。" }
                  ]
                },
                {
                  point: "第一条件句",
                  rule: "If + 一般现在时，主句用 will + 动词原形，谈论真实可能发生的将来。",
                  examples: ["If it rains, the ceremony will move indoors.", "If you come early, you'll get a good seat.", "We will miss the parade if we leave too late."],
                  drills: [
                    { q: "If it ___ tomorrow, the festival will be cancelled.", opts: ["rains", "will rain", "rained"], a: 0, why: "条件状语从句中用一般现在时表示将来。" },
                    { q: "If we leave now, we ___ the opening ceremony.", opts: ["catch", "will catch", "would catch"], a: 1, why: "真实条件句主句用 will + 动词原形。" }
                  ]
                }
              ],
              listening: [
                { text: "While we were watching the fireworks, it suddenly started to rain, so we ran back to the car.", q: "烟花放到一半发生了什么？", opts: ["停电了", "下雨了", "烟花取消了"], a: 1, tr: "我们正在看烟花，突然下起了雨，于是我们跑回了车里。" },
                { text: "If the weather is good, the ceremony will take place in the park, and the whole family will gather there.", q: "天气好的话，仪式在哪里举行？", opts: ["公园里", "家里", "广场上"], a: 0, tr: "如果天气好，仪式将在公园举行，全家人都会聚在那里。" },
                { text: "It is a local custom to decorate the streets with lights before the festival takes place.", q: "当地的习俗是什么？", opts: ["节前用灯饰装点街道", "节日期间互相拜访", "午夜放烟花"], a: 0, tr: "在节日举行前用灯饰装点街道是当地的习俗。" }
              ],
              speaking: [
                { text: "The whole family gathers for a big dinner on New Year's Eve.", tr: "除夕夜全家人聚在一起吃大餐。" },
                { text: "While we were decorating the house, our friends arrived.", tr: "我们正在装饰房子的时候，朋友们到了。" },
                { text: "If it rains, the ceremony will be held indoors.", tr: "如果下雨，仪式将在室内举行。" }
              ]
            },
            {
              id: "en-l22",
              title: "环境与社区",
              minutes: 14,
              xp: 80,
              focus: "环保行动与社区参与",
              vocab: [
                { t: "environment", r: "/ɪnˈvaɪrənmənt/", m: "环境", ex: "We should protect the environment." },
                { t: "pollution", r: "/pəˈluːʃn/", m: "污染", ex: "Air pollution is a serious problem in big cities." },
                { t: "recycle", r: "/ˌriːˈsaɪkl/", m: "回收利用", ex: "We recycle paper and plastic at home." },
                { t: "reduce", r: "/rɪˈduːs/", m: "减少", ex: "We should reduce the use of plastic bags." },
                { t: "waste", r: "/weɪst/", m: "废物；浪费", ex: "Don't waste water or electricity." },
                { t: "climate change", r: "/ˈklaɪmət tʃeɪndʒ/", m: "气候变化", ex: "Climate change affects every country." },
                { t: "community", r: "/kəˈmjuːnəti/", m: "社区", ex: "Our community organizes a clean-up every month." },
                { t: "volunteer", r: "/ˌvɑːlənˈtɪr/", m: "志愿者；自愿做", ex: "She volunteers at an animal shelter on weekends." },
                { t: "sustainable", r: "/səˈsteɪnəbl/", m: "可持续的", ex: "We need a more sustainable way of life." },
                { t: "responsibility", r: "/rɪˌspɑːnsəˈbɪləti/", m: "责任", ex: "Protecting the planet is everyone's responsibility." }
              ],
              grammar: [
                {
                  point: "被动语态进阶（完成时与将来时被动）",
                  rule: "现在完成时被动：have/has been + 过去分词；将来时被动：will be + 过去分词。",
                  examples: ["Thousands of trees have been planted in our city.", "A new recycling center will be built next year.", "The river has been cleaned up by volunteers."],
                  drills: [
                    { q: "More than a thousand trees ___ in the park so far.", opts: ["have planted", "have been planted", "will plant"], a: 1, why: "so far 提示现在完成时，trees 是被种植，用 have been planted。" },
                    { q: "A new recycling center ___ here next year.", opts: ["will build", "will be built", "has built"], a: 1, why: "next year 提示将来时，center 是被建造，用 will be built。" },
                    { q: "The beach ___ by volunteers twice this year.", opts: ["has been cleaned", "cleaned", "cleans"], a: 0, why: "twice this year 提示现在完成时被动。" }
                  ]
                },
                {
                  point: "动词 + to do / doing 的区别",
                  rule: "stop doing 停止做某事，stop to do 停下来去做另一件事；remember / forget 同理。",
                  examples: ["We must stop wasting water.", "He stopped to pick up the rubbish on the road.", "Remember to turn off the lights when you leave."],
                  drills: [
                    { q: "We should stop ___ plastic bags.", opts: ["use", "to use", "using"], a: 2, why: "stop doing 表示“停止做某事”。" },
                    { q: "Remember ___ the lights before you leave.", opts: ["turn off", "to turn off", "turning off"], a: 1, why: "remember to do 表示“记得去做（还没做）”。" },
                    { q: "On the way home, she stopped ___ some bottles for recycling.", opts: ["collect", "to collect", "collecting"], a: 1, why: "stop to do 表示“停下来去做另一件事”。" }
                  ]
                }
              ],
              listening: [
                { text: "A new recycling center will be built in our community next year, and more trees have been planted along the river.", q: "关于社区的变化，哪项是对的？", opts: ["明年建回收中心", "河流被污染了", "树木被砍伐了"], a: 0, tr: "明年我们社区将建一个新的回收中心，河边也已经种下了更多的树。" },
                { text: "Climate change is a global problem, but everyone can help by reducing waste in daily life.", q: "说话人认为个人能做什么？", opts: ["无济于事", "从日常生活减少浪费", "等待政府解决"], a: 1, tr: "气候变化是全球性问题，但每个人都可以通过在日常生活中减少浪费出一份力。" },
                { text: "She volunteers at the community garden every weekend because she believes a sustainable lifestyle starts at home.", q: "她为什么做志愿者？", opts: ["为了赚钱", "相信可持续生活从家开始", "为了完成课程要求"], a: 1, tr: "她每个周末都在社区花园做志愿者，因为她相信可持续的生活方式从家里开始。" }
              ],
              speaking: [
                { text: "Thousands of plastic bottles have been recycled this year.", tr: "今年已有成千上万个塑料瓶被回收。" },
                { text: "We must stop wasting water and electricity.", tr: "我们必须停止浪费水和电。" },
                { text: "Protecting the environment is everyone's responsibility.", tr: "保护环境是每个人的责任。" }
              ]
            }
          ]
        },
        {
          id: "en-u12",
          name: "深度表达",
          theme: "情感、假设与抽象讨论",
          lessons: [
            {
              id: "en-l23",
              title: "情感与关系",
              minutes: 13,
              xp: 78,
              focus: "表达情感与处理关系",
              vocab: [
                { t: "emotion", r: "/ɪˈmoʊʃn/", m: "情感", ex: "It's healthy to talk about your emotions." },
                { t: "relationship", r: "/rɪˈleɪʃnʃɪp/", m: "关系", ex: "Good communication is key to a healthy relationship." },
                { t: "grateful", r: "/ˈɡreɪtfl/", m: "感激的", ex: "I'm grateful for your support." },
                { t: "frustrated", r: "/ˈfrʌstreɪtɪd/", m: "沮丧的", ex: "She felt frustrated after the argument." },
                { t: "forgive", r: "/fərˈɡɪv/", m: "原谅", ex: "It takes time to forgive someone." },
                { t: "support", r: "/səˈpɔːrt/", m: "支持", ex: "My friends supported me when I was down." },
                { t: "honest", r: "/ˈɑːnɪst/", m: "诚实的", ex: "Be honest about your feelings." },
                { t: "misunderstanding", r: "/ˌmɪsʌndərˈstændɪŋ/", m: "误解", ex: "The argument was just a misunderstanding." },
                { t: "trust", r: "/trʌst/", m: "信任", ex: "Trust is the foundation of any relationship." },
                { t: "communicate", r: "/kəˈmjuːnɪkeɪt/", m: "沟通", ex: "Couples need to communicate openly." }
              ],
              grammar: [
                {
                  point: "间接引语（say / tell）",
                  rule: "转述他人话语时时态通常后移：am→was，will→would，can→could；say to sb / tell sb。",
                  examples: ["She said she was frustrated with her job.", "He told me that he would call me back.", "They said they could forgive each other."],
                  drills: [
                    { q: "She told me that she ___ grateful for my help.", opts: ["is", "was", "be"], a: 1, why: "间接引语中 is 后移为 was。" },
                    { q: "He said he ___ me the next day.", opts: ["will call", "would call", "calls"], a: 1, why: "will 在间接引语中后移为 would。" },
                    { q: "'I can help you.' → He said he ___ help me.", opts: ["can", "could", "may"], a: 1, why: "can 后移为 could。" }
                  ]
                },
                {
                  point: "make / let / help + 宾语 + 动词原形",
                  rule: "make sb do 使某人做，let sb do 让某人做，help sb (to) do 帮某人做；表达情感影响常用 make。",
                  examples: ["Her words made me feel better.", "My parents let me make my own decisions.", "Talking with friends helps me relax."],
                  drills: [
                    { q: "Her support made me ___ more confident.", opts: ["feel", "to feel", "feeling"], a: 0, why: "make + 宾语 + 动词原形。" },
                    { q: "My parents never let me ___ up so easily.", opts: ["give", "to give", "giving"], a: 0, why: "let + 宾语 + 动词原形。" },
                    { q: "Listening to music helps me ___ after a hard day.", opts: ["relax", "relaxed", "relaxing"], a: 0, why: "help sb (to) do，省略 to 更常见。" }
                  ]
                }
              ],
              listening: [
                { text: "She told me that she was grateful for my support and that she would never forget it.", q: "她说了什么？", opts: ["她很感激我的支持", "她要离开这个城市", "她忘记了我的帮助"], a: 0, tr: "她告诉我，她很感激我的支持，而且永远不会忘记。" },
                { text: "The argument was just a misunderstanding, but it made both of them feel frustrated for days.", q: "争吵让两人感觉如何？", opts: ["开心", "沮丧", "平静"], a: 1, tr: "那场争吵只是个误会，但让两人都沮丧了好几天。" },
                { text: "Honest communication helps people build trust in a relationship.", q: "说话人认为什么能建立信任？", opts: ["经常送礼", "坦诚沟通", "保持距离"], a: 1, tr: "坦诚的沟通能帮助人们在关系中建立信任。" }
              ],
              speaking: [
                { text: "She told me that she was grateful for my help.", tr: "她告诉我她很感激我的帮助。" },
                { text: "Honest communication helps build trust.", tr: "坦诚的沟通有助于建立信任。" },
                { text: "Your words made me feel much better.", tr: "你的话让我感觉好多了。" }
              ]
            },
            {
              id: "en-l24",
              title: "假设与展望",
              minutes: 14,
              xp: 80,
              focus: "虚拟语气与未来展望",
              vocab: [
                { t: "imagine", r: "/ɪˈmædʒɪn/", m: "想象", ex: "Imagine living in a different country." },
                { t: "suppose", r: "/səˈpoʊz/", m: "假设、料想", ex: "Suppose you won a million dollars. What would you do?" },
                { t: "opportunity", r: "/ˌɑːpərˈtuːnəti/", m: "机会", ex: "This job is a great opportunity for me." },
                { t: "achieve", r: "/əˈtʃiːv/", m: "实现、达成", ex: "She worked hard to achieve her goals." },
                { t: "goal", r: "/ɡoʊl/", m: "目标", ex: "My goal is to speak English fluently." },
                { t: "in the long run", r: "/ɪn ðə lɔːŋ rʌn/", m: "从长远看", ex: "Learning a language pays off in the long run." },
                { t: "regret", r: "/rɪˈɡret/", m: "后悔", ex: "I regret not studying harder at school." },
                { t: "choice", r: "/tʃɔɪs/", m: "选择", ex: "It was a difficult choice, but I don't regret it." },
                { t: "sooner or later", r: "/ˈsuːnər ɔːr ˈleɪtər/", m: "迟早", ex: "You'll achieve your dream sooner or later." },
                { t: "likely", r: "/ˈlaɪkli/", m: "很可能的", ex: "He is likely to succeed with such a good plan." }
              ],
              grammar: [
                {
                  point: "第二条件句（与现在事实相反的假设）",
                  rule: "If + 一般过去时（be 动词常用 were），主句用 would + 动词原形，表示与现在相反的假设。",
                  examples: ["If I had more time, I would learn another language.", "If I were you, I would take the opportunity.", "What would you do if you won the lottery?"],
                  drills: [
                    { q: "If I ___ rich, I would travel the world.", opts: ["am", "was", "were"], a: 2, why: "虚拟语气中 be 动词常用 were。" },
                    { q: "If she lived abroad, she ___ a new language.", opts: ["will learn", "would learn", "learns"], a: 1, why: "第二条件句主句用 would + 动词原形。" },
                    { q: "If I were you, I ___ the job.", opts: ["take", "would take", "will take"], a: 1, why: "与现在相反的假设，主句用 would。" }
                  ]
                },
                {
                  point: "第三条件句与 wish（对过去的假设与遗憾）",
                  rule: "If + 过去完成时，主句用 would have + 过去分词，表示与过去相反的假设；wish + 过去完成时表达遗憾。",
                  examples: ["If I had studied harder, I would have passed the exam.", "If we had left earlier, we wouldn't have missed the flight.", "I wish I had taken that opportunity."],
                  drills: [
                    { q: "If you had told me earlier, I ___ helped you.", opts: ["will have", "would have", "had"], a: 1, why: "第三条件句主句用 would have + 过去分词。" },
                    { q: "I wish I ___ harder when I was at school.", opts: ["study", "studied", "had studied"], a: 2, why: "对过去的遗憾用 wish + 过去完成时。" },
                    { q: "If they had booked earlier, they ___ a cheaper room.", opts: ["would get", "would have got", "will get"], a: 1, why: "与过去事实相反，用 would have + 过去分词。" }
                  ]
                }
              ],
              listening: [
                { text: "If I had taken that opportunity ten years ago, my life would have been completely different.", q: "说话人的意思是什么？", opts: ["十年前抓住了机会", "后悔当年没抓住机会", "生活一直很顺利"], a: 1, tr: "如果十年前我抓住了那个机会，我的人生会完全不同。" },
                { text: "If I were you, I would accept the offer. It's a chance you might regret missing in the long run.", q: "说话人建议对方怎么做？", opts: ["拒绝这个机会", "接受这个机会", "再等等看"], a: 1, tr: "如果我是你，我会接受这个机会。从长远看，错过了你可能会后悔。" },
                { text: "Suppose you could live anywhere in the world. Where would you choose and why?", q: "说话人在做什么？", opts: ["提出一个假设性问题", "介绍自己的家乡", "抱怨现在的生活"], a: 0, tr: "假设你可以住在世界任何地方，你会选择哪里，为什么？" }
              ],
              speaking: [
                { text: "If I had more time, I would travel around the world.", tr: "如果我有更多时间，我会环游世界。" },
                { text: "If I had known the truth, I would have told you earlier.", tr: "如果我早知道真相，我就会早点告诉你。" },
                { text: "I believe you will achieve your goals sooner or later.", tr: "我相信你迟早会实现自己的目标。" }
              ]
            }
          ]
        }
      ]
    }
  ]
};