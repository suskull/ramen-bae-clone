# Exercise 04: File Storage

Master Supabase Storage for file uploads and management.

## Learning Objectives

- Upload files to Supabase Storage
- Implement image transformations
- Create storage policies
- Handle file downloads
- Manage file permissions

## Part 1: Basic File Upload (15 minutes)

### Task 1.1: Create Storage Bucket

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Or use Supabase Dashboard: Storage → New bucket
```

### Task 1.2: Upload Component

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setUrl(publicUrl);
      alert('Upload successful!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept="image/*"
      />
      {uploading && <p>Uploading...</p>}
      {url && <img src={url} alt="Uploaded" className="mt-4 max-w-xs" />}
    </div>
  );
}
```

## Part 2: Image Transformations (15 minutes)

### Task 2.1: Responsive Images

```typescript
function getImageUrl(path: string, width: number) {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(path, {
      transform: {
        width,
        height: width,
        resize: 'cover',
        quality: 80,
      },
    });

  return data.publicUrl;
}

// Usage
<picture>
  <source srcSet={getImageUrl(path, 400)} media="(max-width: 640px)" />
  <source srcSet={getImageUrl(path, 800)} media="(max-width: 1024px)" />
  <img src={getImageUrl(path, 1200)} alt="Product" />
</picture>
```

## Part 3: Storage Policies (15 minutes)

### Task 3.1: Create Policies

```sql
-- Anyone can view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  auth.role() = 'authenticated'
);

-- Users can delete own files
CREATE POLICY "Users delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Part 4: File Management (15 minutes)

### Task 4.1: List Files

```typescript
const { data: files, error } = await supabase.storage
  .from('product-images')
  .list('uploads', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
```

### Task 4.2: Delete Files

```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .remove(['uploads/file1.jpg', 'uploads/file2.jpg']);
```

### Task 4.3: Download Files

```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .download('uploads/file.jpg');

// Create download link
const url = URL.createObjectURL(data);
const a = document.createElement('a');
a.href = url;
a.download = 'file.jpg';
a.click();
```

## Challenges

### Challenge 1: Multi-File Upload
Allow uploading multiple files at once.

### Challenge 2: Progress Indicator
Show upload progress percentage.

### Challenge 3: Image Cropper
Add image cropping before upload.

### Challenge 4: File Gallery
Build a file management gallery.

### Challenge 5: Video Upload
Handle video file uploads with thumbnails.

## Key Takeaways

- Use storage buckets to organize files
- Implement policies for security
- Use transformations for images
- Always validate file types and sizes
- Handle errors gracefully
- Clean up unused files

## Next Exercise

Continue to Exercise 05 for Database Functions!
