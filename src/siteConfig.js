export const siteConfig = {
  siteName: '万物小窗',
  siteDescription:
    '《万物小窗》是一份策展式中文通讯：从书、图像、档案、地方、文章与声音中选择少量对象，建立关系、提供语境，并保留证据与原件出口。',
  siteUrl: 'https://wonder-window-cn.vercel.app',
  author: 'Conan Xin',
  rssPath: '/rss.xml',
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.siteUrl.replace(/\/$/, '')}${normalizedPath}`
}
