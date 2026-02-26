import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToR2, uploadMultipleToR2 } from '@/lib/cloudflare';

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate file types (images and videos)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only images and videos are allowed.` },
          { status: 400 }
        );
      }
      
      // Check video file size (max 50MB)
      if (allowedVideoTypes.includes(file.type) && file.size > 50 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Video file size must be less than 50MB' },
          { status: 400 }
        );
      }
    }

    // Convert files to buffers
    const fileData = await Promise.all(
      files.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
        contentType: file.type,
      }))
    );

    // Upload to R2
    let urls;
    if (fileData.length === 1) {
      const url = await uploadToR2(
        fileData[0].buffer,
        fileData[0].fileName,
        fileData[0].contentType
      );
      urls = [url];
    } else {
      urls = await uploadMultipleToR2(fileData);
    }

    return NextResponse.json({
      success: true,
      urls,
      message: `${urls.length} file(s) uploaded successfully`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
