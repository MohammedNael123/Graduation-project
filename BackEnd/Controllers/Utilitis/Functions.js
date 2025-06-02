const express = require("express");
const Dropbox = require("dropbox");
const fs = require("fs");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const dpx_token = process.env.DPX_TOKEN;

const dpx = new Dropbox.Dropbox({accessToken: dpx_token,
    fetch:fetch
});

async function isTokenValid(){
    try{
        await dpx.usersGetCurrentAccount();
        console.info("Token is Valid 👌");
        return true;
    }   catch(err){
        if(err.status === 401){
            console.error("invalid or expired token ❌");
            return false;
        }
        throw err;
    } 
}

isTokenValid();

const uploadfiledpx = async (courseId, file) => {
  try {
   const fileContent = await fs.promises.readFile(file.path); 

    const original = file.originalname;
    const nameOnly = path.parse(original).name;
    const fileExt = path.extname(file.originalname); 
    const uniqueFileName = Date.now().toString() + "(" + nameOnly + ")" + fileExt;

    const validatingToken = await isTokenValid();
    if (!validatingToken) {
      console.error("Can't use Dropbox, the token is expired ❌");
      return false;
    }

    const uploadRes = await dpx.filesUpload({
      path: `/JABER/Darsni_web/${uniqueFileName}`,
      contents: fileContent
    });

    const sharedlinkres = await dpx.sharingCreateSharedLinkWithSettings({
      path: uploadRes.result.path_display
    });

    let sharedlink = sharedlinkres.result.url;
    sharedlink = sharedlink.slice(0, -1) + "1"; // Make link directly downloadable

    const { data, error } = await supabase
      .from("uploaded_materials")
      .insert({
        file_url: sharedlink,
        dropbox_path: `/JABER/Darsni_web/${uniqueFileName}`
      })
      .select("id");

    if (error) {
      console.error("Error inserting into uploaded_materials:", error);
      return false;
    }

    const { error: errorweek } = await supabase
      .from("weak_courses_pdf_files")
      .insert({
        pdf_file_id: data[0].id,
        courses_id: courseId
      });

    if (errorweek) {
      console.error("Error inserting into weak_courses_pdf_files:", errorweek);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error during upload ❌", err);
    return false;
  }
};


const createCourses = async (name,userId)=>{
    try{
        console.error("name : ",name);
        const validatingToken = await isTokenValid();
        if(!validatingToken){
           throw new Error("not valid token ❌");
        }

        const { data , error } = await supabase.from("UserCourses")
        .insert({name:name})
        .select();

        if(error || !data){
            console.error("Error when trying to insert a new course in supabase!");
            return false;
        }

        await supabase.from("weak_profiles_courses").insert({
            user_id: userId,
            course_id: data[0].id
        });

        if(error){
            console.error("Error while inserting!");
            return false;
        }

        const courseId = data[0].id;
        return courseId;

    }catch(error){
        console.error("Error creating the Course",error)
        return false;
    }
};

const SaveMessages = async (input, aiMessage, fileId) => {
  try {
    const { data: userMessage, error: errorUserMessage } = await supabase
      .from("messages")
      .insert({ message_text: input, sender: "user" })
      .select()
      .single();

    if (errorUserMessage) {
      console.error("Error inserting user message:", errorUserMessage.message);
      return false;
    }

    const { data: aiMessageData, error: errorAiMessage } = await supabase
      .from("messages")
      .insert({ message_text: aiMessage, sender: "ai" })
      .select()
      .single();

    if (errorAiMessage) {
      console.error("Error inserting AI message:", errorAiMessage.message);
      return false;
    }

    const { error: fileUserMessageError } = await supabase
      .from("pdf_messages")
      .insert({ pdf_file_id: fileId, message_id: userMessage.id });

    if (fileUserMessageError) {
      console.error("Error linking user message to file:", fileUserMessageError.message);
      return false;
    }

    const { error: fileAiMessageError } = await supabase
      .from("pdf_messages")
      .insert({ pdf_file_id: fileId, message_id: aiMessageData.id });

    if (fileAiMessageError) {
      console.error("Error linking AI message to file:", fileAiMessageError.message);
      return false;
    }

    return true;

  } catch (error) {
    console.error("Unexpected error while saving messages:", error);
    return false;
  }
};


module.exports = {
    uploadfiledpx,
    createCourses,
    SaveMessages,
    isTokenValid
}