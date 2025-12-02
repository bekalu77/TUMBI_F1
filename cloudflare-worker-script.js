// Define the environment variables that will be used in the worker
// These need to be set in the Cloudflare dashboard
// - R2_BUCKET: The R2 bucket to upload files to
// - R2_PUBLIC_URL: The public URL of the R2 bucket

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Expected POST request', { status: 405 });
    }

    try {
      const formData = await request.formData();
      const files = formData.getAll('productImages'); // 'productImages' should match the field name in your form

      if (files.length === 0) {
        return new Response('No files uploaded', { status: 400 });
      }

      const uploadedUrls = [];

      for (const file of files) {
        if (typeof file === 'string') continue; // Skip if it's not a file

        const fileKey = `uploads/${Date.now()}-${file.name}`;
        
        // Normalize the file extension to lowercase to ensure content type is set correctly
        const fileExtension = file.name.split('.').pop().toLowerCase();
        let contentType = file.type;
        
        // A basic mapping for common image types, in case file.type is not reliable
        const typeMap = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
        };

        if (typeMap[fileExtension]) {
          contentType = typeMap[fileExtension];
        }
        
        await env.R2_BUCKET.put(fileKey, await file.arrayBuffer(), {
          httpMetadata: { contentType: contentType },
        });

        uploadedUrls.push(`${env.R2_PUBLIC_URL}/${fileKey}`);
      }

      return new Response(JSON.stringify(uploadedUrls), {
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Error processing upload:', error);
      return new Response('Failed to process upload', { status: 500 });
    }
  },
};
