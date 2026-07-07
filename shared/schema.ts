import { pgTable, text, varchar, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  role: text("role").default("user").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isActive: true,
});

// Banners table
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  mobileImageUrl: text("mobile_image_url"),
  imageAlt: text("image_alt"), // SEO alt text for banner image
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  source: text("source"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
});

// Donation categories table
export const donationCategories = pgTable("donation_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for category image
  heading: text("heading"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
  suggestedAmounts: json("suggested_amounts").$type<number[] | null>(),
});

export const insertDonationCategorySchema = createInsertSchema(donationCategories).omit({
  id: true,
});

// Donation cards table - predefined donation options for each category
export const donationCards = pgTable("donation_cards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => donationCategories.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
});

export const insertDonationCardSchema = createInsertSchema(donationCards).omit({
  id: true,
});

// Bank details table - for bank transfer information
export const bankDetails = pgTable("bank_details", {
  id: serial("id").primaryKey(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  upiId: text("upi_id"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertBankDetailsSchema = createInsertSchema(bankDetails).omit({
  id: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for event image
  readMoreUrl: text("read_more_url"),
  isActive: boolean("is_active").default(true).notNull(),
  suggestedAmounts: json("suggested_amounts").$type<number[] | null>(),
  customDonationEnabled: boolean("custom_donation_enabled").default(true).notNull(),
  customDonationTitle: text("custom_donation_title").default("Any Donation of Your Choice").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

// Event donation cards table - for predefined donation amounts per event
export const eventDonationCards = pgTable("event_donation_cards", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventDonationCardSchema = createInsertSchema(eventDonationCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Event bank details table - specific bank details per event
export const eventBankDetails = pgTable("event_bank_details", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id, { onDelete: 'cascade' }).notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  upiId: text("upi_id"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventBankDetailsSchema = createInsertSchema(eventBankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Category-specific bank details table
export const categoryBankDetails = pgTable("category_bank_details", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => donationCategories.id, { onDelete: 'cascade' }).notNull(),
  accountName: text("account_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  swiftCode: text("swift_code"),
  upiId: text("upi_id"),
  qrCodeUrl: text("qr_code_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategoryBankDetailsSchema = createInsertSchema(categoryBankDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CategoryBankDetails = typeof categoryBankDetails.$inferSelect;
export type InsertCategoryBankDetails = typeof categoryBankDetails.$inferInsert;

// Gallery table
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for gallery image
  order: integer("order").notNull(),
});

export const insertGallerySchema = createInsertSchema(gallery).omit({
  id: true,
});

// Videos table
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  thumbnailAlt: text("thumbnail_alt"), // SEO alt text for video thumbnail
  youtubeUrl: text("youtube_url").notNull(),
  order: integer("order").notNull(),
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
});

// Live videos table
export const liveVideos = pgTable("live_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLiveVideoSchema = createInsertSchema(liveVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type LiveVideo = typeof liveVideos.$inferSelect;
export type InsertLiveVideo = typeof liveVideos.$inferInsert;

// Testimonials table
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  message: text("message").notNull(),
  imageUrl: text("image_url"),
  rating: integer("rating").default(5).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Social links table
export const socialLinks = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
  createdAt: true,
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(),
  title: text("title").notNull(),
  shortDescription: text("short_description"),
  description: text("description"),
  goalAmount: integer("goal_amount").notNull(),
  coverImage: text("cover_image").notNull(),
  galleryImages: json("gallery_images"),
  videoUrl: text("video_url"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("draft").notNull(), // draft, active, completed, paused, archived
  displayOrder: integer("display_order").default(1),
  isFeatured: boolean("is_featured").default(false),
  showOnHomepage: boolean("show_on_homepage").default(true),
  donationCategoryId: integer("donation_category_id").references(() => donationCategories.id),
  upiId: text("upi_id"),
  bankAccountHolder: text("bank_account_holder"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  bankName: text("bank_name"),
  bankBranch: text("bank_branch"),
  swiftCode: text("swift_code"),
  micrCode: text("micr_code"),
  qrCodeImage: text("qr_code_image"),
  paymentMethods: json("payment_methods"),
  allowCustomAmount: boolean("allow_custom_amount").default(true).notNull(),
  minCustomAmount: integer("min_custom_amount").default(10),
  maxCustomAmount: integer("max_custom_amount").default(1000000),
  successMessage: text("success_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Donation amount cards for campaigns
export const donationAmountCards = pgTable("donation_amount_cards", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  amount: integer("amount").notNull(),
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDonationAmountCardSchema = createInsertSchema(donationAmountCards).omit({
  id: true,
  createdAt: true,
});

// Donations table
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  categoryId: integer("category_id").references(() => donationCategories.id),
  eventId: integer("event_id").references(() => events.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  amount: integer("amount").notNull(),
  amountType: text("amount_type").default("preset").notNull(), // preset, custom
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  panCard: text("pan_card"),
  message: text("message"),
  paymentId: text("payment_id"),
  status: text("status").default("pending").notNull(),
  paymentGatewayResponse: text("payment_gateway_response"),
  paymentProofFile: text("payment_proof_file"), // Screenshot or PDF
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  invoiceNumber: text("invoice_number"),
  receiptSent: boolean("receipt_sent").default(false),
  notificationSent: boolean("notification_sent").default(false),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  isActive: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type DonationCategory = typeof donationCategories.$inferSelect;
export type InsertDonationCategory = z.infer<typeof insertDonationCategorySchema>;
export type DonationCard = typeof donationCards.$inferSelect;
export type InsertDonationCard = z.infer<typeof insertDonationCardSchema>;
export type BankDetails = typeof bankDetails.$inferSelect;
export type InsertBankDetails = z.infer<typeof insertBankDetailsSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventDonationCard = typeof eventDonationCards.$inferSelect;
export type InsertEventDonationCard = z.infer<typeof insertEventDonationCardSchema>;
export type EventBankDetails = typeof eventBankDetails.$inferSelect;
export type InsertEventBankDetails = z.infer<typeof insertEventBankDetailsSchema>;
export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type DonationAmountCard = typeof donationAmountCards.$inferSelect;
export type InsertDonationAmountCard = z.infer<typeof insertDonationAmountCardSchema>;

// Stats table for the counter section
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  value: integer("value").notNull(),
  suffix: varchar("suffix", { length: 20 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Stat = typeof stats.$inferSelect;
export type InsertStat = typeof stats.$inferInsert;

// Temple schedule table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  time: varchar("time", { length: 10 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;

// Insert schemas for stats and schedules
export const insertStatSchema = createInsertSchema(stats, {
  value: z.number().min(0),
  suffix: z.string().max(20).optional().nullable(),
  label: z.string().min(1).max(255),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleSchema = createInsertSchema(schedules, {
  time: z.string().min(1).max(10),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt"), // SEO alt text for main image
  author: text("author").notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  isPublished: boolean("is_published").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"), // SEO meta title
  seoDescription: text("seo_description"), // SEO meta description
  seoKeywords: text("seo_keywords"), // SEO keywords
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const insertBlogPostSchema = createInsertSchema(blogPosts, {
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().min(1), // Allow any non-empty string for relative URLs
  imageAlt: z.string().min(1).max(125).optional(),
  author: z.string().min(1).max(100),
  readTime: z.number().min(1),
  publishedAt: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
  seoTitle: z.string().min(1).max(60).optional(),
  seoDescription: z.string().min(1).max(160).optional(),
  seoKeywords: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Process/Featured section table (for ISKCON Food for Child section)
export const processSections = pgTable("process_sections", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("ISKCON FOOD FOR CHILD"),
  description: text("description"),
  desktopImageUrl: text("desktop_image_url").notNull(),
  mobileImageUrl: text("mobile_image_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProcessSection = typeof processSections.$inferSelect;
export type InsertProcessSection = typeof processSections.$inferInsert;

export const insertProcessSectionSchema = createInsertSchema(processSections, {
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  desktopImageUrl: z.string().min(1),
  mobileImageUrl: z.string().min(1),
  isActive: z.boolean().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Footer settings table
export const footerSettings = pgTable("footer_settings", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().default("Hare Krishna Land, Juhu, Mumbai, Maharashtra 400049, India"),
  phone: text("phone").notNull().default("+91 22 2620 0072"),
  email: text("email").notNull().default("info@iskconjuhu.in"),
  templeHours: text("temple_hours").notNull().default("Daily: 4:30 AM - 9:00 PM"),
  templeHoursSpecial: text("temple_hours_special").notNull().default("Special timings during festivals"),
  introDescription: text("intro_description").notNull().default("We'd love to hear from you. Reach out for inquiries, spiritual guidance, or to participate in our services."),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FooterSettings = typeof footerSettings.$inferSelect;
export type InsertFooterSettings = typeof footerSettings.$inferInsert;

export const insertFooterSettingsSchema = createInsertSchema(footerSettings, {
  address: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  templeHours: z.string().min(1),
  templeHoursSpecial: z.string().min(1),
  introDescription: z.string().min(1),
  logoUrl: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Policies table
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Policy = typeof policies.$inferSelect;
export type InsertPolicy = typeof policies.$inferInsert;

export const insertPolicySchema = createInsertSchema(policies, {
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  content: z.string().min(1),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Policies Page Settings table
export const policiesPage = pgTable("policies_page", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Policies of Usage"),
  description: text("description").notNull().default("Please review our policies to understand how we operate and your rights as a user."),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PoliciesPage = typeof policiesPage.$inferSelect;
export type InsertPoliciesPage = typeof policiesPage.$inferInsert;

export const insertPoliciesPageSchema = createInsertSchema(policiesPage, {
  title: z.string().min(1).max(255),
  description: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Timeline Milestones
export const timelineMilestones = pgTable("timeline_milestones", {
  id: serial("id").primaryKey(),
  yearOrDate: text("year_or_date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type TimelineMilestone = typeof timelineMilestones.$inferSelect;
export type InsertTimelineMilestone = typeof timelineMilestones.$inferInsert;
export const insertTimelineMilestoneSchema = createInsertSchema(timelineMilestones).omit({ id: true, createdAt: true, updatedAt: true });

// Volunteers
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  city: text("city").notNull(),
  interestArea: text("interest_area").notNull(), // cooking, distribution, events, digital, other
  availability: text("availability").notNull(),
  status: text("status").default("new").notNull(), // new, contacted, onboarded, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, createdAt: true });

// Trust & Transparency: Certificates
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  number: text("number"),
  badgeIconUrl: text("badge_icon_url"),
  fileUrl: text("file_url"),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, createdAt: true, updatedAt: true });

// Trust & Transparency: Annual Reports
export const annualReports = pgTable("annual_reports", {
  id: serial("id").primaryKey(),
  year: text("year").notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AnnualReport = typeof annualReports.$inferSelect;
export type InsertAnnualReport = typeof annualReports.$inferInsert;
export const insertAnnualReportSchema = createInsertSchema(annualReports).omit({ id: true, createdAt: true, updatedAt: true });

// Trust & Transparency: Fund Allocations
export const fundAllocations = pgTable("fund_allocations", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  percentage: integer("percentage").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FundAllocation = typeof fundAllocations.$inferSelect;
export type InsertFundAllocation = typeof fundAllocations.$inferInsert;
export const insertFundAllocationSchema = createInsertSchema(fundAllocations).omit({ id: true, createdAt: true, updatedAt: true });

// FAQs
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("general").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;
export const insertFAQSchema = createInsertSchema(faqs).omit({ id: true, createdAt: true, updatedAt: true });

// Recurring Giving Settings
export const recurringGivingSettings = pgTable("recurring_giving_settings", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull().default("Become a Monthly Sponsor"),
  description: text("description").notNull().default("₹500/month feeds a family of 4 for a week, every week, all year."),
  presetAmounts: json("preset_amounts").$type<number[]>().default([500, 1000, 2500, 5000]),
  ctaText: text("cta_text").notNull().default("Give Monthly"),
  backgroundImageUrl: text("background_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecurringGivingSetting = typeof recurringGivingSettings.$inferSelect;
export type InsertRecurringGivingSetting = typeof recurringGivingSettings.$inferInsert;
export const insertRecurringGivingSettingSchema = createInsertSchema(recurringGivingSettings).omit({ id: true, createdAt: true, updatedAt: true });

// Receipt settings table
export const receiptSettings = pgTable("receipt_settings", {
  id: serial("id").primaryKey(),
  orgName: text("org_name").notNull().default("ISKCON JUHU"),
  orgAddress: text("org_address").notNull().default("Hare Krishna Land, Juhu, Mumbai - 400049"),
  orgEmail: text("org_email").notNull().default("donations@iskconjuhu.in"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReceiptSettings = typeof receiptSettings.$inferSelect;
export type InsertReceiptSettings = typeof receiptSettings.$inferInsert;
export const insertReceiptSettingsSchema = createInsertSchema(receiptSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
