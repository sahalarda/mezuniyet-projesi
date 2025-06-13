import axios from "axios";
import { useEffect, useState } from "react";
import { FaDownload, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "./UploadedDocs.css";

interface UploadedDoc {
  _id: string;
  filename: string;
  path: string;
  uploadDate: string;
  summary?: string;
  score?: number;
  comment?: string;
  userId?: {
    name: string;
    surname: string;
    studentNumber: string;
  };
}

const UploadedDocs = () => {
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scores, setScores] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [selectedDocForScoring, setSelectedDocForScoring] = useState<UploadedDoc | null>(null);
  const [currentScoreInModal, setCurrentScoreInModal] = useState<string>('');
  const [currentCommentInModal, setCurrentCommentInModal] = useState<string>('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("/api/users/uploaded-docs");
        setDocuments(response.data);
        console.log("documents", response.data)
      } catch (error) {
        console.error("Error fetching documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    const initialScores: { [key: string]: string } = {};
    documents.forEach(doc => {
        initialScores[doc._id] = doc.score?.toString() || '';
    });
    setScores(initialScores);
  }, [documents]);

  useEffect(() => {
    const initialComments: { [key: string]: string } = {};
    documents.forEach(doc => {
        initialComments[doc._id] = doc.comment || '';
    });
    setComments(initialComments);
  }, [documents]);

  const handleDownload = async (doc: UploadedDoc) => {
    try {
      const response = await axios.get(`/api/users/download/${doc._id}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleShowSummary = (summary: string | undefined) => {
    if (summary) {
      setSelectedSummary(summary.replace('{"summary":', "").replace("}", ""));
      setIsModalOpen(true);
    } else {
      toast.info("Bu belge için özet bulunmamaktadır.");
    }
  };

  const handleOpenScoreModal = (doc: UploadedDoc) => {
    setSelectedDocForScoring(doc);
    setCurrentScoreInModal(scores[doc._id] || '');
    setCurrentCommentInModal(comments[doc._id] || '');
    setIsScoreModalOpen(true);
  };

  const handleCloseScoreModal = () => {
    setIsScoreModalOpen(false);
    setSelectedDocForScoring(null);
    setCurrentScoreInModal('');
    setCurrentCommentInModal('');
  };

  const handleSaveScoreAndComment = async () => {
    if (!selectedDocForScoring) return;

    const docId = selectedDocForScoring._id;
    const scoreValue = currentScoreInModal;
    const scoreNumber = parseFloat(scoreValue);

    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 100) {
        toast.error("Lütfen 0 ile 100 arasında geçerli bir not girin.");
        return;
    }

    try {
        await axios.patch(`/api/users/score/${docId}`, {
            score: scoreNumber,
            comment: currentCommentInModal,
        });

        setDocuments(prevDocs =>
            prevDocs.map(doc =>
                doc._id === docId ? { ...doc, score: scoreNumber, comment: currentCommentInModal } : doc
            )
        );
        setScores(prevScores => ({ ...prevScores, [docId]: scoreValue }));
        setComments(prevComments => ({ ...prevComments, [docId]: currentCommentInModal }));
        toast.success("Not ve yorum başarıyla kaydedildi!");
        handleCloseScoreModal();
    } catch (error) {
        console.error("Error saving score and comment:", error);
        toast.error("Not ve yorum kaydedilemedi.");
    }
  };

  if (loading) {
    return <div className="uploaded-docs-loading">Yükleniyor...</div>;
  }

  return (
    <div className="uploaded-docs-container">
      <h2>Yüklenen Belgeler</h2>
      {documents.length === 0 ? (
        <p className="no-docs">Henüz hiç belge yüklenmemiş.</p>
      ) : (
        <div className="uploaded-docs-table-container">
          <table className="uploaded-docs-table">
            <thead>
              <tr>
                <th>Belge Adı</th>
                <th>Yükleyen</th>
                <th>Öğrenci No</th>
                <th>Yükleme Tarihi</th>
                <th>Özet</th>
                <th>Not</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>
                    {
                      doc.filename.length > 25
                        ? `${doc.filename.substring(0, 22)}...`
                        : doc.filename
                    }
                  </td>
                  <td>{doc.userId ? `${doc.userId.name} ${doc.userId.surname}` : "Kullanıcı Silinmiş"}</td>
                  <td>{doc.userId ? doc.userId.studentNumber : "N/A"}</td>
                  <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="summary-btn"
                      onClick={() => handleShowSummary(doc.summary)}
                      disabled={!doc.summary}
                    >
                      <FaFileAlt /> Özeti Görüntüle
                    </button>
                  </td>
                  <td className="score-cell">
                    <div className="score-display">
                      {doc.score !== undefined && doc.score !== null && (
                        <span className="current-score">Not: {doc.score}</span>
                      )}
                      <button
                        className="score-action-btn"
                        onClick={() => handleOpenScoreModal(doc)}
                      >
                        {doc.score !== undefined && doc.score !== null ? 'Düzenle' : 'Not Ver'}
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(doc)}
                    >
                      <FaDownload /> İndir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h3>Belge Özeti</h3>
            <div className="modal-summary">{selectedSummary}</div>
          </div>
        </div>
      )}

      {/* Score and Comment Modal */}
      {isScoreModalOpen && selectedDocForScoring && (
        <div className="modal-overlay" onClick={handleCloseScoreModal}>
          <div className="modal-content score-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={handleCloseScoreModal}
            >
              ×
            </button>
            <h3>Not ve Yorum Ekle/Düzenle</h3>
            <div className="modal-body">
                <div className="document-info">
                    <p><strong>Belge:</strong> {selectedDocForScoring.filename}</p>
                    <p><strong>Öğrenci:</strong> {selectedDocForScoring.userId ? `${selectedDocForScoring.userId.name} ${selectedDocForScoring.userId.surname}` : "Kullanıcı Silinmiş"}</p>
                    <p><strong>Öğrenci No:</strong> {selectedDocForScoring.userId ? selectedDocForScoring.userId.studentNumber : "N/A"}</p>
                </div>
                <div className="form-group">
                    <label htmlFor="score-input-modal">Not (0-100):</label>
                    <input
                        id="score-input-modal"
                        type="number"
                        min="0"
                        max="100"
                        value={currentScoreInModal}
                        onChange={(e) => setCurrentScoreInModal(e.target.value)}
                        className="score-input-modal"
                        placeholder="Not (0-100)"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="comment-input-modal">Yorum:</label>
                    <textarea
                        id="comment-input-modal"
                        value={currentCommentInModal}
                        onChange={(e) => setCurrentCommentInModal(e.target.value)}
                        className="comment-textarea-modal"
                        placeholder="Yorumunuzu buraya yazın..."
                        rows={4}
                    />
                </div>
            </div>
            <div className="modal-actions">
                <button className="save-btn" onClick={handleSaveScoreAndComment}>
                    Kaydet
                </button>
                <button className="cancel-btn" onClick={handleCloseScoreModal}>
                    İptal
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedDocs;
