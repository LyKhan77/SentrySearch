**SentrySearch UI Components List**  
(Frontend only – for building the UI first)

### Layout Components
- RootLayout
- SidebarNav
- TopHeader (with model switcher + status)
- MainContentArea
- Footer (optional)

### Page-Level Views
- DashboardPage
- IndexManagerPage
- SearchPage
- ResultsPage
- ResultDetailPage
- LibraryPage
- HistoryPage
- SettingsPage

### Core Reusable Components
- VideoUploader (drag & drop + folder picker)
- IndexingProgressBar (with ETA, cancel, live logs)
- SearchBar (natural language input + search button)
- SearchFilters (threshold slider, model selector, chunk options)
- SearchResultsGrid (cards with thumbnail, score, title)
- VideoPreviewCard
- DualVideoPlayer (original + trimmed clip side-by-side)
- ClipCard (download button + Tesla overlay toggle)
- IndexStatsCard
- LibraryTable (sortable list of indexed videos)
- HistoryTable

### Form & Input Elements
- NaturalLanguageInput (textarea)
- ThresholdSlider
- ChunkDurationSelector
- OverlapSelector
- ApiKeyInput (masked)
- ModelToggle (Gemini / Local Qwen3-VL)
- TeslaOverlaySwitch
- PreprocessingToggleGroup
- FolderPathInput

### Display & Feedback Elements
- ThumbnailImage
- SimilarityScoreBadge
- StatusBadge (indexing / completed / error)
- EmptyStateMessage
- ErrorAlert
- SuccessToast
- LoadingSpinner
- CostEstimatorBadge (Gemini only)
- VideoMetadataPanel (duration, resolution, date, etc.)

### Video-Related Components
- SimpleVideoPlayer
- TimelineScrubber
- ClipDownloadButton
- PlayButtonOverlay

### Utility / Primitive Components (from shadcn/ui)
- Button (all variants)
- Card
- Dialog/Modal
- DropdownMenu
- Tabs
- Accordion
- Tooltip
- ProgressBar
- Switch/Toggle
- Slider
- Badge
- ScrollArea
- Separator
- DataTable

This is the **complete minimal list** you need to build the entire frontend.

You can start coding these one by one in Next.js + Tailwind + shadcn/ui.  
Want me to give you the exact folder structure for these components next? Or jump straight to code for the first few (e.g. SearchBar + DualVideoPlayer)? Just say what you need.