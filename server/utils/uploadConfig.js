//const aws = require('aws-sdk');
require('dotenv').config();
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require("crypto");


// region: process.env.AWS_REGION

// Create an S3 client using AWS SDK v3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    // endpoint: `https://s3.${process.env.AWS_REGION}.amazonaws.com`,  // Explicitly set the endpoint
    forcePathStyle: true, // Ensures requests go to the correct endpoint
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

let clientUpload = "";
let proUpload = "";
let chatUpload = "";
let avatarUpload = "";

if (process.env.NODE_ENV === 'production') {
    console.log("AWS is in production");
    clientUpload = "clientUploads";
    proUpload = "proUploads";
    chatUpload = "chatUploads";
    avatarUpload = "avatarUploads"
} else {
    console.log("AWS currently in dev");
    clientUpload = "clientUploadsDev";
    proUpload = "ProUploadsDev";
    chatUpload = "chatUploadsDev";
    avatarUpload = "avatarUploadsDev";
}

// Configure Multer-S3 storage
const awsClientUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,

        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
        /* key: (req, file, cb) => {
            cb(null, `${clientUpload}/${Date.now()}-${file.originalname}`);
        }, */

        key: (req, file, cb) => {
            cb(null, `${clientUpload}/${Date.now()}-${randomUUID()}-${file.originalname}`);
        },
    }),
});

const awsProUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,

        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
        key: (req, file, cb) => {
            cb(null, `${proUpload}/${Date.now()}-${randomUUID()}-${file.originalname}`);
        },
    }),
});

const awsChatUpload = multer({
    
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,

        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type

        /* key: (req, file, cb) => {
            cb(null, `${chatUpload}/${Date.now()}-${file.originalname}`);
        }, */

        

        key: (req, file, cb) => {
        cb(null, `${chatUpload}/${Date.now()}-${randomUUID()}-${file.originalname}`);
        },
        
    }),
});

const awsAvatarUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,

        contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
        key: (req, file, cb) => {
            cb(null, `${avatarUpload}/${Date.now()}-${file.originalname}`);
        },
    }),
});

module.exports = { awsClientUpload, awsProUpload, awsChatUpload, awsAvatarUpload, s3, DeleteObjectCommand, ListObjectsV2Command, getSignedUrl }