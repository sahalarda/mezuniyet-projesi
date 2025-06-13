import axios from "axios";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import React, { ChangeEvent, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./uploadProject.css";
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: "AIzaSyAHTIBSG09Ftjxe_df-95qBdIZrse8u7bc",
});
// Set the worker source
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const UploadProject: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const { user } = useAuth();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setUploadStatus("Lütfen sadece PDF dosyası seçin.");
      setPdfFile(null);
    } else {
      setUploadStatus(""); // Clear previous messages
      setPdfFile(selectedFile || null);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    const fileBuffer = await file.arrayBuffer();
    const pdfDoc = await getDocument({ data: fileBuffer }).promise;

    let textContent = "";
    // if (pdfDoc.numPages < 2) {
    //   throw Error("PDF'in uygun formatta oldugundan emin olun.");
    // }
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((item: any) => item.str).join(" ");
      if (i === 1 && !/(?=.*ad)(?=.*soyad)(?=.*okul\s*no)/i.test(textContent)) {
        throw Error("PDF'in uygun formatta oldugundan emin olun.");
      }
      // if (i === 2 && !/(?=.*[iıİi][cç][iı]ndek[iı]ler)/i.test(textContent)) {
      //   throw Error("PDF'in uygun formatta oldugundan emin olun.");
      // }
    }

    setExtractedText(textContent); // Store extracted text
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      setUploadStatus("Lütfen bir dosya seçiniz.");
      return;
    }

    try {
      // await extractTextFromPDF(pdfFile);

      const summary = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            text: "Bu PDF dosyasını analiz et ve içeriği hakkında kısa bir özet sun. Ozeti olabildince uzun tut, ozet Turkce olmalı.",
          },
          {
            inlineData: {
              data: await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result?.toString().split(",")[1];
                  resolve(base64);
                };
                reader.readAsDataURL(pdfFile);
              }),
              mimeType: "application/pdf",
            },
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const formData = new FormData();
      formData.append("pdf", pdfFile);
      if (summary.text) {
        formData.append("summary", summary.text);
      }

      const response = await axios.post("/api/users/upload-pdf", formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus("Proje başarıyla yüklendi!");
      console.log("Response from server:", response.data);
    } catch (error: any) {
      setUploadStatus(
        `Yükleme başarısız: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setPdfFile(null); // Reset file input
    }
  };

  return (
    <div className="upload-container">
      <h2>Proje Yükle</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        aria-label="Dosya seçimi"
      />
      <button onClick={handleUpload} disabled={!pdfFile}>
        Yükle
      </button>
      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
      {extractedText && (
        <div className="extracted-text">
          <h3>Extracted Text:</h3>
          <pre>{extractedText}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadProject;
