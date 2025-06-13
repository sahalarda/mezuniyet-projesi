import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import "./AuthLogs.css";

interface AuthLog {
  userId: string;
  email: string;
  action: string;
  timestamp: string;
  ipAddress: string;
}

const AuthLogsList: React.FC = () => {
  const [logs, setLogs] = useState<AuthLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/users/auth-logs");
      setLogs(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="auth-logs-loading">Kullanıcı girişleri yükleniyor...</div>;
  }

  if (error) {
    return <div className="auth-logs-error">Hata: {error}</div>;
  }

  return (
    <div className="auth-logs-container">
      <h2>Kullanıcı Giriş Kayıtları</h2>
      <div className="auth-logs-refresh">
        <button className="refresh-btn" onClick={fetchLogs}>
          <FiRefreshCw /> Yenile
        </button>
      </div>
      {logs.length === 0 ? (
        <div className="auth-logs-loading">Kayıt bulunamadı</div>
      ) : (
        <div className="auth-logs-table-container">
          <table className="auth-logs-table">
            <thead>
              <tr>
                <th>Kullanıcı ID</th>
                <th>E-posta</th>
                <th>İşlem</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`${log.userId}-${log.timestamp}`}>
                  <td>{log.userId}</td>
                  <td>{log.email}</td>
                  <td>{log.action}</td>
                  <td>{formatDate(log.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuthLogsList;
