const uploadRouter = require('express').Router()
const mongoose = require('mongoose')
const {
    awsClientUpload,
    awsProUpload,
    awsChatUpload,
    awsAvatarUpload,
    s3,
    DeleteObjectCommand,
    ListObjectsV2Command,
    getSignedUrl }  = require('../utils/uploadConfig')
const Upload = require('../models/awsUploads');
const User = require('../models/users');
const {GetObjectCommand} = require("@aws-sdk/client-s3");

uploadRouter.get('/images/:userId', async (req, res) => {
    const images = await Upload.find({ userId: req.params.userId });
    res.json(images);
});
// Post client image
uploadRouter.post('/upload-client', awsClientUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        console.log("Server test " + req.file.location);
        const newImage = new Upload({
            userId: "12345", // Optional: Store which user uploaded it
            imageUrl: req.file.location,
            key: req.file.key, // Store file key for deletion
            // title: req.body.title // Optional: Custom title
        });

        await newImage.save();
        res.json({ message: 'Image uploaded successfully', id: newImage._id, key: req.file.key,  imageUrl: req.file.location });
    } catch (err) {
        console.log("Error: " + err.message);
    }
});

// 📌 Get Signed URLs for Images
uploadRouter.get('/images', async (req, res) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Prefix: 'uploads/',
        });

        const data = await s3.send(command);
        const images = await Promise.all(
            data.Contents.map(async (item) => ({
                key: item.Key,
                url: await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: item.Key }), { expiresIn: 3600 }),
            }))
        );

        res.json(images);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching images', details: error.message });
    }
});

// 📌 Update  client Image (Delete Old & Upload New)
/* uploadRouter.put('/update_client/:id', awsClientUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const id = req.params.id;
    const key = req.params.key;
    try {
        
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });
        await s3.send(deleteCommand);

       
        const updatedImage = await Upload.findOneAndUpdate(
            { _id: id },
            { imageUrl: req.file.location, key: req.file.key },
            { new: true }
        );

        res.json({ message: 'Image updated', key: updatedImage.key,  imageUrl: updatedImage.imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error updating image', details: error.message });
    }
}); */


//📌 Update  client Image (Delete Old & Upload New)
uploadRouter.put("/update_client/:id", awsClientUpload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const id = req.params.id;

    const existing = await Upload.findById(id);
    if (!existing) return res.status(404).json({ error: "Image not found" });

    // delete old from S3
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: existing.key,
    }));

    // update DB with new file info
    existing.key = req.file.key;
    existing.imageUrl = req.file.location;
    await existing.save();

    res.json({ message: "Image updated", key: existing.key, imageUrl: existing.imageUrl });
  } catch (error) {
    res.status(500).json({ error: "Error updating image", details: error.message });
  }
});

// 📌 Delete Image
uploadRouter.delete('/delete-image/:id', async (req, res) => {
    const id = req.params.id;
    const key = req.params[0]
    console.log("Deleting key: " + req.params.key);
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        await Upload.findOneAndDelete({ key: key });
        res.status(204).end();

        await s3.send(command);

        //res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting image', details: error.message });
    }
});







// Upload provider image

uploadRouter.post('/upload-pro', awsProUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        console.log("Server test " + req.file.location);
        const newImage = new Upload({
            //userId: "12345", // Optional: Store which user uploaded it
            imageUrl: req.file.location,
            key: req.file.key, // Store file key for deletion
            // title: req.body.title // Optional: Custom title
        });

        await newImage.save();
        res.json({ message: 'Image uploaded successfully', id: newImage._id, key: req.file.key,  imageUrl: req.file.location });
    } catch (err) {
        console.log("Error: " + err.message);
    }
});

// 📌 Update provider Image (Delete Old & Upload New)
uploadRouter.put('/update_pro/:id', awsProUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const id = req.params.id;
    const key = req.params[0];
    try {
        // Delete old image
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });
        await s3.send(deleteCommand);

        // console.log("HHHHH " + key + " --- " + req.file.key);
        // console.log("ID " + id);

        // Update DB record with new image URL and key
        const updated = await Upload.findOneAndUpdate(
            { _id: id },
            { imageUrl: req.file.location, key: req.file.key },
            { new: true }
        );

        res.json({ message: 'Image updated', key: updated.key,  imageUrl: updated.imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Error updating image', details: error.message });
    }
});




/* uploadRouter.post('/upload-chat', awsChatUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        console.log("Server test " + req.file.location);
        const newChatImage = new Upload({
            imageUrl: req.file.location,
            key: req.file.key, // Store file key for deletion
        });

        await newChatImage.save();
        res.json({ message: 'Image uploaded successfully', id: newChatImage._id, key: req.file.key,  imageUrl: req.file.location });
    } catch (err) {
        console.log("Error: " + err.message);
    }
});
 */





// upload chat images (multiple)
uploadRouter.post("/upload-chat", awsChatUpload.array("files", 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    const saved = await Promise.all(
      req.files.map(async (f) => {
        const doc = new Upload({
          imageUrl: f.location,
          key: f.key,
          // optionally: userId, chatId, messageId etc
        });

        await doc.save();

        return {
          id: doc._id,
          key: f.key,
          imageUrl: f.location,
          mime: f.mimetype,
          name: f.originalname,
          size: f.size,
          isImage: (f.mimetype || "").startsWith("image/"),
        };
      })
    );

    res.json({
      message: "Images uploaded successfully",
      files: saved, // ✅ array
    });
  } catch (err) {
    console.error("upload-chat error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});











uploadRouter.post('/upload-avatar/:userID', awsAvatarUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.params.userID;
    try {
        console.log("User id " + userId);
        const user = await User.findById(userId);

        const items = user.avatar = {
            isImage: true,
            key: req.file.key,
            imageUrl: req.file.location
        };
        await user.save();
        console.log("User items - " + items);
        // const newImage = new Upload({
        //     imageUrl: req.file.location,
        //     key: req.file.key, // Store file key for deletion
        // });
        // await newImage.save();

        res.json({ message: 'Image uploaded successfully',  key: req.file.key, imageUrl: req.file.location });
    } catch (err) {
        console.log("Error: " + err.message);
    }
});

uploadRouter.put('/update-avatar/:userID', awsAvatarUpload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.params.userID;
    const key = req.params[0];
    try {
        console.log("User id " + userId);
        // Delete old image
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });
        await s3.send(deleteCommand);

        console.log("HHHHH " + key + " --- " + req.file.key);
        // console.log("ID " + id);
        //const user = await User.findById(userId);
        const newUserAvatar = {
            isImage: true,
            key: req.file.key,
            imageUrl: req.file.location
        }
        // user.avatar = newUserAvatar;
        // await user.save();
        await User.findByIdAndUpdate(
            userId, {avatar: newUserAvatar}, {new: true}
        )

        // Update DB record with new image URL and key
        // const updatedAvatar = await Upload.findOneAndUpdate(
        //     { _id: id },
        //     { imageUrl: req.file.location, key: req.file.key },
        //     { new: true }
        // );

        res.json({ message: 'Avatar image updated', key: req.file.key,  imageUrl: req.file.location });
    } catch (error) {
        res.status(500).json({ error: 'Error updating image', details: error.message });
    }
});

// 📌 Delete Avatar Image
uploadRouter.put('/delete-avatar/:userID', async (req, res) => {
    const userId = req.params.userID;
    const key = req.params[0]
    console.log("Deleting avatar key: " + req.params.key);
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        await User.findByIdAndUpdate(
            userId,
            {avatar: {isImage: false, key: "000", name: "avatar.png"}},

            {new: true}
        )

        //await Upload.findOneAndDelete({ _id: id });
        res.json({message: "User avatar is replased!"});

        await s3.send(command);

        //res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting avatar', details: error.message });
    }
});

module.exports = uploadRouter;