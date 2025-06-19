# Avatar Upload System

This system provides base64-encoded avatar upload functionality for users, leveraging the imaging library for automatic resizing and optimization.

## Features

- **Base64 Storage**: Avatars are stored as base64 data URIs for easy display without additional API calls
- **Automatic Resizing**: Images are automatically resized to 384x384 pixels maximum
- **Format Support**: Supports JPEG, PNG, GIF, WEBP, and AVIF formats
- **File Size Validation**: Enforces 5MB maximum file size
- **Database Storage**: Stores both base64 (for display) and binary data (for optimization)
- **Transaction Safety**: Uses database transactions to ensure data consistency

## Components

### AvatarUpload Component

The main component for avatar upload functionality.

```tsx
import { AvatarUpload } from "@/components/ui/avatar-upload";

function UserProfile({ user }) {
  return (
    <AvatarUpload
      userId={user.id}
      currentAvatar={user.avatar}
      userName={user.name}
      size="lg" // 'sm' | 'md' | 'lg'
      onAvatarUpdate={(newAvatar) => {
        // Handle avatar update
        console.log("New avatar:", newAvatar);
      }}
    />
  );
}
```

### UserProfileAvatar Component

Example implementation showing avatar upload in a profile context.

```tsx
import { UserProfileAvatar } from "@/components/user-profile-avatar";

function ProfilePage({ user }) {
  return <UserProfileAvatar user={user} />;
}
```

## Database Schema

The system uses two models for avatar storage:

### User Model

```prisma
model User {
  id     String  @id @default(cuid())
  avatar String? // Base64 data URI for easy display
  // ... other fields
}
```

### UserImage Model

```prisma
model UserImage {
  id          String  @id @default(cuid())
  userId      String
  data        Bytes?  // Binary image data
  contentType String? // MIME type
  hash        String? // SHA256 hash for deduplication
}
```

## API Actions

### updateUserAvatar

Server action for updating user avatars.

```typescript
import { updateUserAvatar } from "@/actions/user/update-user-avatar";

const result = await updateUserAvatar(userId, base64Image);

if (result.success) {
  console.log("Avatar updated:", result.data);
} else {
  console.error("Error:", result.error);
}
```

## Imaging Library Integration

The system leverages several imaging utilities:

- **`resizeBase64Image`**: Resizes base64 images to appropriate dimensions
- **`decodeBase64Image`**: Extracts buffer and MIME type from base64 data
- **`resizeImage`**: Core image resizing functionality using Sharp

## Validation

Avatar validation supports both URLs and base64 data URIs:

```typescript
// Valid formats:
"https://example.com/avatar.jpg"; // URL
"data:image/jpeg;base64,/9j/4AA..."; // Base64 data URI
```

## Usage in Navigation

The avatar upload is integrated into the navigation component:

```tsx
// components/nav-user.tsx
<AvatarUpload
  userId={user.id}
  currentAvatar={user.avatar}
  userName={user.name}
  size="sm"
  className="grayscale"
/>
```

## Security Considerations

- File type validation prevents non-image uploads
- File size limits prevent abuse
- Images are automatically resized to prevent large file storage
- SHA256 hashing enables deduplication

## Performance Optimizations

- Base64 storage enables immediate display without API calls
- Binary storage in UserImage table for future optimizations
- Automatic image compression through Sharp library
- Transaction-based updates ensure consistency

## Error Handling

The system handles various error scenarios:

- Invalid image formats
- File size too large
- Database errors
- Network issues
- Invalid user IDs

All errors are logged and user-friendly messages are displayed via toast notifications.
