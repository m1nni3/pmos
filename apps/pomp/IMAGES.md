# Property Image Placeholders

Images are served from two Cloudflare R2 public buckets. Replace files at any time — no redeployment needed.

## Buckets

| Bucket | Public URL | Purpose |
|--------|-----------|---------|
| `pmos-property-images` | `https://pub-d66179a93f094dd788fadc511338b676.r2.dev` | Thumbnails & banners |
| `pmos-gallery` | `https://pub-d973b33a485c4c33b4da9c059732fda8.r2.dev` | Gallery images |

## Expected File Paths

For each property, use the property's **database UUID** as the folder name.

### Thumbnails & Banners (`pmos-property-images`)
```
/{property_id}/thumb.jpg     — Card thumbnail  (recommended: 400×300)
/{property_id}/banner.jpg    — Slide panel banner (recommended: 800×400)
```

### Gallery Images (`pmos-gallery`)
```
/{property_id}/gallery/01.jpg
/{property_id}/gallery/02.jpg
/{property_id}/gallery/kitchen.jpg
... (any filename, returned via API as gallery_images array)
```

## How to Update

1. Upload replacement images directly to the R2 bucket via the Cloudflare dashboard or `wrangler r2 object put`.
2. Use the same file path — the app fetches images fresh on each load.
3. No build or deploy step required.

## Fallback Behaviour

If an image returns a 404 error, the app falls back to the property's brand colour gradient. Gallery tab shows an empty state with upload instructions.
