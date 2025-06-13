import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./StajForm.css";

const formCoordinates = {
  kisiselBilgiler: {
    adSoyad: { x1: 205, x2: 540 },
    kimlik: { x1: 205, x2: 522 },
    bolum: { x1: 205, x2: 505 },
    ogrenciNo: { x1: 205, x2: 490 },
    adres: { x1: 205, x2: 475 },
    telNo: { x1: 435, x2: 505 },
    eposta: { x1: 435, x2: 490 },
  },
  isYeriIletisimBilgileri: {
    adUnvan: { x1: 205, x2: 405 },
    adres: { x1: 205, x2: 385 },
    uretimHizmetAlani: { x1: 205, x2: 367 },
    telNo: { x1: 205, x2: 350 },
    eposta: { x1: 205, x2: 333 },
    stajBilgileri: {
      stajBaslamaTarihi: { x1: 205, x2: 315 },
      stajBitisTarihi: { x1: 350, x2: 315 },
      suresi: { x1: 490, x2: 315 },
    },
    faxNo: { x1: 425, x2: 350 },
    webAdresi: { x1: 425, x2: 333 },
  },
  isVerenYetkilisi: {
    adSoyad: { x1: 205, x2: 265 },
    unvan: { x1: 205, x2: 247 },
    eposta: { x1: 205, x2: 230 },
    tarih: { x1: 205, x2: 213 },
  },
};

const StajForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Kişisel Bilgiler
    adSoyad: `${user?.name || ""} ${user?.surname || ""}`.trim(),
    kimlik: "",
    bolum: "",
    ogrenciNo: user?.studentNumber || "",
    adres: "",
    telNo: "",
    eposta: user?.email ||  "",

    // İş Yeri İletişim Bilgileri
    isYeriAdUnvan: "",
    isYeriAdres: "",
    uretimHizmetAlani: "",
    isYeriTelNo: "",
    isYeriEposta: "",
    stajBaslamaTarihi: "",
    stajBitisTarihi: "",
    stajSuresi: "",
    isYeriFaxNo: "",
    isYeriWebAdresi: "",

    // İş Veren Yetkilisi
    isVerenAdSoyad: "",
    isVerenUnvan: "",
    isVerenEposta: "",
    tarih: "",
  });

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fillPdf = async () => {
    try {
      // Fetch the PDF template (you'll need to replace with your actual PDF path)
      const existingPdfBytes = await fetch("/form.pdf").then((res) => res.arrayBuffer());

      // Load the PDF document
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Embed a standard font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Get the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Function to draw text at specific coordinates
      const drawText = (text: string, x: number, y: number, size = 10) => {
        firstPage.drawText(text, {
          x,
          y,
          size,
          maxWidth: 340,
          lineHeight: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      };

      // Kişisel Bilgiler
      drawText(formData.adSoyad, formCoordinates.kisiselBilgiler.adSoyad.x1, formCoordinates.kisiselBilgiler.adSoyad.x2);
      drawText(formData.kimlik, formCoordinates.kisiselBilgiler.kimlik.x1, formCoordinates.kisiselBilgiler.kimlik.x2);
      drawText(formData.bolum, formCoordinates.kisiselBilgiler.bolum.x1, formCoordinates.kisiselBilgiler.bolum.x2);
      drawText(formData.ogrenciNo, formCoordinates.kisiselBilgiler.ogrenciNo.x1, formCoordinates.kisiselBilgiler.ogrenciNo.x2);
      drawText(formData.adres, formCoordinates.kisiselBilgiler.adres.x1, formCoordinates.kisiselBilgiler.adres.x2);
      drawText(formData.telNo, formCoordinates.kisiselBilgiler.telNo.x1, formCoordinates.kisiselBilgiler.telNo.x2);
      drawText(formData.eposta, formCoordinates.kisiselBilgiler.eposta.x1, formCoordinates.kisiselBilgiler.eposta.x2);

      // İş Yeri İletişim Bilgileri
      drawText(
        formData.isYeriAdUnvan,
        formCoordinates.isYeriIletisimBilgileri.adUnvan.x1,
        formCoordinates.isYeriIletisimBilgileri.adUnvan.x2
      );
      drawText(formData.isYeriAdres, formCoordinates.isYeriIletisimBilgileri.adres.x1, formCoordinates.isYeriIletisimBilgileri.adres.x2);
      drawText(
        formData.uretimHizmetAlani,
        formCoordinates.isYeriIletisimBilgileri.uretimHizmetAlani.x1,
        formCoordinates.isYeriIletisimBilgileri.uretimHizmetAlani.x2
      );
      drawText(formData.isYeriTelNo, formCoordinates.isYeriIletisimBilgileri.telNo.x1, formCoordinates.isYeriIletisimBilgileri.telNo.x2);
      drawText(formData.isYeriEposta, formCoordinates.isYeriIletisimBilgileri.eposta.x1, formCoordinates.isYeriIletisimBilgileri.eposta.x2);
      drawText(
        formData.stajBaslamaTarihi,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.stajBaslamaTarihi.x1,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.stajBaslamaTarihi.x2
      );
      drawText(
        formData.stajBitisTarihi,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.stajBitisTarihi.x1,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.stajBitisTarihi.x2
      );
      drawText(
        formData.stajSuresi,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.suresi.x1,
        formCoordinates.isYeriIletisimBilgileri.stajBilgileri.suresi.x2
      );
      drawText(formData.isYeriFaxNo, formCoordinates.isYeriIletisimBilgileri.faxNo.x1, formCoordinates.isYeriIletisimBilgileri.faxNo.x2);
      drawText(
        formData.isYeriWebAdresi,
        formCoordinates.isYeriIletisimBilgileri.webAdresi.x1,
        formCoordinates.isYeriIletisimBilgileri.webAdresi.x2
      );

      // İş Veren Yetkilisi
      drawText(formData.isVerenAdSoyad, formCoordinates.isVerenYetkilisi.adSoyad.x1, formCoordinates.isVerenYetkilisi.adSoyad.x2);
      drawText(formData.isVerenUnvan, formCoordinates.isVerenYetkilisi.unvan.x1, formCoordinates.isVerenYetkilisi.unvan.x2);
      drawText(formData.isVerenEposta, formCoordinates.isVerenYetkilisi.eposta.x1, formCoordinates.isVerenYetkilisi.eposta.x2);
      drawText(formData.tarih, formCoordinates.isVerenYetkilisi.tarih.x1, formCoordinates.isVerenYetkilisi.tarih.x2);

      // Serialize the PDFDocument to bytes
      const pdfBytes = await pdfDoc.save();

      // Create a blob and download link
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error filling PDF:", error);
      alert("Failed to fill PDF. Please check the console for details.");
    }
  };

  return (
    <div className="staj-form-container">
      <style>{`
        /* Previous CSS styles from the last example */
      `}</style>

      <div className="form-header">
        <h2>Kapsamlı Staj Başvuru Formu</h2>
      </div>

      {/* Personal Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">Kişisel Bilgiler</h3>
        <div className="form-grid">
          <div className="form-input-group">
            <label htmlFor="adSoyad">Ad Soyad</label>
            <input
              type="text"
              id="adSoyad"
              name="adSoyad"
              className="form-input"
              value={formData.adSoyad}
              onChange={handleInputChange}
              placeholder="Ad ve Soyadınızı girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="kimlik">Kimlik No</label>
            <input
              type="text"
              id="kimlik"
              name="kimlik"
              className="form-input"
              value={formData.kimlik}
              onChange={handleInputChange}
              placeholder="Kimlik numaranızı girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="bolum">Bölüm</label>
            <input
              type="text"
              id="bolum"
              name="bolum"
              className="form-input"
              value={formData.bolum}
              onChange={handleInputChange}
              placeholder="Bölümünüzü girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="ogrenciNo">Öğrenci Numarası</label>
            <input
              type="text"
              id="ogrenciNo"
              name="ogrenciNo"
              className="form-input"
              value={formData.ogrenciNo}
              onChange={handleInputChange}
              placeholder="Öğrenci numaranızı girin"
            />
          </div>

          <div className="form-input-group full-width">
            <label htmlFor="adres">Adres</label>
            <input
              type="text"
              id="adres"
              name="adres"
              className="form-input"
              value={formData.adres}
              onChange={handleInputChange}
              placeholder="Tam adresinizi girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="telNo">Telefon Numarası</label>
            <input
              type="tel"
              id="telNo"
              name="telNo"
              className="form-input"
              value={formData.telNo}
              onChange={handleInputChange}
              placeholder="Telefon numaranızı girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="eposta">E-posta</label>
            <input
              type="email"
              id="eposta"
              name="eposta"
              className="form-input"
              value={formData.eposta}
              onChange={handleInputChange}
              placeholder="E-posta adresinizi girin"
            />
          </div>
        </div>
      </div>

      {/* Workplace Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">İş Yeri Bilgileri</h3>
        <div className="form-grid">
          <div className="form-input-group full-width">
            <label htmlFor="isYeriAdUnvan">İş Yeri Adı/Ünvanı</label>
            <input
              type="text"
              id="isYeriAdUnvan"
              name="isYeriAdUnvan"
              className="form-input"
              value={formData.isYeriAdUnvan}
              onChange={handleInputChange}
              placeholder="İş yeri adını girin"
            />
          </div>

          <div className="form-input-group full-width">
            <label htmlFor="isYeriAdres">İş Yeri Adresi</label>
            <input
              type="text"
              id="isYeriAdres"
              name="isYeriAdres"
              className="form-input"
              value={formData.isYeriAdres}
              onChange={handleInputChange}
              placeholder="İş yeri adresini girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="uretimHizmetAlani">Üretim/Hizmet Alanı</label>
            <input
              type="text"
              id="uretimHizmetAlani"
              name="uretimHizmetAlani"
              className="form-input"
              value={formData.uretimHizmetAlani}
              onChange={handleInputChange}
              placeholder="Üretim veya hizmet alanını girin"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isYeriTelNo">İş Yeri Telefon</label>
            <input
              type="tel"
              id="isYeriTelNo"
              name="isYeriTelNo"
              className="form-input"
              value={formData.isYeriTelNo}
              onChange={handleInputChange}
              placeholder="İş yeri telefon numarası"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isYeriEposta">İş Yeri E-posta</label>
            <input
              type="email"
              id="isYeriEposta"
              name="isYeriEposta"
              className="form-input"
              value={formData.isYeriEposta}
              onChange={handleInputChange}
              placeholder="İş yeri e-postası"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isYeriFaxNo">İş Yeri Fax No</label>
            <input
              type="tel"
              id="isYeriFaxNo"
              name="isYeriFaxNo"
              className="form-input"
              value={formData.isYeriFaxNo}
              onChange={handleInputChange}
              placeholder="İş yeri fax numarası"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isYeriWebAdresi">Web Adresi</label>
            <input
              type="url"
              id="isYeriWebAdresi"
              name="isYeriWebAdresi"
              className="form-input"
              value={formData.isYeriWebAdresi}
              onChange={handleInputChange}
              placeholder="İş yeri web adresi"
            />
          </div>
        </div>
      </div>

      {/* Internship Details Section */}
      <div className="form-section">
        <h3 className="form-section-title">Staj Bilgileri</h3>
        <div className="form-grid">
          <div className="form-input-group">
            <label htmlFor="stajBaslamaTarihi">Staj Başlama Tarihi</label>
            <input
              type="date"
              id="stajBaslamaTarihi"
              name="stajBaslamaTarihi"
              className="form-input"
              value={formData.stajBaslamaTarihi}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="stajBitisTarihi">Staj Bitiş Tarihi</label>
            <input
              type="date"
              id="stajBitisTarihi"
              name="stajBitisTarihi"
              className="form-input"
              value={formData.stajBitisTarihi}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="stajSuresi">Staj Süresi (Gün)</label>
            <input
              type="number"
              id="stajSuresi"
              name="stajSuresi"
              className="form-input"
              value={formData.stajSuresi}
              onChange={handleInputChange}
              placeholder="Staj süresini girin"
            />
          </div>
        </div>
      </div>

      {/* Employer Authority Section */}
      <div className="form-section">
        <h3 className="form-section-title">İş Veren Yetkilisi</h3>
        <div className="form-grid">
          <div className="form-input-group">
            <label htmlFor="isVerenAdSoyad">Ad Soyad</label>
            <input
              type="text"
              id="isVerenAdSoyad"
              name="isVerenAdSoyad"
              className="form-input"
              value={formData.isVerenAdSoyad}
              onChange={handleInputChange}
              placeholder="İş veren yetkilisinin adı soyadı"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isVerenUnvan">Ünvan</label>
            <input
              type="text"
              id="isVerenUnvan"
              name="isVerenUnvan"
              className="form-input"
              value={formData.isVerenUnvan}
              onChange={handleInputChange}
              placeholder="İş veren yetkilisinin ünvanı"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="isVerenEposta">E-posta</label>
            <input
              type="email"
              id="isVerenEposta"
              name="isVerenEposta"
              className="form-input"
              value={formData.isVerenEposta}
              onChange={handleInputChange}
              placeholder="İş veren yetkilisinin e-postası"
            />
          </div>

          <div className="form-input-group">
            <label htmlFor="tarih">Tarih</label>
            <input type="date" id="tarih" name="tarih" className="form-input" value={formData.tarih} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-submit" onClick={fillPdf}>
          Formu Doldur
        </button>
      </div>

      {pdfUrl && (
        <div className="pdf-preview">
          <h3>PDF Formunuz Oluşturuldu</h3>
          <p>Oluşturulan PDF formunu indirmek için aşağıdaki butonu kullanabilirsiniz.</p>
          <a
            href={pdfUrl}
            download="staj_formu.pdf"
            className="pdf-download-link"
          >
            İndir
          </a>
          <div style={{ marginTop: "1.5rem" }}>
            <iframe 
              src={pdfUrl} 
              width="100%" 
              height="500px" 
              style={{ border: "1px solid var(--border-color)", borderRadius: "0.5rem" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StajForm;
