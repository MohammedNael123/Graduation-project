import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.entry";
import { FiSend, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";

GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([worker], { type: "application/javascript" }));

const PdfWithGemini = () => {
  const location = useLocation();
  const fileId = location.state?.fileId;
  const rawUrl = location.state?.fileUrl;
  const fileUrl = rawUrl?.replace("dl=1", "raw=1");
  const proxyUrl = fileUrl
    ? `https://graduation-project-c7pi.onrender.com/api/file-proxy?url=${encodeURIComponent(fileUrl)}`
    : null;

  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        console.error("Error loading file:", err);
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [proxyUrl]);

  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || !containerRef.current) return;
    setLoadingPage(true);

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        const canvas = canvasRef.current;
        const container = containerRef.current;

        const containerWidth = container.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(containerWidth / viewport.width, 1);
        const scaledViewport = page.getViewport({ scale });

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const ctx = canvas.getContext("2d");
        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport
        }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      } finally {
        setLoadingPage(false);
      }
    };

    renderPage();
  }, [pageNumber, numPages]);

 useEffect(() => {
  if (!fileId) return;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://graduation-project-c7pi.onrender.com/getMessages?file=${fileId}`, {
        withCredentials: true,
      });

      const data = res.data;

      if (Array.isArray(data)) {
        const formatted = data.map((m) => ({
          role: m.sender === "user" ? "user" : "gemini",  // بناءً على sender
          content: m.message,
        }));
        setMessages(formatted);
      } else {
        console.warn("Unexpected response:", data);
      }
    } catch (error) {
      console.error("Failed to fetch saved messages:", error);
    }
  };

  fetchMessages();
}, [fileId]);




  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((m) => [...m, { role: "user", content: input }]);
    setIsLoading(true);

    setInput("");


    try {
      const res = await fetch("https://graduation-project-c7pi.onrender.com/api/test-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, fileUrl, fileId, pageNumber }),
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
      setIsLoading(false);
    }
    setInput("");
  };


  if (!fileUrl) {
    return (
      <div className="p-4 text-center text-red-600 bg-white rounded-xl max-w-md mx-auto mt-8">
        No PDF URL provided.
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[36.6rem] bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* PDF Viewer Section */}
      <div className="w-full md:w-1/2 flex flex-col p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 flex flex-col">
          {loadingDoc ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="relative flex-1" ref={containerRef}>
              {loadingPage && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              <div className="flex justify-center h-full overflow-auto">
                <canvas
                  ref={canvasRef}
                  className="max-w-full h-auto shadow-sm rounded-lg border border-gray-100"
                />
              </div>

              {/* Page Navigation */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
                <button
                  onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-600 disabled:opacity-50"
                >
                  <FiChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
                  disabled={pageNumber >= numPages}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-600 disabled:opacity-50"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-full md:w-1/2 flex flex-col bg-white rounded-2xl shadow-lg m-4">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Document Assistant
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50 text-gray-800 border border-gray-100"
                  } transition-all duration-200 shadow-sm hover:shadow-md`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-gray-50 text-gray-800 rounded-2xl p-3 max-w-[85%] shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="relative">
            <input
              type="text"
              id="txtinput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the document..."
              className="w-full pl-4 pr-12 py-3 border-0 ring-1 ring-gray-200 rounded-xl
                focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all
                bg-gray-50 placeholder-gray-400 text-gray-800"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white
                rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <FiSend size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PdfWithGemini;