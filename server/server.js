const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express()
const port = process.env.PORT || 3000
const uploadsDir = path.join(__dirname, 'uploads')

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

function generateRandomString(length = 16) {
  return randomBytes(length).toString('hex');
}

const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    const randomDir = generateRandomString();
    const uploadPath = path.join(uploadsDir, randomDir)

    fs.mkdirSync(uploadPath, {recursive: true});

    req.randomDir = randomDir

    cb(null, uploadPath)
  },
  filename: (req,file,cb) => {
    cb(null, file.originalname)
  }
});

app.post('/upload', upload.single('file'), (req,res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No file uploaded'});
  }

  const fileUrl = `${req.protocol}"//${req.get(host)}/cdn/${req.randomDir}/${req.file.filename}`;
  res.json({
    success: true,
    url: fileUrl,
    directory: req.randomDir,
    filename: req.file.filename,
    size: req.file.size
  });
});

app.get('/cdn/:directory/:filename', (req,res) => {
  const {directory, filename} = req.params;
  const filePath = path.join(uploadsDir, directory, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({error: 'File not found'})
  }

  res.sendFile(filePath)
});

app.get('/', (req,res) => {
  res.json({
    message: 'cdn™',
    endpoints: {
      upload: 'POST /upload',
      cdn: 'GET /cdn/:directory/:filename'
    }
  });
});

app.listen(PORT, () => {
  console.log(`cdn™ is running on port ${port}`);
})