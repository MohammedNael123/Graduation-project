const express = require("express");
const Dropbox = require("dropbox");
const fs = require("fs");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const dpx_token = process.env.dpx_TOKEN;

const dpx = new Dropbox.Dropbox({ accessToken: dpx_token, fetch: fetch });

async function isTokenValid() {
  try {
    await dpx.usersGetCurrentAccount();
    console.log("Token is Valid 👌");
    return true;
  } catch (err) {
    if (err.status === 401) {
      console.error("invalid or expired token ❌");
      return false;
    }
    throw err;
  }
}

isTokenValid();

const uploadfiledpx = async (courseId, file) => {
  console.log("the uploadfiledpx got request! file : ", file.path);
  fs.readFile(file.path, async (err, fileContent) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ error: "Error reading file" });
    }
    const original = file.originalname;
    const nameOnly = path.parse(original).name;
    const fileExt = path.extname(file.originalname);
    let uniqueFileName = Date.now().toString() + "(" + nameOnly + ")" + fileExt;
    const validatingToken = await isTokenValid();
    if (!validatingToken) {
      console.log("cant use dropbox the token is expired ❌");
      return false;
    }

    try {
      await dpx
        .filesUpload({
          path: `/JABER/Darsni_web/${uniqueFileName}`,
          contents: fileContent,
        })
        .then((res) => {
          console.log("file uploaded to the dropbox !");
          console.log("file path : ", file.path);
          return dpx.sharingCreateSharedLinkWithSettings({
            path: res.result.path_display,
          });
        })
        .then(async (sharedlinkres) => {
          let sharedlink = sharedlinkres.result.url.toString();
          sharedlink = sharedlink.slice(0, -1) + "1";
          const { data, error } = await supabase
            .from("pdf_files")
            .insert({
              file_url: sharedlink,
              dropbox_path: `/JABER/Darsni_web/${uniqueFileName}`,
            })
            .select("id");
          if (error) {
            console.log("error : ", error);
          }

          const { data: intoweek, error: errorweek } = await supabase
            .from("weak_courses_pdf_files")
            .insert({
              pdf_file_id: data[0].id,
              courses_id: courseId,
            });
          if (errorweek) {
            console.log(
              "error while inserting into week_pdf_course",
              errorweek
            );
          }
          console.log("shared link : ", sharedlink, data[0].id);
        });
      return true;
    } catch (err) {
      console.log("error uploading ❌", err);
    }
  });
};

const createCourses = async (name, userId) => {
  try {
    console.log("name : ", name);
    const validatingToken = await isTokenValid();
    if (!validatingToken) {
      throw new Error("not valid token ❌");
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({ name: name })
      .select();

    if (error || !data) {
      console.log("Error when trying to insert a new course in supabase!");
      return false;
    }

    await supabase.from("weak_profiles_courses").insert({
      user_id: userId,
      course_id: data[0].id,
    });

    if (error) {
      console.log("Error while inserting!");
      return false;
    }

    const courseId = data[0].id;
    return courseId;
  } catch (error) {
    console.error("Error creating the Course", error);
    return false;
  }
};

module.exports = {
  uploadfiledpx,
  createCourses,
};
=======
const dpx_token = process.env.DPX_TOKEN;
const dpx = new Dropbox.Dropbox({accessToken: dpx_token,
    fetch:fetch
});

//Function to upload a file to dropbox and get its url
const uploadfiledpx = async (courseId,file , res)=>{
    console.log("the uploadfiledpx got request! file : ",file.path);
     fs.readFile(file.path, async (err, fileContent) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Error reading file" });
        }
        let uniqueFileName = Date.now().toString();
    const fileExt = path.extname(file.originalname); 
    uniqueFileName += fileExt; 
    await dpx.filesUpload({
        path:`/JABER/Darsni_web/${uniqueFileName}`,
        contents:fileContent
    }).then(res=>{
        console.log("file uploaded to the dropbox !");
        console.log("file path : ",file.path);
        return dpx.sharingCreateSharedLinkWithSettings({path:res.result.path_display});

    }).then( async (sharedlinkres)=>{

        let sharedlink = sharedlinkres.result.url.toString();
        sharedlink = sharedlink.slice(0,-1)+"1";
        const {data , error } = await supabase.from("pdf_files").insert({"file_url":sharedlink}).select("id");
        if(error){
            console.log("error : ",error)
        }

        const {data : intoweek , error : errorweek } = await supabase
        .from("weak_courses_pdf_files")
        .insert({
            pdf_file_id: data[0].id,
            courses_id: courseId
        });
        if(errorweek){
            console.log("error while inserting into week_pdf_course",errorweek);
        }
        console.log("shared link : " , sharedlink,data[0].id);
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log("File deleted successfully");
        } else {
            console.warn("File already deleted or not found:", file.path);
        }
        
    })
    });
    return true;
};

//Function to add the course id and user id to the week table

//Function to create a course
const createCourses = async (name,userId)=>{
    console.log("the name of course and userid : ",name + userId);
    console.log("createCourese Function is activated!");
    try{
        console.log("name : ",name);
        const { data , error } = await supabase.from("courses")
        .insert({name:name})
        .select();
        console.log(data);
        console.log("11",data);
        if(error || !data){
            console.log("Error when trying to insert a new course in supabase!");
            return false;
        }
        console.log("the info in create func : ",userId,name,data[0].id)
        await supabase.from("weak_profiles_courses").insert({
            user_id: userId,
            course_id: data[0].id
        });
        if(error){
            console.log("Error while inserting!");
            return false;
        }
        console.log("successfuly ! and the name is : ",name," and id : ",data[0].id);
        const courseId = data[0].id;
        return courseId;
    }catch(error){
        console.error("Error creating the Course",error)
        return false;
    }
};

//const get_user_id
const getUserData = ()=>{
    console.log("the user in profiles api is : ",req.session.user)
    if (!req.session.user) {
        console.log("Not Logged in!");
        return res.json({ message: "NOT logged in!" });
    }
    console.log("The user is:", req.session.user);
    console.log("the name : ",req.session.user.name)
    return res.json({
      email : req.session.user.email,
      name : req.session.user.name
    });
}

module.exports = {
    uploadfiledpx,
    createCourses
}
