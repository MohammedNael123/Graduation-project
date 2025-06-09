const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const dbx = new Dropbox({
  accessToken: process.env.DPX_TOKEN,
  fetch,
});

const router = express.Router();
router.use(express.json());



router.delete("/deleteFile/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    if (!fileId) {
      return res.status(400).json({ error: "Missing file ID." });
    }

    const { data: fileMeta, error: fetchErr } = await supabase
      .from("uploaded_materials")
      .select("dropbox_path")
      .eq("id", fileId)
      .single();

    if (fetchErr || !fileMeta) {
      return res.status(404).json({ error: "File not found." });
    }

    const { data: courseFiles, error: courseFetchErr } = await supabase
      .from("weak_courses_pdf_files") 
      .select("course_id")
      .eq("pdf_file_id", fileId);

    if (courseFetchErr) {
      console.error("Error fetching course associations:", courseFetchErr);
    }

    try {
      await dbx.filesDeleteV2({ path: fileMeta.dropbox_path });
    } catch (dropErr) {
      if (dropErr?.status === 409 && dropErr?.error?.error_summary?.startsWith("path_lookup/not_found")) {
        console.warn(`Dropbox file not found, skipping delete: ${fileMeta.dropbox_path}`);
      } else {
        console.error("Dropbox delete error:", dropErr);
        return res.status(500).json({ error: "Failed to delete file from Dropbox." });
      }
    }

    const { error: pdfMsgErr } = await supabase
      .from("pdf_messages")
      .delete()
      .eq("pdf_file_id", fileId);

    if (pdfMsgErr) {
      console.error("Error deleting from pdf_messages:", pdfMsgErr);
      return res.status(500).json({ error: "Failed to delete related messages." });
    }

    const { error: deleteFileErr } = await supabase
      .from("uploaded_materials")
      .delete()
      .eq("id", fileId);

    if (deleteFileErr) {
      console.error("Error deleting uploaded file:", deleteFileErr);
      return res.status(500).json({ error: "Failed to delete file." });
    }

    if (courseFiles && courseFiles.length > 0) {
      for (const { course_id } of courseFiles) {
        await supabase
          .from("weak_courses_pdf_files")
          .delete()
          .eq("pdf_file_id", fileId)
          .eq("course_id", course_id);

        const { count, error: countError } = await supabase
          .from("weak_courses_pdf_files")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course_id);

        if (countError) {
          console.error("Error counting course files:", countError);
          continue;
        }

        if (count === 0) {
          const { error: courseDelError } = await supabase
            .from("UserCourses")
            .delete()
            .eq("id", course_id);

          if (courseDelError) {
            console.error("Error deleting course:", courseDelError);
          } else {
            console.log(`Deleted empty course: ${course_id}`);
          }
        }
      }
    }

    return res.status(200).json({ message: "File deleted successfully." });

  } catch (err) {
    console.error("Unexpected error during file deletion:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
