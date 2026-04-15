import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

export const uploadBufferToCloudinary = (file, folder = 'agency-cms') => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
    if (error) return reject(error);
    return resolve(result);
  });

  Readable.from(file.buffer).pipe(stream);
});
