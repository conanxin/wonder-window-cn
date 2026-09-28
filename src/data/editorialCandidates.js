export const editorialCandidates = [
  {
    id: 'trial-03-utamaro',
    slug: 'trial-03-utamaro-butterfly-dragonfly',
    number: '试刊03',
    title: '读到那两首诗，蝴蝶就不只是蝴蝶了',
    date: '2026年9月27日',
    publishedAt: null,
    readingTime: '约 6 分钟',
    tags: ['图像', '公版', '浮世绘', '阅读'],
    summary:
      '从喜多川歌麿《画本虫ゑらみ》中的“蝶・蜻蛉”对开出发：先看图，再读两首狂歌，然后回到同一幅图。',
    publicationStatus: 'READY',
    schemaVersion: 2,
    issueType: 'close-look',
    issueTypeLabel: 'Close Look｜单对象深看',
    coreQuestion: '当题诗重新进入画面，同一幅花虫图会如何改变？',
    editorialPoint:
      '图像、题诗与署名本身已经形成足够强的编辑关系，不需要为了凑栏目再增加材料。',
    editorialPath: ['先看图', '读两首狂歌', '回到同一幅图'],
    media: [
      {
        kind: 'image',
        src: 'https://images.metmuseum.org/CRDImages/as/original/DP143122.jpg',
        alt: '喜多川歌麿《蝶・蜻蛉》，《画本虫ゑらみ》中的对开构图，1788年。',
        caption:
          '喜多川歌麿《蝶・蜻蛉》，1788年。大都会艺术博物馆 JP1046 / object 37286。',
        sourceUrl: 'https://www.metmuseum.org/art/collection/search/37286',
        rightsStatus: 'OPEN_ACCESS',
      },
    ],
    sections: [
      {
        title: '先看图，暂时不读左边的字',
        paragraphs: [
          '左边有两只蝴蝶，一只展翅，一只靠近花朵；右边是一只蜻蜓。暂时不必先认植物名字，让视线在花枝、翅膀和题诗之间移动。',
          '这组构图出自1788年的《画本虫ゑらみ》。国立国会图书馆解题说明全书十五图，每图安排两种生物和两首狂歌；这里“两种”不等于“两只”。',
        ],
      },
      {
        title: '一首想靠近，一首不肯放手',
        paragraphs: [
          '“蝶”的诗写梦中化作蝴蝶，去亲近思念之人花一般的唇；“蜻蛉”的诗则把对方的心想成蜻蜓，并说不肯让它飞走。',
          '一个想着靠近，一个说不肯放走。画里的虫可以飞，文字里的愿望却朝着不同方向走。',
          '馆方记录说明歌麿负责绘图，宿屋飯盛选诗，蔦屋重三郎出版，多位狂歌作者参与；图像作者并不自动等于文字作者。',
        ],
        quote: '第一首想把自己变成蝴蝶；第二首则把对方的心想成蜻蜓。',
      },
      {
        title: '回到同一幅图',
        paragraphs: [
          '翅膀没有移动，花也没有变，但题诗让原先只是花与虫的空间容纳了人的思念与不肯松手的口气。',
          '如果只把漂亮的花与虫裁出来，诗就会变成可以省去的边角；保留它们，几行字会悄悄改变整幅图的含义。',
          '这一页没有画出一个人。读过那两首诗以后，人已经进来了。',
        ],
      },
    ],
    sources: [
      {
        title: 'The Met｜JP1046 / object 37286',
        url: 'https://www.metmuseum.org/art/collection/search/37286',
        role: '核心对象、图像与作品说明',
      },
      {
        title: 'National Diet Library｜《画本虫ゑらみ》书目',
        url: 'https://ndlsearch.ndl.go.jp/books/R100000002-I000007278272',
        role: '书目、版本背景与全书结构',
      },
      {
        title: '题诗整理读本｜蝶・蜻蛉',
        url: 'https://www.benricho.org/kanji/kanji_mushi-utamaro/04.html',
        role: '现代化日文整理读本；不是原字形逐字校勘',
      },
    ],
    evidenceBoundary: [
      '只讨论“蝶・蜻蛉”这一组对开构图，不概括全书。',
      '主图是 Met JP1046；NDL WA32-8 只用于书目与版本背景。',
      '中文为本轮译释，不宣称完成原字形逐字校勘。',
      '不进行现代物种鉴定，也不从屏幕颜色判断特殊印刷材料。',
    ],
    closingQuestion:
      '如果把题诗裁掉，我们究竟是在看原来的对象，还是一个被重新制造出来的“漂亮花虫图”？',
    notionUrl:
      'https://app.notion.com/p/3e834a28189a8191bd25c7bc958d8db1',
  },
  {
    id: 'w40-victor-7127f',
    slug: 'w40-victor-7127f-voices-without-names',
    number: '2026-W40',
    title: '声音还在，名字没了',
    date: '2026年9月28日',
    publishedAt: null,
    readingTime: '策划中',
    tags: ['声音', '档案', '公版', '唱片'],
    summary:
      '围绕1903年 Victor 7127F：技术元数据保存得极其具体，表演者姓名却没有留下。',
    publicationStatus: 'ISSUE_CANDIDATE',
    schemaVersion: 2,
    issueType: 'close-look',
    issueTypeLabel: 'Close Look｜Close Listen',
    coreQuestion:
      '当声音被保存下来，而歌名与表演者姓名没有被保存，档案究竟保存了什么？',
    editorialPoint:
      '精确的 matrix、take、日期与 performer unidentified 之间，已经形成一期内容所需的张力。',
    editorialPath: ['先听', '看目录元数据', '发现缺失', '再听一次'],
    media: [
      {
        kind: 'audio',
        src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Chinese_Vocal_and_Instrumental_Ensemble.ogg',
        caption:
          'Victor 7127F 听音副本。Commons 文件为增强转码版；原件记录回链 Library of Congress。',
        sourceUrl: 'https://www.loc.gov/item/jukebox-312589/',
        rightsStatus: 'PD_CONFIRMED',
      },
    ],
    sections: [
      {
        title: '先听几十秒',
        paragraphs: [
          '先让声音作为对象出现，不先猜曲名，也不根据泛化历史照片想象表演者的样貌。',
        ],
      },
      {
        title: '一张唱片知道得很多',
        paragraphs: [
          '目录能精确给出1903年8月7日、Victor 7127F、matrix [Pre-matrix B-]7127、take 1 与10-inch disc。',
        ],
      },
      {
        title: '它不知道最重要的名字',
        paragraphs: [
          'Library of Congress 当前仍把表演者标为 unidentified：分类、编号和工业生产信息留下来了，人的身份却没有完整进入元数据。',
        ],
      },
      {
        title: '我们能推到哪里',
        paragraphs: [
          '2017年的 Library of Congress 研究只把语言判断为粤语，并认为 Part 2／6／7 似乎来自粤剧或若干粤剧片段；团体、戏名和费城录音地点都不能升级为确定事实。',
        ],
      },
      {
        title: '再听一遍',
        paragraphs: [
          '第二次播放不再增加背景，只让读者带着“谁没有被写进元数据”的问题回到同一段声音。',
        ],
      },
    ],
    sources: [
      {
        title: 'Library of Congress｜Chinese recording, Part 6',
        url: 'https://www.loc.gov/item/jukebox-312589/',
        role: '核心对象与目录元数据',
      },
      {
        title: 'Library of Congress Folklife Today｜Music and a Mystery',
        url: 'https://blogs.loc.gov/folklife/2017/01/music-chinese-new-year/',
        role: '语言与可能曲种的研究边界',
      },
      {
        title: 'National Jukebox｜Rights and Access',
        url: 'https://www.loc.gov/collections/national-jukebox/about-this-collection/rights-and-access/',
        role: '录音与唱片标签的使用状态',
      },
    ],
    evidenceBoundary: [
      '不能把“Chinese Opera Company”写成已确认演出团体。',
      '不能说 Part 2／6／7 一定来自同一出戏。',
      'Philadelphia 仍是 unconfirmed，不写成确定录音地点。',
      '正式成稿前仍需一次有记录的实际聆听笔记；不猜歌词、曲牌或人物身份。',
    ],
    closingQuestion: '声音保存下来了。名字没有。你会把哪一种称为档案？',
    notionUrl:
      'https://app.notion.com/p/3e934a28189a81c39e33fdb6cf21bf86',
  },
]


export function getEditorialCandidateBySlug(slug) {
  return editorialCandidates.find((issue) => issue.slug === slug)
}
