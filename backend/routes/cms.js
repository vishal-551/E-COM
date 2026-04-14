import express from 'express';
import { createCrudController } from '../controllers/commonController.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import ProjectImage from '../models/ProjectImage.js';
import BlogPost from '../models/BlogPost.js';
import Testimonial from '../models/Testimonial.js';
import TeamMember from '../models/TeamMember.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import QuoteRequest from '../models/QuoteRequest.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import SiteSetting from '../models/SiteSetting.js';

const router = express.Router();

const serviceCtrl = createCrudController(Service, { singleImageField: 'image' });
const projectCtrl = createCrudController(Project, { singleImageField: 'coverImage', multiImageField: 'galleryImages' });
const projectImageCtrl = createCrudController(ProjectImage, { singleImageField: 'imageUrl' });
const blogCtrl = createCrudController(BlogPost, { singleImageField: 'featuredImage' });
const testimonialCtrl = createCrudController(Testimonial, { singleImageField: 'avatar' });
const teamCtrl = createCrudController(TeamMember, { singleImageField: 'photo' });
const enquiryCtrl = createCrudController(ContactEnquiry);
const quoteCtrl = createCrudController(QuoteRequest);
const newsletterCtrl = createCrudController(NewsletterSubscriber);
const settingCtrl = createCrudController(SiteSetting);

const protectAdmin = [protect, adminOnly];

router.get('/services', serviceCtrl.list);
router.get('/services/:slug', serviceCtrl.getBySlug);
router.post('/admin/services', ...protectAdmin, upload.single('image'), serviceCtrl.create);
router.put('/admin/services/:id', ...protectAdmin, upload.single('image'), serviceCtrl.update);
router.delete('/admin/services/:id', ...protectAdmin, serviceCtrl.remove);

router.get('/projects', projectCtrl.list);
router.get('/projects/:slug', projectCtrl.getBySlug);
router.post('/admin/projects', ...protectAdmin, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 8 }]), (req, _, next) => {
  if (req.files?.coverImage?.[0]) req.file = req.files.coverImage[0];
  if (req.files?.galleryImages) req.files = req.files.galleryImages;
  next();
}, projectCtrl.create);
router.put('/admin/projects/:id', ...protectAdmin, upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 8 }]), (req, _, next) => {
  if (req.files?.coverImage?.[0]) req.file = req.files.coverImage[0];
  if (req.files?.galleryImages) req.files = req.files.galleryImages;
  next();
}, projectCtrl.update);
router.delete('/admin/projects/:id', ...protectAdmin, projectCtrl.remove);

router.get('/blog', blogCtrl.list);
router.get('/blog/:slug', blogCtrl.getBySlug);
router.post('/admin/blog', ...protectAdmin, upload.single('featuredImage'), blogCtrl.create);
router.put('/admin/blog/:id', ...protectAdmin, upload.single('featuredImage'), blogCtrl.update);
router.delete('/admin/blog/:id', ...protectAdmin, blogCtrl.remove);

router.get('/testimonials', testimonialCtrl.list);
router.post('/admin/testimonials', ...protectAdmin, upload.single('avatar'), testimonialCtrl.create);
router.put('/admin/testimonials/:id', ...protectAdmin, upload.single('avatar'), testimonialCtrl.update);
router.delete('/admin/testimonials/:id', ...protectAdmin, testimonialCtrl.remove);

router.get('/team', teamCtrl.list);
router.post('/admin/team', ...protectAdmin, upload.single('photo'), teamCtrl.create);
router.put('/admin/team/:id', ...protectAdmin, upload.single('photo'), teamCtrl.update);
router.delete('/admin/team/:id', ...protectAdmin, teamCtrl.remove);

router.get('/admin/project-images', ...protectAdmin, projectImageCtrl.list);
router.post('/admin/project-images', ...protectAdmin, upload.single('imageUrl'), projectImageCtrl.create);
router.put('/admin/project-images/:id', ...protectAdmin, upload.single('imageUrl'), projectImageCtrl.update);
router.delete('/admin/project-images/:id', ...protectAdmin, projectImageCtrl.remove);

router.get('/admin/enquiries', ...protectAdmin, enquiryCtrl.list);
router.put('/admin/enquiries/:id', ...protectAdmin, enquiryCtrl.update);
router.delete('/admin/enquiries/:id', ...protectAdmin, enquiryCtrl.remove);

router.get('/admin/quotes', ...protectAdmin, quoteCtrl.list);
router.put('/admin/quotes/:id', ...protectAdmin, quoteCtrl.update);
router.delete('/admin/quotes/:id', ...protectAdmin, quoteCtrl.remove);

router.get('/admin/newsletter', ...protectAdmin, newsletterCtrl.list);
router.delete('/admin/newsletter/:id', ...protectAdmin, newsletterCtrl.remove);

router.get('/admin/settings', ...protectAdmin, settingCtrl.list);
router.post('/admin/settings', ...protectAdmin, settingCtrl.create);
router.put('/admin/settings/:id', ...protectAdmin, settingCtrl.update);
router.delete('/admin/settings/:id', ...protectAdmin, settingCtrl.remove);

export default router;
