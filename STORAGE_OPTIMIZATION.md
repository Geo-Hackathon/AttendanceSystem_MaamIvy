# Storage Optimization Guide

## Overview

This Faculty Attendance System is optimized for **5GB storage limit** through automatic image compression, cleanup scheduling, and storage management tools.

---

## 🎯 Storage Optimization Features

### 1. **Automatic Image Compression**

All attendance photos are automatically compressed when uploaded:

- **Original size:** ~2-5 MB per photo
- **Compressed size:** ~50-100 KB per photo
- **Compression ratio:** ~95% reduction
- **Image quality:** 75% JPEG (good balance between quality and size)
- **Resolution:** Max 800x600 pixels (sufficient for attendance verification)

**Implementation:**
- Uses `sharp` library for efficient image processing
- Converts all images to optimized JPEG format
- Resizes images while maintaining aspect ratio

### 2. **Automatic Cleanup Scheduling**

The system automatically cleans up old images:

- **Schedule:** Daily at 2:00 AM
- **Retention period:** 90 days (configurable)
- **What gets deleted:** Attendance images older than retention period
- **Database cleanup:** Corresponding database records are also removed

### 3. **Manual Storage Management**

Admin dashboard includes a **Storage Management** tab with:

- Real-time storage statistics
- Storage usage visualization (progress bar)
- Manual cleanup tools
- Orphaned file removal

---

## 📊 Storage Capacity Estimates

### With Optimization (Current Setup)

| Scenario | Daily Photos | Photo Size | Monthly Storage | Yearly Storage |
|----------|--------------|------------|-----------------|----------------|
| Small (20 faculty) | 40 | 75 KB | 90 MB | 1.08 GB |
| Medium (50 faculty) | 100 | 75 KB | 225 MB | 2.7 GB |
| Large (100 faculty) | 200 | 75 KB | 450 MB | 5.4 GB* |

*With 90-day retention, actual usage: ~1.35 GB

### Without Optimization (Comparison)

| Scenario | Daily Photos | Photo Size | Monthly Storage | Yearly Storage |
|----------|--------------|------------|-----------------|----------------|
| Small (20 faculty) | 40 | 2 MB | 2.4 GB | 28.8 GB ❌ |
| Medium (50 faculty) | 100 | 2 MB | 6 GB | 72 GB ❌ |
| Large (100 faculty) | 200 | 2 MB | 12 GB | 144 GB ❌ |

---

## 🔧 Configuration Options

### Adjust Retention Period

**Default:** 90 days

**To change:**

1. **Via Admin Dashboard:**
   - Go to **Storage Management** tab
   - Set "Keep images from last (days)"
   - Click "Run Cleanup"

2. **Via Code** (server/index.js):
   ```javascript
   await cleanupOldImages(60); // Change 90 to desired days
   ```

**Recommendations:**
- **Minimum:** 30 days (for recent audit needs)
- **Recommended:** 60-90 days (balance between storage and compliance)
- **Maximum:** 180 days (if storage allows)

### Adjust Image Quality

**Default:** 75% JPEG quality, 800x600 max resolution

**To change** (server/middleware/upload.js):

```javascript
await sharp(req.file.buffer)
  .resize(1024, 768, {  // Increase resolution (uses more storage)
    fit: 'inside',
    withoutEnlargement: true 
  })
  .jpeg({ 
    quality: 85,  // Increase quality (uses more storage)
    progressive: true 
  })
  .toFile(filepath);
```

**Quality vs Size:**
- **Quality 60:** ~40 KB, acceptable for attendance
- **Quality 75:** ~75 KB, good balance (default)
- **Quality 85:** ~120 KB, high quality
- **Quality 95:** ~200 KB, near-original quality

### Adjust File Size Limit

**Default:** 3 MB upload limit

**To change** (server/middleware/upload.js):

```javascript
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Change to 5 MB
  fileFilter: fileFilter
});
```

---

## 🛠️ Storage Management Tools

### Admin Dashboard - Storage Management Tab

**Features:**

1. **Storage Overview**
   - Total files count
   - Total storage used (MB/GB)
   - Average file size
   - Storage usage percentage (vs 5GB limit)
   - Visual progress bar with color coding:
     - Green: < 50%
     - Yellow: 50-75%
     - Orange: 75-90%
     - Red: > 90%

2. **Cleanup Tools**
   - **Delete Old Images:** Remove images older than X days
   - **Remove Orphaned Files:** Delete files not linked to database

3. **Optimization Tips**
   - Built-in recommendations
   - Best practices

### API Endpoints

**Get Storage Statistics:**
```
GET /api/storage/stats
Authorization: Bearer <admin_token>

Response:
{
  "totalFiles": 1234,
  "totalSizeMB": "92.45",
  "totalSizeGB": "0.092",
  "avgSizeKB": "75.23",
  "attendanceRecords": 1234,
  "storageUsagePercent": "1.84"
}
```

**Run Cleanup:**
```
POST /api/storage/cleanup
Authorization: Bearer <admin_token>
Body: { "daysToKeep": 90 }

Response:
{
  "message": "Cleanup completed successfully",
  "deletedCount": 156,
  "failedCount": 0,
  "totalProcessed": 156
}
```

**Remove Orphaned Files:**
```
POST /api/storage/cleanup-orphaned
Authorization: Bearer <admin_token>

Response:
{
  "message": "Orphaned images cleanup completed",
  "deletedCount": 3
}
```

---

## 📋 Best Practices

### For Administrators

1. **Monitor Weekly**
   - Check storage usage every week
   - Run cleanup if usage exceeds 75%

2. **Before Cleanup**
   - Export important reports to PDF
   - Backup database if needed

3. **Regular Maintenance**
   - Run orphaned file cleanup monthly
   - Adjust retention period based on usage patterns

4. **Storage Alerts**
   - System shows warning at 75% usage
   - Take action before reaching 90%

### For Deployment

1. **Production Settings**
   - Keep 60-90 day retention
   - Monitor storage daily via cron job
   - Set up alerts for high usage

2. **Backup Strategy**
   - Database: Daily backups
   - Images: Optional (can be regenerated from attendance records)

3. **Scaling Considerations**
   - If approaching 5GB regularly, consider:
     - Reducing retention to 60 days
     - Lowering image quality to 60%
     - Reducing resolution to 640x480
     - Upgrading hosting plan

---

## 🔍 Troubleshooting

### Storage Full (>95%)

**Immediate Actions:**
1. Go to Storage Management tab
2. Run "Delete Old Images" with 30-day retention
3. Run "Remove Orphaned Files"
4. Check storage stats

**Long-term Solutions:**
- Reduce retention period to 60 days
- Lower image quality to 60%
- Upgrade hosting plan

### Images Not Compressing

**Check:**
1. Verify `sharp` package is installed: `npm list sharp`
2. Check server logs for compression errors
3. Ensure `compressImage` middleware is in attendance route

**Fix:**
```bash
npm install sharp
# Restart server
```

### Cleanup Not Running

**Check:**
1. Server logs for cleanup messages
2. Verify cleanup is scheduled in server/index.js
3. Check database permissions

**Manual Cleanup:**
```bash
# Via API
curl -X POST http://localhost:5000/api/storage/cleanup \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"daysToKeep": 90}'
```

### Orphaned Files Accumulating

**Causes:**
- Failed uploads
- Server crashes during upload
- Database errors

**Solution:**
- Run "Remove Orphaned Files" monthly
- Check upload error logs

---

## 📈 Monitoring Storage

### Check Current Usage

**Via Admin Dashboard:**
1. Login as admin
2. Go to "Storage Management" tab
3. View real-time statistics

**Via Server Logs:**
```
🧹 Cleanup completed: X images deleted
📊 Storage: X.XX GB / 5 GB (XX.X%)
```

### Set Up Monitoring Alerts

**Option 1: Email Alerts** (requires email service)
```javascript
// Add to server/utils/cleanup.js
if (parseFloat(stats.storageUsagePercent) > 80) {
  // Send email alert to admin
  sendEmailAlert('Storage usage above 80%');
}
```

**Option 2: Log Monitoring**
- Use log aggregation service (e.g., Logtail, Papertrail)
- Set up alerts for storage warnings

---

## 🎯 Optimization Checklist

- [x] Image compression enabled (sharp)
- [x] Automatic cleanup scheduled (daily 2 AM)
- [x] Storage management dashboard
- [x] Manual cleanup tools
- [x] Orphaned file removal
- [x] Storage statistics API
- [x] File size limits (3 MB)
- [x] Image quality optimization (75%)
- [x] Resolution limits (800x600)
- [x] 90-day retention policy

---

## 💡 Additional Tips

1. **Camera Settings:**
   - Instruct faculty to use good lighting
   - Avoid unnecessary background in photos
   - Center face in camera frame

2. **Database Optimization:**
   - Regularly optimize MySQL tables
   - Index frequently queried columns
   - Archive old attendance records

3. **Backup Strategy:**
   - Database: Daily automated backups
   - Images: Optional (space-saving)
   - Export reports before cleanup

4. **Future Scaling:**
   - Consider cloud storage (AWS S3, Cloudinary)
   - Implement CDN for image delivery
   - Use image optimization services

---

## 📞 Support

For storage-related issues:
1. Check this documentation
2. Review server logs
3. Test with Storage Management tools
4. Contact system administrator

**Storage Limits:**
- Maximum upload: 3 MB per image
- Compressed output: ~50-100 KB
- Total storage: 5 GB
- Retention: 90 days (default)
