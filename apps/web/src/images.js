import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../api'
import { fmt, FONT } from '../styles'
import { Skeleton, Empty } from '../components/UI'
import { usePageTitle } from '../PageTitleContext'

const PROPERTY_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669']

// Placeholder URLs — swap to R2 URLs once uploaded
export const BANNER_PLACEHOLDER = 'https://i.ibb.co/placeholder/banner.png'
export const CARD_PLACEHOLDER   = 'https://i.ibb.co/placeholder/card.png'

// R2 public base — set once bucket is public
export const R2_BASE = 'https://pub-edc00faaf5f2eb18fa447682df2ec812.r2.dev'

export function propertyBanner(p)  { return `${R2_BASE}/pmos-property-images/${p.id}/banner.jpg` }
export function propertyThumb(p)   { return `${R2_BASE}/pmos-assets/thumbnails/${p.id}/thumb.jpg` }
export function galleryImage(propertyId, filename) { return `${R2_BASE}/pmos-gallery/${propertyId}/gallery/${filename}` }
