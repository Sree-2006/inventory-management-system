const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.BLOB_CONTAINER_NAME || 'reports';

let blobServiceClient;
let containerClient;

if (connectionString) {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
}

/**
 * Uploads a buffer to Azure Blob Storage
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} blobName - The destination filename
 * @param {string} contentType - The MIME type (e.g., 'application/pdf')
 * @returns {Promise<string>} - Returns the URL of the uploaded blob
 */
async function uploadBufferToBlob(buffer, blobName, contentType = 'application/pdf') {
    if (!containerClient) {
        throw new Error("Azure Blob Storage connection string is not configured.");
    }

    // Ensure the container exists
    await containerClient.createIfNotExists({ access: 'blob' });

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload buffer
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: contentType }
    });

    return blockBlobClient.url;
}

module.exports = {
    uploadBufferToBlob
};
