import { useEffect, useMemo, useState, type FormEvent } from "react";
import Hero from "./Hero-Panel";
import Achievements from "./Achievement";
import Contact from "./Contact";
import Footer from "./ui/Footer";

const ADMIN_TOKEN_KEY = "homecare-admin-token";
const SECTION_KEYS = ["hero", "about", "contact", "footer"];

interface PricingFormState {
  category: string;
  title: string;
  description: string;
  image: string;
  duration: number | string;
  price: number | string;
  recommended: boolean;
}

const emptyPricingForm = (): PricingFormState => ({
  category: "Perawatan Kehamilan",
  title: "",
  description: "",
  image: "",
  duration: 60,
  price: 100000,
  recommended: false,
});

const defaultSections = {
  hero: {
    title: "Kenyamanan Perawatan Medis di Rumah Anda",
    description:
      "Menghadirkan tenaga profesional medis berpengalaman untuk merawat orang terkasih dengan penuh kasih sayang dan kenyamanan maksimal.",
    image: "/Person.jpg",
    badge: "Dipercaya 1000+ keluarga",
    cta_label: "Konsultasi Gratis",
    cta_link: "#contact",
    secondary_cta_label: "Lihat Layanan",
    secondary_cta_link: "#services",
  },
  about: {
    title: "Homecare modern untuk kebutuhan kesehatan keluarga",
    description:
      "Tim kami terlatih dan berpengalaman dalam memberikan perawatan terbaik untuk lansia, ibu hamil, dan pasien pemulihan dengan sentuhan personal.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmUjmMxizXF02mWPoncUAQ6uxWYBZb7YMVlJv9kZ8gTN1sghTRr5IemG5-Pih13TPi4Hc3wQsIDresCXKeGY_xkciEp0sWS_CLDUvDomFRDtshdQZKtuvzxo4qBpFMvUWKHajP9npVLYQzd7J40iLA3RtHiUGOD4mBJ1-xrqqwrB-Hjxk0WFzKAAn07n8Oz4fJR1lXc7lAo_zuyggdPQ6qfM5XsNwrh0Uq-yUj1RPsXhcbOGWEIW7P_w",
    image_2:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRaWb14VsQvZNL356-cp3yLk_7zMnGCERhSjQk9IdSvAU_1BcJwm8F37KnaWfSDyNn4ZNuGnpbMZTDnWt-xknYOr6sTTlQ2wdhZO-f5iw8mYN2b3gzaWb_pgc_1Sdvy4aPQS1mfETUCzC_JuYwGG5t89toawmmL0gDn6-0N4Hbga8pC5VL_VaiiMZoBjYDZEwnNCzwsMS3wG3qfOQVrC7lRVnZoVXbv_9PpoRDiqBgEeHEnxTT0JUdlg",
    image_3:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClz7KaBBUmaxbwURQ07RcddQ0oPFIlB7MzyKhrxk3rkmiK1PSq_8cnwUi2-qH70ICZgpl_AClFJceJVvE8tjILhabxYP61F3c7xfQzYlATCqZEnJEftbz5p4T4NOutPpb9JLiDobUpNBTqdjZvWEChCINfgn_zzeL51AMl2wfRc_ua-BPOasUSSGmorEw7wbvBPxFDULpaSr96MzRES_RRuwmJJ9ow-8vnwX8mypIRL0yKHXVzCDIGZw",
  },
  contact: {
    title: "Siap membantu kebutuhan kesehatan keluarga Anda",
    description:
      "Kami siap memberikan dukungan medis profesional di rumah dengan cara yang aman, cepat, dan nyaman.",
    phone: "+62 858-9200-6905",
    email: "bidanrismacare@gmail.com",
    address: "Jl. Kebon Mangga 1 No. 1 Rt 006/007 Cipulir, Kebayoran lama",
    button_label: "Chat via WhatsApp",
    button_link: "https://wa.me/6285892006905",
  },
  footer: {
    brand: "Homecare",
    description:
      "Solusi perawatan kesehatan profesional di kenyamanan rumah Anda. Berkualitas, tepercaya, dan penuh kasih sayang.",
    phone: "+62 857-7378-0406",
    address: "AKR Tower Jl. Panjang No.5 Level M, Jakarta Barat, Indonesia",
  },
} as const;

export default function Admin() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [loginForm, setLoginForm] = useState({ username: "admin", password: "admin123" });
  const [loginError, setLoginError] = useState("");
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [selectedSection, setSelectedSection] = useState("hero");
  const [pricingItems, setPricingItems] = useState<any[]>([]);
  const [pricingForm, setPricingForm] = useState<PricingFormState>(emptyPricingForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  const sectionOptions = useMemo(
    () =>
      SECTION_KEYS.map((key) => ({
        key,
        label:
          key === "hero"
            ? "Hero"
            : key === "about"
              ? "Tentang Kami"
              : key === "contact"
                ? "Kontak"
                : "Footer",
      })),
    [],
  );

  const currentSection = sectionData[selectedSection] || defaultSections[selectedSection as keyof typeof defaultSections] || {};

  const request = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error("Sesi admin berakhir");
    }

    return response;
  };

  const logout = () => {
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  };

  const loadAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [pricingRes, sectionsRes] = await Promise.all([
        fetch("/api/public/pricing").then((res) => (res.ok ? res.json() : [])),
        fetch("/api/public/site-sections").then((res) => (res.ok ? res.json() : {})),
      ]);

      const pricingData = Array.isArray(pricingRes) ? pricingRes : [];
      const sectionDataRes = sectionsRes && typeof sectionsRes === "object" ? sectionsRes : {};

      const merged = {
        ...defaultSections,
        hero: { ...defaultSections.hero, ...(sectionDataRes.hero || {}) },
        about: { ...defaultSections.about, ...(sectionDataRes.about || {}) },
        contact: { ...defaultSections.contact, ...(sectionDataRes.contact || {}) },
        footer: { ...defaultSections.footer, ...(sectionDataRes.footer || {}) },
      };

      setPricingItems(pricingData);
      setSectionData(merged);
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || "Gagal memuat data admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAll();
    }
  }, [token]);

  const openSuccessModal = (title: string, message: string) => {
    setSuccessModal({ title, message });
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Login gagal");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      }
      setToken(data.token);
      openSuccessModal("Login berhasil", "Selamat datang di panel admin.");
    } catch (error: any) {
      setLoginError(error.message || "Login gagal");
    }
  };

  const handleSectionChange = (field: string, value: string) => {
    setSectionData((prev) => ({
      ...prev,
      [selectedSection]: {
        ...(prev[selectedSection] || {}),
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (field: string, file: File) => {
    if (!file) return;

    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await request("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal upload gambar");
      }

      handleSectionChange(field, data.url);
      openSuccessModal("Upload berhasil", "Gambar telah berhasil diunggah dan dipakai pada section ini.");
    } catch (error: any) {
      alert(error.message || "Gagal upload gambar");
    } finally {
      setUploadingField(null);
    }
  };

  const saveSection = async () => {
    const payload = sectionData[selectedSection] || {};
    setSaving(true);
    try {
      const response = await request(`/api/admin/site-sections/${selectedSection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan section");
      }

      setSectionData((prev) => ({
        ...prev,
        [selectedSection]: data,
      }));
      openSuccessModal("Section berhasil disimpan", "Perubahan pada bagian ini sudah diterapkan ke website.");
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan section");
    } finally {
      setSaving(false);
    }
  };

  const handlePricingValue = (field: keyof PricingFormState, value: string | boolean) => {
    setPricingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetPricingForm = () => {
    setPricingForm(emptyPricingForm());
    setEditId(null);
  };

  const savePricing = async () => {
    setSaving(true);
    try {
      const payload = {
        ...pricingForm,
        duration: Number(pricingForm.duration),
        price: Number(pricingForm.price),
      };

      const url = editId ? `/api/pricing/${editId}` : "/api/pricing";
      const method = editId ? "PUT" : "POST";

      const response = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan pricing");
      }

      await loadAll();
      resetPricingForm();
      openSuccessModal("Pricing berhasil disimpan", editId ? "Data pricing berhasil diperbarui." : "Data pricing baru berhasil ditambahkan.");
    } catch (error: any) {
      alert(error.message || "Gagal menyimpan pricing");
    } finally {
      setSaving(false);
    }
  };

  const editPricing = (item: any) => {
    setEditId(item.id);
    setPricingForm({
      category: item.category,
      title: item.title,
      description: item.description,
      image: item.image,
      duration: item.duration,
      price: item.price,
      recommended: Boolean(item.recommended),
    });
  };

  const deletePricing = async (id: number) => {
    if (!window.confirm("Hapus pricing ini?")) return;
    try {
      const response = await request(`/api/pricing/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal menghapus pricing");
      }
      await loadAll();
      if (editId === id) resetPricingForm();
    } catch (error: any) {
      alert(error.message || "Gagal menghapus pricing");
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Password tidak cocok");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter");
      return;
    }

    try {
      const response = await request("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengubah password");
      }

      if (typeof window !== "undefined" && data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        setToken(data.token);
      }

      setShowPasswordForm(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      openSuccessModal("Password berhasil diubah", "Password admin telah diperbarui dan token aktif diperbaharui.");
    } catch (error: any) {
      setPasswordError(error.message || "Gagal mengubah password");
    }
  };

  const ImageUploadButton = ({ field }: { field: string }) => (
    <div className="flex gap-2">
      <label className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 cursor-pointer hover:bg-blue-100 transition">
        <span>Upload</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleImageUpload(field, e.target.files[0]);
            }
          }}
          disabled={uploadingField === field}
          className="hidden"
        />
      </label>
      {uploadingField === field && <span className="text-xs text-slate-500">Uploading...</span>}
    </div>
  );

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--pine)]">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Masuk</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 transition focus:border-[var(--pine)]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 transition focus:border-[var(--pine)]"
              />
            </div>

            {loginError && <p className="text-sm text-red-600">{loginError}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--pine)] px-4 py-3 font-semibold text-white transition hover:brightness-95"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--pine)]">Admin Panel</p>
            <h1 className="text-xl font-semibold text-slate-900">Kelola Landing Page</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Buka Website
            </a>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Ubah Password
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Ubah Password</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-2 font-medium text-white"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 md:p-8">
        {successModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>
              <h3 className="text-center text-xl font-semibold text-slate-900">{successModal.title}</h3>
              <p className="mt-2 text-center text-sm text-slate-600">{successModal.message}</p>
              <button
                type="button"
                onClick={() => setSuccessModal(null)}
                className="mt-5 w-full rounded-xl bg-[var(--pine)] px-4 py-3 font-semibold text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-7xl space-y-8">
          {/* Section Editor & Preview */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Editor Panel */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Edit Section</h2>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                >
                  {sectionOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? (
                <p className="text-slate-500">Memuat...</p>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Judul</label>
                    <input
                      value={currentSection.title || ""}
                      onChange={(e) => handleSectionChange("title", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
                    <textarea
                      value={currentSection.description || ""}
                      onChange={(e) => handleSectionChange("description", e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    />
                  </div>

                  {selectedSection === "hero" && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Badge</label>
                        <input
                          value={currentSection.badge || ""}
                          onChange={(e) => handleSectionChange("badge", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Image Hero</label>
                        <div className="space-y-2">
                          {currentSection.image && (
                            <img
                              src={currentSection.image}
                              alt="Hero"
                              className="w-full rounded-lg border border-slate-200 h-32 object-cover"
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              value={currentSection.image || ""}
                              onChange={(e) => handleSectionChange("image", e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                              placeholder="URL gambar..."
                            />
                            <ImageUploadButton field="image" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Label CTA Utama</label>
                        <input
                          value={currentSection.cta_label || ""}
                          onChange={(e) => handleSectionChange("cta_label", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Link CTA Utama</label>
                        <input
                          value={currentSection.cta_link || ""}
                          onChange={(e) => handleSectionChange("cta_link", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Label CTA Kedua</label>
                        <input
                          value={currentSection.secondary_cta_label || ""}
                          onChange={(e) => handleSectionChange("secondary_cta_label", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                    </>
                  )}

                  {selectedSection === "about" && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Image 1</label>
                        <div className="space-y-2">
                          {currentSection.image && (
                            <img
                              src={currentSection.image}
                              alt="Img1"
                              className="w-full rounded-lg border border-slate-200 h-32 object-cover"
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              value={currentSection.image || ""}
                              onChange={(e) => handleSectionChange("image", e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                              placeholder="URL..."
                            />
                            <ImageUploadButton field="image" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Image 2</label>
                        <div className="space-y-2">
                          {currentSection.image_2 && (
                            <img
                              src={currentSection.image_2}
                              alt="Img2"
                              className="w-full rounded-lg border border-slate-200 h-32 object-cover"
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              value={currentSection.image_2 || ""}
                              onChange={(e) => handleSectionChange("image_2", e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                              placeholder="URL..."
                            />
                            <ImageUploadButton field="image_2" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Image 3</label>
                        <div className="space-y-2">
                          {currentSection.image_3 && (
                            <img
                              src={currentSection.image_3}
                              alt="Img3"
                              className="w-full rounded-lg border border-slate-200 h-32 object-cover"
                            />
                          )}
                          <div className="flex gap-2">
                            <input
                              value={currentSection.image_3 || ""}
                              onChange={(e) => handleSectionChange("image_3", e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                              placeholder="URL..."
                            />
                            <ImageUploadButton field="image_3" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSection === "contact" && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                        <input
                          value={currentSection.phone || ""}
                          onChange={(e) => handleSectionChange("phone", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                        <input
                          value={currentSection.email || ""}
                          onChange={(e) => handleSectionChange("email", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Alamat</label>
                        <textarea
                          value={currentSection.address || ""}
                          onChange={(e) => handleSectionChange("address", e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Label Tombol WhatsApp</label>
                        <input
                          value={currentSection.button_label || ""}
                          onChange={(e) => handleSectionChange("button_label", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Link WhatsApp</label>
                        <input
                          value={currentSection.button_link || ""}
                          onChange={(e) => handleSectionChange("button_link", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                    </>
                  )}

                  {selectedSection === "footer" && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Brand</label>
                        <input
                          value={currentSection.brand || ""}
                          onChange={(e) => handleSectionChange("brand", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                        <input
                          value={currentSection.phone || ""}
                          onChange={(e) => handleSectionChange("phone", e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Alamat</label>
                        <textarea
                          value={currentSection.address || ""}
                          onChange={(e) => handleSectionChange("address", e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={saveSection}
                    disabled={saving}
                    className="w-full rounded-lg bg-[var(--pine)] px-4 py-3 font-semibold text-white disabled:opacity-60 transition"
                  >
                    {saving ? "Menyimpan..." : "Simpan Section"}
                  </button>
                </div>
              )}
            </section>

            {/* Preview Panel */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Preview Website</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {showPreview ? "Tutup" : "Buka"}
                </button>
              </div>

{showPreview && (
  <div className="border-t border-slate-200 pt-4">
    <style>{`
      .admin-preview-static .scroll-fade-up,
      .admin-preview-static .scroll-stagger {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
        transition: none !important;
      }
    `}</style>
    <div className="admin-preview-static max-h-[calc(100vh-210px)] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-2">
      {selectedSection === "hero" && (
        <div className="bg-white">
          <Hero content={currentSection as any} />
        </div>
      )}

      {selectedSection === "about" && (
        <div className="bg-white">
          <Achievements content={currentSection as any} />
        </div>
      )}

      {selectedSection === "contact" && (
        <div className="bg-white">
          <Contact content={currentSection as any} />
        </div>
      )}

      {selectedSection === "footer" && (
        <div className="bg-white">
          <Footer content={currentSection as any} />
        </div>
      )}
    </div>
  </div>
)}
            </section>
          </div>

          {/* Pricing Management */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Kelola Pricing</h2>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              {/* Pricing Form */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-800">{editId ? "Edit" : "Tambah"} Pricing</h3>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
                  <input
                    value={pricingForm.category}
                    onChange={(e) => handlePricingValue("category", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Judul</label>
                  <input
                    value={pricingForm.title}
                    onChange={(e) => handlePricingValue("title", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
                  <textarea
                    value={pricingForm.description}
                    onChange={(e) => handlePricingValue("description", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Image Produk</label>
                  <div className="space-y-2">
                    {pricingForm.image && (
                      <img
                        src={pricingForm.image}
                        alt="Pricing"
                        className="w-full rounded-lg border border-slate-200 h-24 object-cover"
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        value={pricingForm.image}
                        onChange={(e) => handlePricingValue("image", e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"
                        placeholder="URL gambar..."
                      />
                      <label className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 cursor-pointer hover:bg-blue-100 transition">
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setUploadingField("pricing-image");
                              const tempField = "pricing-temp-" + Date.now();
                              handleImageUpload(tempField, e.target.files[0]).then(() => {
                                const newUrl = sectionData[tempField];
                                if (typeof newUrl === "string") {
                                  handlePricingValue("image", newUrl);
                                }
                                setUploadingField(null);
                              });
                            }
                          }}
                          disabled={uploadingField === "pricing-image"}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Durasi (min)</label>
                    <input
                      type="number"
                      value={pricingForm.duration}
                      onChange={(e) => handlePricingValue("duration", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Harga (Rp)</label>
                    <input
                      type="number"
                      value={pricingForm.price}
                      onChange={(e) => handlePricingValue("price", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={pricingForm.recommended}
                    onChange={(e) => handlePricingValue("recommended", e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>Jadikan Recommended</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={savePricing}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : editId ? "Update" : "Tambah"}
                  </button>
                  {editId && (
                    <button
                      type="button"
                      onClick={resetPricingForm}
                      className="rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>

              {/* Pricing List */}
              <div className="space-y-3">
                <h3 className="font-medium text-slate-800">Pricing List ({pricingItems.length})</h3>
                {pricingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada pricing.</p>
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto">
                    {pricingItems.map((item) => (
                      <div
                        key={item.id}
                        className={`cursor-pointer rounded-lg border-2 p-3 transition ${
                          editId === item.id
                            ? "border-[var(--pine)] bg-blue-50"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                        }`}
                        onClick={() => editPricing(item)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase text-[var(--pine)]">{item.category}</p>
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="text-xs text-slate-600">
                              Rp{Number(item.price).toLocaleString("id-ID")} • {item.duration}m
                            </p>
                            {item.recommended && <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">Recommended</span>}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePricing(item.id);
                            }}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
