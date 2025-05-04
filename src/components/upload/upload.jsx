import React , { useState } from "react";
import "./upload.css"; 

const Upload = () => {

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };


  return (
    <section className="upload">
      <div className="upload-content">
        <p className="upload-subheading">Upload your PDFs and let our AI-powered platform help you study smarter, faster, and more efficiently!</p>
     
        <div className="upload-box">
          <label htmlFor="file-upload" className="upload-label">
            Click to upload a PDF
            <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} />
          </label>
          {selectedFile && <p className="file-name">{selectedFile.name}</p>}
        </div>
        {selectedFile && (
          <div>
            <a href="/MyCourses" className="upload-cta-button">Continue</a>
          </div>
        )}
      </div>      
    </section>
  );
};

export default Upload;
