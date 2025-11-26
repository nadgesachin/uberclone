module.exports = {
    superSecret: process.env.SUPERSECRET,
    email: process.env.EMAIL,
    sms: process.env.SMS,
    S3BUCKET: {
        DATA: {
            production: process.env.S3BUCKET_DATA_PROD,
            staging: process.env.S3BUCKET_DATA_STG,
            demo: process.env.S3BUCKET_DATA_DEMO,
            development: process.env.S3BUCKET_DATA_DEV,
        },
        IMAGE: {
            production: process.env.S3BUCKET_IMAGE_PROD,
            staging: process.env.S3BUCKET_IMAGE_STG,
            demo: process.env.S3BUCKET_IMAGE_DEMO,
            development: process.env.S3BUCKET_IMAGE_DEV,
        },
        PRIVATE: {
            production: process.env.S3BUCKET_PRIVATE_PROD,
            staging: process.env.S3BUCKET_PRIVATE_STG,
            demo: process.env.S3BUCKET_PRIVATE_DEMO,
            development: process.env.S3BUCKET_PRIVATE_DEV,
        },
    },
    DB_CONNECTION: {
        production: process.env.DB_PRODUCTION,
        staging: process.env.DB_STAGING,
        demo: process.env.DB_DEMO,
        development: process.env.DB_DEVELOPMENT || process.env.DB_STAGING || process.env.MONGODB_URL,
    },
    REDIS: {
        production: {
            host: process.env.REDIS_PROD_HOST,
            port: process.env.REDIS_PROD_PORT,
        },
        staging: {
            host: process.env.REDIS_STG_HOST,
            port: process.env.REDIS_STG_PORT,
        },
        demo: {
            host: process.env.REDIS_DEMO_HOST,
            port: process.env.REDIS_DEMO_PORT,
        },
        development: {
            host: process.env.REDIS_DEV_HOST,
            port: process.env.REDIS_DEV_PORT,
        },
    },
    CAPTCHA: {
        SITE_KEY: process.env.SITE_KEY,
        SECRET_KEY: process.env.SECRET_KEY,
    },
};
