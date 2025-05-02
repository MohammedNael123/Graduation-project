import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.entry";

// PDF.js worker setup
GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([worker], { type: "application/javascript" }));

const PdfWithGemini = () => {
  const location = useLocation();
  const rawUrl = location.state?.fileUrl;
  const fileUrl = rawUrl?.replace("dl=1", "raw=1");
  const proxyUrl = fileUrl
    ? `http://localhost:5000/api/pdf-proxy?url=${encodeURIComponent(fileUrl)}`
    : null;

  // Refs & state for PDF
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for AI response

  // 1️⃣ Load & parse PDF once
  useEffect(() => {
    if (!proxyUrl) return;
    setLoadingDoc(true);

    (async () => {
      try {
        const resp = await fetch(proxyUrl);
        const buf = await resp.arrayBuffer();
        const loadingTask = getDocument({ data: buf });
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [proxyUrl]);

  // 2️⃣ Render only the needed page
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf) return;
    setLoadingPage(true);

    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        const vp = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [pageNumber]);

  // Chat handler
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages((m) => [...m, { role: "user", content: input }]);

    // Set loading state to true while waiting for AI response
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/test-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, fileUrl }),
      });
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: "gemini", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "gemini", content: "❌ Failed to get a response." },
      ]);
    } finally {
      setIsLoading(false); // Set loading state to false once response is received
    }
    setInput("");
  };

  if (!fileUrl) {
    return (
      <div className="p-4 text-center text-red-600">
        No PDF URL provided.
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Chat panel (left) */}
      <div className="w-1/2 flex flex-col border-r border-gray-300 p-4 bg-gray-50">
        <h2 className="text-xl font-bold mb-4">Chat with Gemini</h2>
        <div className="flex-1 overflow-y-auto mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[80%] ${msg.role === "user"
                    ? "bg-indigo-100 text-right"
                    : "bg-gray-200 text-left"
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the document..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Send
          </button>
        </form>
        {isLoading && (
          <div className="mt-4 text-center text-gray-600">
            <p>typing...</p>
            <div className="animate-spin border-t-4 border-indigo-600 border-solid w-8 h-8 rounded-full mx-auto"></div>
          </div>
        )}
      </div>

      {/* PDF viewer (right) */}
      <div className="w-1/2 flex flex-col p-4">
        <h2 className="text-xl font-bold mb-4">Document Viewer</h2>
        {loadingDoc ? (
          <p>Loading document…</p>
        ) : (
          <>
            {loadingPage && <p>Rendering page…</p>}
            <canvas ref={canvasRef} className="border rounded shadow flex-1" />
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() =>
                  setPageNumber((p) => Math.min(p + 1, numPages))
                }
                disabled={pageNumber >= numPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PdfWithGemini;