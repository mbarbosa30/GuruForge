import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { createExport, getTrainingStats, getExportContent, type ExportFormat } from "../lib/trainingExporter";

const router = Router();

function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (req.dbUserRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

router.post("/admin/training-export", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { format, filters } = req.body;

    const validFormats: ExportFormat[] = ["instruction_pairs", "preference_pairs", "knowledge_distillation"];
    if (!format || !validFormats.includes(format)) {
      return res.status(400).json({ error: "Invalid format. Must be one of: " + validFormats.join(", ") });
    }

    const result = await createExport(format, filters || {}, req.dbUserId);
    res.json({ exportId: result.exportId, status: "processing" });
  } catch (err) {
    console.error("Training export error:", err);
    res.status(500).json({ error: "Failed to start export" });
  }
});

router.get("/admin/training-stats", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const guruId = req.query.guruId ? Number(req.query.guruId) : undefined;
    const stats = await getTrainingStats(guruId);
    res.json(stats);
  } catch (err) {
    console.error("Training stats error:", err);
    res.status(500).json({ error: "Failed to fetch training stats" });
  }
});

router.get("/admin/training-export/:id/download", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const exportId = Number(req.params.id);
    if (isNaN(exportId)) return res.status(400).json({ error: "Invalid export ID" });

    const result = await getExportContent(exportId);
    if (!result) return res.status(404).json({ error: "Export not found" });
    if (result.status !== "completed") return res.status(400).json({ error: `Export status: ${result.status}` });
    if (!result.content) return res.status(404).json({ error: "Export content not available" });

    res.setHeader("Content-Type", "application/jsonl");
    res.setHeader("Content-Disposition", `attachment; filename="export-${exportId}-${result.format}.jsonl"`);
    res.send(result.content);
  } catch (err) {
    console.error("Training export download error:", err);
    res.status(500).json({ error: "Failed to download export" });
  }
});

export default router;
