# Auto-Save Strategy: Local Storage First

This document outlines the implementation of a robust auto-save strategy that prioritizes local storage for immediate persistence, followed by database synchronization.

## Overview

The auto-save strategy consists of three main layers:

1. **Immediate Local Storage** - Changes are saved to localStorage within 1 second
2. **Periodic Database Sync** - Local changes are synced to the database every 30 seconds
3. **Manual Save** - Users can manually trigger a database save at any time

## Architecture

### Components

#### 1. `useLocalStorage` Hook

- Generic hook for localStorage operations
- Handles JSON serialization/deserialization
- Provides error handling for localStorage operations
- SSR-safe implementation

#### 2. `useAutoSave` Hook

- Manages the auto-save lifecycle
- Debounces content changes to prevent excessive saves
- Handles both local and database persistence
- Provides status tracking and error handling
- Implements draft recovery functionality

#### 3. `AutoSavePlateEditor` Component

- Wraps the PlateEditor with auto-save functionality
- Provides visual feedback for save status
- Implements draft recovery UI
- Handles manual save operations

#### 4. `useOnlineStatus` Hook

- Detects online/offline status
- Can be used to modify save behavior when offline

## Data Flow

```
User Types → Editor Change → useAutoSave Hook
                                    ↓
                            1. Save to localStorage (1s debounce)
                                    ↓
                            2. Sync to Database (2s debounce)
                                    ↓
                            3. Auto-sync every 30s (if changes exist)
```

## Features

### 1. Draft Recovery

- Automatically detects unsaved changes on page load
- Shows a dialog allowing users to restore or discard drafts
- Timestamps help users understand when changes were made

### 2. Status Indicators

- Visual indicators show current save status:
  - 🔄 Saving (animated cloud icon)
  - ✅ Saved (green checkmark with timestamp)
  - ⚠️ Unsaved changes (yellow cloud-off icon)
  - ❌ Error (red alert icon with error message)

### 3. Manual Save

- Save button allows immediate database synchronization
- Disabled during active save operations
- Provides user feedback via toast notifications

### 4. Error Handling

- Graceful handling of localStorage failures
- Database save errors are displayed to users
- Retry logic for failed saves (via periodic sync)

## Implementation Details

### LocalStorage Keys

- Documents are stored with the pattern: `doc_draft_{documentId}`
- Each draft includes:
  - `content`: The Plate.js Value object
  - `timestamp`: When the change was made
  - `documentId`: Document identifier for validation

### Debouncing Strategy

- **Local Storage**: 1 second debounce for immediate feedback
- **Database Save**: 2 seconds debounce to batch changes
- **Auto-sync**: 30 seconds for periodic background sync

### Memory Management

- Drafts are automatically cleaned up after successful database saves
- Stale drafts (older than a certain threshold) could be purged
- Event listeners are properly cleaned up on component unmount

## Usage

### Basic Implementation

```tsx
import { AutoSavePlateEditor } from "@/components/editor/auto-save-plate-editor";

function DocumentPage({ documentId, initialContent }) {
  return (
    <AutoSavePlateEditor
      documentId={documentId}
      initialValue={initialContent}
    />
  );
}
```

### With Custom Save Logic

```tsx
import { useAutoSave } from "@/hooks/use-auto-save";

function CustomEditor({ documentId }) {
  const { updateContent, status, save } = useAutoSave({
    documentId,
    onSave: async (content) => {
      // Custom save logic
      const result = await myCustomSaveFunction(content);
      return { success: result.ok, error: result.error };
    },
    debounceMs: 2000, // Custom debounce timing
  });

  // Use updateContent in your editor's onChange handler
}
```

## Benefits

### 1. Data Loss Prevention

- Changes are immediately saved to localStorage
- Recovery from browser crashes or accidental navigation
- Offline editing capabilities

### 2. Performance

- Reduces database load by batching requests
- Immediate user feedback for changes
- Background synchronization doesn't block UI

### 3. User Experience

- Clear visual indicators of save status
- Graceful handling of network issues
- Manual save option for user control

### 4. Reliability

- Multiple layers of persistence
- Error recovery and retry mechanisms
- Graceful degradation when localStorage is unavailable

## Configuration Options

### Auto-Save Timing

- `debounceMs`: Delay before saving to localStorage (default: 1000ms)
- `autoSaveIntervalMs`: Interval for periodic database sync (default: 30000ms)

### Custom Save Handler

The `onSave` function should return:

```typescript
{
  success: boolean;
  error?: string;
}
```

## Troubleshooting

### Common Issues

1. **localStorage Quota Exceeded**

   - Implement cleanup for old drafts
   - Consider compression for large documents

2. **Network Failures**

   - Changes remain in localStorage until connection restored
   - Periodic sync will retry failed saves

3. **Conflicting Changes**
   - Consider implementing conflict resolution
   - Show user when document was modified by another user

## Future Enhancements

1. **Compression**: Compress localStorage data for large documents
2. **Conflict Resolution**: Handle simultaneous edits from multiple users
3. **Offline Indicator**: Show offline status and queue changes
4. **Background Sync**: Use Service Worker for background synchronization
5. **Selective Sync**: Only sync changed portions of large documents

## Security Considerations

- localStorage is accessible to all scripts on the domain
- Consider encrypting sensitive content before storing
- Implement proper authentication for database saves
- Clear localStorage on logout for security
