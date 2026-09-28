export const editorialCandidates = [
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
