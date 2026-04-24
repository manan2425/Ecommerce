Product JSON Builder — JS-only helper

Location: public/tools/product-builder.html

Purpose:
- Lightweight client-side HTML/JS page to build product JSON without needing to tinker with curl or the backend UI.
- Supports previewing a 2D image, adding parts (hotspots) with name, price, thumbnail and description.
- Lets you copy generated JSON or POST it to an admin endpoint (POST expects JSON). Note: your server may prefer multipart/form-data for images — this tool posts JSON only.

How to use locally during dev:
- Start your frontend (Vite) dev server from the repository root:
  cd ecommerce-mern
  npm run dev

- Open the builder page in your browser:
  http://localhost:5173/tools/product-builder.html

- Use the image upload to provide a product photo. Add parts (hotspots) manually or by clicking on the admin image preview in the app.
- Click "Copy JSON" to paste the result into whichever admin tool or API you use.

Notes and limitations:
- The builder performs only client-side operations and does not upload binary images to your server. If your server expects image uploads, you will need a separate multipart/form-data flow.
- If you want a one-click uploader that stores images and thumbnails on Cloudinary / S3 and returns public URLs, I can add that next.