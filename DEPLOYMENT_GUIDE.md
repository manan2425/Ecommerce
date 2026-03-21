# 🚀 MERN Stack Deployment Guide

## 📋 Current Setup
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🔧 Environment Variables Setup

### 1. Render (Backend) Environment Variables

Go to your Render dashboard → Your service → Environment:

```
MONGODB_URL=mongodb+srv://manan2425:Mananpatel%40436@cluster0.mvdx9is.mongodb.net/ecommerce1
PORT=10000
CLIENT_BASE_URL=https://your-vercel-app-name.vercel.app
JWT_SECRET=your_secure_random_jwt_secret_32_chars_minimum
```

**Replace `your-vercel-app-name` with your actual Vercel domain!**

### 2. Vercel (Frontend) Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

**Replace `your-render-backend-url` with your actual Render domain!**

## 🐛 Troubleshooting

### If you still get "Network Error":

1. **Check Browser Console** (F12 → Console tab)
2. **Check Network Tab** for failed requests
3. **Verify URLs** in environment variables
4. **Check CORS** - ensure your Vercel domain is in CLIENT_BASE_URL

### Common Issues:

- **Wrong API URL**: Make sure VITE_API_URL points to your Render backend
- **Missing CLIENT_BASE_URL**: Backend needs to know your frontend domain
- **CORS Issues**: Check that CLIENT_BASE_URL matches your Vercel domain exactly
- **Port Issues**: Render uses port 10000 by default

## ✅ Testing Deployment

1. **Test Backend**: Visit `https://your-render-url.onrender.com/` - should show "Backend is working 🚀"
2. **Test Frontend**: Visit your Vercel URL
3. **Test API**: Try logging in - check Network tab for successful API calls

## 🔄 Redeployment Steps

After updating environment variables:

1. **Redeploy Backend** on Render (automatic on push)
2. **Redeploy Frontend** on Vercel (automatic on push)

## 📞 Support

If issues persist:
- Check Render logs for backend errors
- Check Vercel function logs for frontend errors
- Verify MongoDB Atlas connection