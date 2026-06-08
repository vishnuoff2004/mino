const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'provider-photos';

const ensureBucket = async () => {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1');
    console.log(`✅ Bucket "${BUCKET_NAME}" created.`);
  }

  // Set public read policy so images are viewable via direct URL
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      },
    ],
  };
  await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
};

const getFileUrl = (fileName) => {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const port = process.env.MINIO_PORT || 9000;
  return `${protocol}://${process.env.MINIO_ENDPOINT}:${port}/${BUCKET_NAME}/${fileName}`;
};

module.exports = { minioClient, BUCKET_NAME, ensureBucket, getFileUrl };
