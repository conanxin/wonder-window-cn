export const siteConfig = {
  siteName: '万物小窗',
  siteDescription:
    '《万物小窗》是一份写给好奇心、注意力和内在生活的中文周刊。每周打开一扇通往惊奇、自然、思想与生活智慧的窗。',
  siteUrl: 'https://wonder-window-cn.vercel.app',
  author: 'Conan Xin',
  rssPath: '/rss.xml',
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.siteUrl.replace(/\/$/, '')}${normalizedPath}`
}
