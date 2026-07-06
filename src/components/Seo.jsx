import { useEffect } from 'react'
import { absoluteUrl, siteConfig } from '../siteConfig.js'

const defaultImage = absoluteUrl('/og.svg')

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

export function Seo({
  title = siteConfig.siteName,
  description = siteConfig.siteDescription,
  type = 'website',
  image = defaultImage,
}) {
  useEffect(() => {
    const pageTitle =
      title === siteConfig.siteName ? siteConfig.siteName : `${title} | ${siteConfig.siteName}`
    document.title = pageTitle

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    })
    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: pageTitle,
    })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    })
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    })
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: image,
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    })
    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: pageTitle,
    })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    })
    upsertMeta('meta[name="twitter:image"]', {
      name: 'twitter:image',
      content: image,
    })
  }, [description, image, title, type])

  return null
}
