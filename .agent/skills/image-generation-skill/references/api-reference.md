# Kie.ai API Reference

## Table of Contents

1. [Endpoints & Auth](#endpoints--auth)
2. [Create Task — Request Format](#create-task--request-format)
3. [Supported Parameters](#supported-parameters)
4. [Image-to-Image (Reference Image)](#image-to-image-reference-image)
5. [Polling Strategy](#polling-strategy)
6. [Task States](#task-states)
7. [Image URL Extraction Chain](#image-url-extraction-chain)
8. [Error Handling](#error-handling)

---

## Endpoints & Auth

| | |
| --- | --- |
| **Base URL** | `https://api.kie.ai/api/v1/jobs` |
| **Create Task** | `POST /createTask` |
| **Poll Results** | `GET /recordInfo?taskId={id}` |

**Headers** (both endpoints):

```
Authorization: Bearer {KIE_API_KEY}
Content-Type: application/json
```

---

## Create Task — Request Format

```json
{
  "model": "nano-banana-2",
  "input": {
    "prompt": "{enhanced_prompt}",
    "aspect_ratio": "{ratio}",
    "resolution": "{quality}",
    "output_format": "png",
    "google_search": false
  }
}
```

**Bash example:**

```bash
curl -s -X POST "https://api.kie.ai/api/v1/jobs/createTask" \
  -H "Authorization: Bearer ${KIE_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nano-banana-2",
    "input": {
      "prompt": "YOUR_ENHANCED_PROMPT",
      "aspect_ratio": "1:1",
      "resolution": "1K",
      "output_format": "png",
      "google_search": false
    }
  }'
```

Extract the task ID from the response: look for `data.taskId`, `data.task_id`, or `data.id`.

---

## Supported Parameters

| Parameter | Options | Default |
| --- | --- | --- |
| **Model** | `nano-banana-2` | `nano-banana-2` |
| **Aspect Ratio** | `1:1`, `3:4`, `4:3`, `16:9`, `9:16` | `1:1` |
| **Resolution** | `512px`, `1K`, `2K`, `4K` | `1K` |
| **Output Format** | `png` | `png` |

---

## Image-to-Image (Reference Image)

When the user provides a reference image URL, add the `image_input` field:

```json
{
  "model": "nano-banana-2",
  "input": {
    "prompt": "{enhanced_prompt}",
    "aspect_ratio": "{ratio}",
    "resolution": "{quality}",
    "output_format": "png",
    "google_search": false,
    "image_input": ["{reference_image_url}"]
  }
}
```

---

## Polling Strategy

| Setting | Value | Why |
| --- | --- | --- |
| **Interval** | Every 5 seconds | Shorter wastes requests; longer adds unnecessary wait |
| **Max wait** | 180 seconds | Most generations finish within 60s; 180s covers edge cases |
| **Timeout action** | Inform user, offer to retry | Don't silently fail |

**Bash example:**

```bash
curl -s "https://api.kie.ai/api/v1/jobs/recordInfo?taskId={TASK_ID}" \
  -H "Authorization: Bearer ${KIE_API_KEY}"
```

---

## Task States

| State | Meaning | Action |
| --- | --- | --- |
| `waiting` / `pending` | Queued, not started | Keep polling |
| `processing` / `running` | Actively generating | Keep polling |
| `success` / `completed` / `done` / `finished` | Generation complete | Extract image URL |
| `failed` / `error` / `cancelled` | Generation failed | Report error, offer retry |

Check `data.state` in the poll response.

---

## Image URL Extraction Chain

This is critical to get right. The image URL is inside `data.resultJson`, which is a **JSON string** — not a parsed object. You must `JSON.parse()` it first.

Try these in order until one yields a valid URL:

| Priority | Path |
| --- | --- |
| 1 | `data.resultJson` → parse → `resultUrls[0]` |
| 2 | `data.resultJson` → parse → `resultUrl` |
| 3 | `data.resultJson` → parse → `images[0]` |
| 4 | `data.resultJson` → parse → `url` or `image_url` |
| 5 | `data.resultJson` as raw URL string (if starts with `http`) |
| 6 | `data.image_url` or `data.imageUrl` |
| 7 | `data.url` |
| 8 | `data.output.image_url` or `data.output.url` |
| 9 | Deep search: find any HTTP URL containing `.png`, `.jpg`, `.webp`, `tempfile`, or `cdn` |

---

## Error Handling

| Error | Cause | Fix |
| --- | --- | --- |
| `401 Unauthorized` | Invalid or missing API key | Ask user to verify `KIE_API_KEY` |
| `429 Rate Limited` | Too many requests | Wait 30 seconds, then retry |
| `Task failed` | Generation failed server-side | Retry with simplified prompt |
| `Generation timed out` | Took longer than 3 minutes | Retry; suggest lower resolution |
| `No task ID returned` | Unexpected API response format | Log full response, check for direct image URL |
| `No image URL in response` | Extraction failed | Log full poll response, try deep URL search |
