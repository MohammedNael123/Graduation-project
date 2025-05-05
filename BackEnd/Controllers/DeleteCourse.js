const express = require("express");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const { Dropbox } = require("dropbox");        
const fetch = require("node-fetch");     

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const dbx       = new Dropbox({
  accessToken: process.env.DPX_TOKEN,
  fetch
});

const router = express.Router();
router.use(express.json());
router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

router.post("/deleteCourse/:courseId", async (req, res) => {
  try {
    const userId   = req.session.user?.id;
    const courseId = req.params.courseId;
    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing user or course ID." });
    }

    
    const { data: filesMeta, error: fetchErr } = await supabase
      .from("weak_courses_pdf_files")
      .select("pdf_file_id")
      .eq("courses_id", courseId);

    if (fetchErr) {
      console.error("Error fetching course files:", fetchErr);
      return res.status(500).json({ error: "Unable to fetch course files." });
    }

    const fileIds = filesMeta.map(f => f.pdf_file_id);
    if (fileIds.length > 0) {
      
      const { data: pdfRows, error: metaErr } = await supabase
        .from("pdf_files")
        .select("id, dropbox_path")
        .in("id", fileIds);

      if (metaErr) {
        console.error("Error fetching PDF metadata:", metaErr);
        return res.status(500).json({ error: "Unable to fetch file metadata." });
      }

     console.log("deleted successfuly");
      for (const { dropbox_path } of pdfRows) {
        try {
          await dbx.filesDeleteV2({ path: dropbox_path });
          
        } catch (dropErr) {
          console.error(`Failed to delete ${dropbox_path} on Dropbox:`, dropErr);
        }
      }

      const { error: deleteFilesErr } = await supabase
        .from("pdf_files")
        .delete()
        .in("id", fileIds);

      if (deleteFilesErr) {
        console.error("Error deleting pdf_files rows:", deleteFilesErr);
        return res.status(500).json({ error: "Failed to delete PDF entries." });
      }
    }

    const { error: unlinkErr } = await supabase
      .from("weak_profiles_courses")
      .delete()
      .match({ user_id: userId, course_id: courseId });

    if (unlinkErr) {
      console.error("Error unlinking course from user:", unlinkErr);
      return res.status(500).json({ error: "Failed to unlink course from your profile." });
    }

    const { error: deleteCourseErr } = await supabase
      .from("courses")
      .delete()
      .match({ id: courseId });

    if (deleteCourseErr) {
      console.error("Error deleting course:", deleteCourseErr);
      return res.status(500).json({ error: "Failed to delete course." });
    }

    return res.status(200).json({ message: "Course (and its PDFs) deleted successfully." });

  } catch (err) {
    console.error("Unexpected error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
});

module.exports = router;
