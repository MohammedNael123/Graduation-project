const express = require("express");
const session = require("express-session");
const { createClient } = require("@supabase/supabase-js");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const dbx = new Dropbox({
  accessToken: process.env.DPX_TOKEN,
  fetch,
});
const cors = require('cors');


const router = express.Router();
router.use(cors({
    origin: ["https://darisni.netlify.app", "http://localhost:3000"],
    credentials: true
}));
router.use(express.json());
router.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

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

    return res.status(200).json({ message: "File deleted successfully." });

  } catch (err) {
    console.error("Unexpected error during file deletion:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});


module.exports = router;
