const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);



const dbx = new Dropbox({
  accessToken: process.env.DPX_TOKEN,
  fetch
});


router.get("/counts", async (req, res) => {
  try {
    const { count: usersCount, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) throw usersError;

    const { count: coursesCount, error: coursesError } = await supabase
      .from("UserCourses")
      .select("*", { count: "exact", head: true });

    if (coursesError) throw coursesError;

    const { count: ReviewCount, error: ReviewError } = await supabase
      .from("Users_FeedBack")
      .select("*", { count: "exact", head: true });

    if (ReviewError) throw ReviewError;

    res.json({
      usersCount,
      coursesCount,
      ReviewCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching counts", error: error.message });
  }
});

router.get("/get_courses", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("joined_courses_with_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching courses with users:", error.message);
      return res.status(500).json({ message: "Error fetching courses." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

router.get("/get_users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({ message: "Error fetching users." });
    }

    res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
});


router.post("/deleteUser/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: `User ${userId} deleted` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/updateUser/:id", async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, role } = req.body;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name, email, role })
      .eq("id", userId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: `User ${userId} updated` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/get_courses", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("joined_courses_with_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching courses with users:", error.message);
      return res.status(500).json({ message: "Error fetching courses." });
    }

    return res.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
});

router.post("/Admin_deleteCourse/:id", async (req, res) => {
   try {
      const userId = req.session.user?.id;
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
          .from("uploaded_materials")
          .select("id, dropbox_path")
          .in("id", fileIds);
  
        if (metaErr) {
          console.error("Error fetching PDF metadata:", metaErr);
          return res.status(500).json({ error: "Unable to fetch file metadata." });
        }
  
        for (const { dropbox_path } of pdfRows) {
          try {
            await dbx.filesDeleteV2({ path: dropbox_path });
          } catch (dropErr) {
            if (dropErr?.status === 409 && dropErr?.error?.error_summary?.startsWith("path_lookup/not_found")) {
              console.warn(`Dropbox file not found, skipping: ${dropbox_path}`);
            } else {
              console.error(`Dropbox delete error for ${dropbox_path}:`, dropErr);
            }
          }
        }
  
        const { error: pdfMsgErr } = await supabase
          .from("pdf_messages")
          .delete()
          .in("pdf_file_id", fileIds);
  
        if (pdfMsgErr) {
          console.error("Error deleting from pdf_messages:", pdfMsgErr);
          return res.status(500).json({ error: "Failed to delete related messages." });
        }
  
        const { error: deleteFilesErr } = await supabase
          .from("uploaded_materials")
          .delete()
          .in("id", fileIds);
  
        if (deleteFilesErr) {
          console.error("Error deleting uploaded_materials rows:", deleteFilesErr);
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
        .from("UserCourses")
        .delete()
        .match({ id: courseId });
  
      if (deleteCourseErr) {
        console.error("Error deleting course:", deleteCourseErr);
        return res.status(500).json({ error: "Failed to delete course." });
      }
  
      return res.status(200).json({ message: "Course and related files deleted successfully." });
  
    } catch (err) {
      console.error("Unexpected error:", err);
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal server error." });
      }
    }
});




router.post("/updateCourse/:id", async (req, res) => {
  const CourseId = req.params.id;
  const { name } = req.body;

  try {
    const { error } = await supabase
      .from("UserCourses")
      .update({ name })
      .eq("id", CourseId);

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.json({ success: true, message: `Course ${CourseId} updated` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
