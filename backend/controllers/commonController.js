import { asyncHandler } from '../utils/error.js';
import { uploadBufferToCloudinary } from '../utils/media.js';

export const createCrudController = (Model, options = {}) => {
  const defaultSort = options.defaultSort || '-createdAt';

  const list = asyncHandler(async (req, res) => {
    const filter = options.publicOnly && !req.user ? { ...(options.publicFilter || {}) } : {};
    const items = await Model.find(filter).sort(defaultSort);
    res.json(items);
  });

  const getById = asyncHandler(async (req, res) => {
    const item = await Model.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json(item);
  });

  const getBySlug = asyncHandler(async (req, res) => {
    const item = await Model.findOne({ slug: req.params.slug });
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json(item);
  });

  const create = asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file);
      payload[options.singleImageField || 'image'] = uploaded.secure_url;
    }
    if (req.files?.length && options.multiImageField) {
      const uploadedImages = await Promise.all(req.files.map((f) => uploadBufferToCloudinary(f)));
      payload[options.multiImageField] = uploadedImages.map((item) => item.secure_url);
    }
    const item = await Model.create(payload);
    res.status(201).json(item);
  });

  const update = asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file);
      payload[options.singleImageField || 'image'] = uploaded.secure_url;
    }
    if (req.files?.length && options.multiImageField) {
      const uploadedImages = await Promise.all(req.files.map((f) => uploadBufferToCloudinary(f)));
      payload[options.multiImageField] = uploadedImages.map((item) => item.secure_url);
    }
    const item = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json(item);
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error('Item not found');
    }
    res.json({ message: 'Deleted successfully' });
  });

  return { list, getById, getBySlug, create, update, remove };
};
