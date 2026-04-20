# SentrySearch API Documentation

This document provides a comprehensive overview of the available API endpoints in SentrySearch.

## `GET /api/settings`

**Summary:** Get Settings

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

## `PUT /api/settings`

**Summary:** Update Settings

### Request Body

- **Content-Type:** `application/json`
  - Schema: `Settings`

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `POST /api/settings/test-local`

**Summary:** Test Local Model

Test if the local model can be loaded successfully.

Attempts to load the local Qwen3-VL model and returns status.
If model loading fails, returns error status with reason.

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

## `GET /api/index/progress/{job_id}`

**Summary:** Get Indexing Progress

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `job_id` | path | `string` | Yes |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `POST /api/index/cancel/{job_id}`

**Summary:** Cancel Indexing

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `job_id` | path | `string` | Yes |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `POST /api/index/start`

**Summary:** Start Indexing

### Request Body

- **Content-Type:** `application/json`
  - Schema: `IndexRequest`

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `GET /api/stats`

**Summary:** Get Stats

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

## `GET /api/library`

**Summary:** Get Library

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

## `DELETE /api/library/{item_id}`

**Summary:** Delete Library Item

Remove a file from the index. Optionally could delete file from disk too.

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `item_id` | path | `string` | Yes |  |
| `path` | query | `string` | Yes |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `GET /api/history`

**Summary:** Get History

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

## `GET /api/search`

**Summary:** Search

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `q` | query | `string` | No |  |
| `threshold` | query | `number` | No |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `GET /api/video/stream/{video_id}`

**Summary:** Stream Video

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `video_id` | path | `string` | Yes |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `GET /api/video/trim/{video_id}`

**Summary:** Trim Video

### Parameters

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `video_id` | path | `string` | Yes |  |
| `start` | query | `number` | Yes |  |
| `end` | query | `number` | Yes |  |
| `padding` | query | `number` | No |  |

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `POST /api/index/upload`

**Summary:** Upload Videos

### Request Body

- **Content-Type:** `multipart/form-data`
  - Schema: `Body_upload_videos_api_index_upload_post`

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `POST /api/index/upload-and-index`

**Summary:** Upload And Index

### Request Body

- **Content-Type:** `multipart/form-data`
  - Schema: `Body_upload_and_index_api_index_upload_and_index_post`

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |
| `422` | Validation Error |

---

## `GET /api/health`

**Summary:** Health Check

### Responses

| Code | Description |
|------|-------------|
| `200` | Successful Response |

---

# Schemas

## Body_upload_and_index_api_index_upload_and_index_post

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `files` | `Array<string>` | Yes |  |

---

## Body_upload_videos_api_index_upload_post

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `files` | `Array<string>` | Yes |  |

---

## HTTPValidationError

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `detail` | `Array<ValidationError>` | No |  |

---

## HistoryItem

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `integer` | Yes |  |
| `query` | `string` | Yes |  |
| `timestamp` | `string` | Yes |  |
| `results_count` | `integer` | Yes |  |
| `best_score` | `number` | Yes |  |
| `top_result` | `string` | Yes |  |

---

## IndexRequest

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `folder_path` | `string` | Yes |  |

---

## LibraryItem

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes |  |
| `name` | `string` | Yes |  |
| `duration` | `string` | Yes |  |
| `size` | `string` | Yes |  |
| `status` | `string` | Yes |  |
| `path` | `string` | Yes |  |
| `videoUrl` | `string` | Yes |  |

---

## LocalModelTestResponse

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `status` | `string` | Yes |  |
| `reason` | `string | null` | No |  |
| `model_used` | `string | null` | No |  |

---

## SearchResult

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes |  |
| `title` | `string` | Yes |  |
| `thumbnailUrl` | `string` | Yes |  |
| `score` | `number` | Yes |  |
| `duration` | `string` | Yes |  |
| `timestamp` | `string` | Yes |  |
| `videoUrl` | `string` | Yes |  |
| `startTime` | `number` | Yes |  |
| `endTime` | `number` | Yes |  |
| `originalPath` | `string` | Yes |  |
| `usedFallback` | `boolean` | No |  |
| `fallbackReason` | `string | null` | No |  |

---

## Settings

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `model` | `string` | No |  |
| `chunk_duration` | `integer` | No |  |
| `overlap` | `integer` | No |  |
| `gemini_api_key` | `string | null` | No |  |
| `local_model_size` | `string` | No |  |
| `active_backend` | `string | null` | No |  |
| `active_model` | `string | null` | No |  |
| `is_using_fallback` | `boolean` | No |  |
| `fallback_reason` | `string | null` | No |  |

---

## Stats

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `total_videos` | `integer` | Yes |  |
| `total_chunks` | `integer` | Yes |  |
| `vector_db_size` | `string` | Yes |  |
| `total_footage_duration` | `string` | Yes |  |

---

## ValidationError

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `loc` | `Array<any>` | Yes |  |
| `msg` | `string` | Yes |  |
| `type` | `string` | Yes |  |

---

