import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import "./AdminUserList.css"; // We'll create this CSS file next

interface User {
  _id: string;
  name: string;
  surname: string;
  studentNumber?: string;
  role: string;
  isVerified: boolean;
  email?: string; // Added to handle potential email field for admin/teacher
}

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get("/api/users/all");
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error("Kullanıcılar getirilirken hata:", err);
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          toast.error("Yasak: Bu kaynağa erişim izniniz yok.");
          setError("Yasak: Bu kaynağa erişim izniniz yok.");
        } else {
          toast.error("Kullanıcılar getirilemedi.");
          setError("Kullanıcılar getirilemedi. Lütfen daha sonra tekrar deneyin.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`/api/users/${userToDelete._id}`);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userToDelete._id));
      toast.success(`${userToDelete.name} ${userToDelete.surname} kullanıcısı silindi.`);
      closeDeleteModal();
    } catch (err) {
      console.error("Kullanıcı silinirken hata:", err);
      toast.error("Kullanıcı silinemedi. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return <div className="loading-container">Kullanıcılar yükleniyor...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  const getRoleInTurkish = (role: string) => {
    switch (role.toLowerCase()) {
      case 'student':
        return 'Öğrenci';
      case 'teacher':
        return 'Öğretmen';
      case 'admin':
        return 'Yönetici';
      default:
        return role;
    }
  };

  return (
    <div className="admin-user-list-container">
      <h2>Tüm Kullanıcılar</h2>
      {users.length === 0 ? (
        <p>Kullanıcı bulunamadı.</p>
      ) : (
        <div className="uploaded-docs-table-container">
          <table className="uploaded-docs-table">
            <thead>
              <tr>
                <th>Ad</th>
                <th>Soyad</th>
                <th>Öğrenci No/E-posta</th>
                <th>Rol</th>
                <th>Doğrulanmış</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.surname}</td>
                  <td>{user.studentNumber || user.email || "Yok"}</td>
                  <td>{getRoleInTurkish(user.role)}</td>
                  <td>{user.isVerified ? "Evet" : "Hayır"}</td>
                  <td>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteClick(user)}
                    >
                      <FaTrash /> Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeDeleteModal}>×</button>
            <h3>Silme İşlemini Onayla</h3>
            <div className="modal-body">
              <p>Bu kullanıcıyı silmek istediğinizden emin misiniz?</p>
              <div className="user-info">
                <p><strong>Ad Soyad:</strong> {userToDelete.name} {userToDelete.surname}</p>
                <p><strong>Rol:</strong> {getRoleInTurkish(userToDelete.role)}</p>
                <p><strong>{userToDelete.studentNumber ? "Öğrenci No" : "E-posta"}:</strong> {userToDelete.studentNumber || userToDelete.email}</p>
              </div>
              <div className="warning-message">
                <p>Bu işlem geri alınamaz.</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Sil
              </button>
              <button className="cancel-btn" onClick={closeDeleteModal}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList; 