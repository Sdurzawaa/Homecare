import { useEffect, useMemo, useState, type FormEvent } from "react";
import Hero from "../Hero-Panel";
import Achievements from "../Achievement";
import Contact from "../Contact";
import Footer from "../ui/Footer";
import AdminLoginForm from "./AdminLoginForm";
import PasswordInput from "./PasswordInput";
import { optimizeCloudinaryUrl } from "../../lib/image";

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

interface PricingCategoryFormState {
  category: string;
  title: string;
  description: string;
}

interface TestimoniFormState {
  teks: string;
  author: string;
  latarbelakang: string;
  initial: string;
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

const emptyPricingCategoryForm = (): PricingCategoryFormState => ({
  category: "",
  title: "",
  description: "",
});

const emptyTestimoniForm = (): TestimoniFormState => ({
  teks: "",
  author: "",
  latarbelakang: "",
  initial: "",
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [adminUsername, setAdminUsername] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sectionData, setSectionData] = useState<Record<string, any>>({});
  const [selectedSection, setSelectedSection] = useState("hero");
  const [pricingItems, setPricingItems] = useState<any[]>([]);
  const [pricingCategoryItems, setPricingCategoryItems] = useState<any[]>([]);
  const [pricingForm, setPricingForm] = useState<PricingFormState>(emptyPricingForm());
  const [pricingCategoryForm, setPricingCategoryForm] = useState<PricingCategoryFormState>(emptyPricingCategoryForm());
  const [editId, setEditId] = useState<number | null>(null);
  const [editPricingCategoryId, setEditPricingCategoryId] = useState<number | null>(null);
  const [testimoniItems, setTestimoniItems] = useState<any[]>([]);
  const [testimoniForm, setTestimoniForm] = useState<TestimoniFormState>(emptyTestimoniForm());
  const [editTestimoniId, setEditTestimoniId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const passwordRequirements = [
    {
      label: "Minimal 12 karakter",
      valid: passwordForm.newPassword.length >= 12,
    },
    {
      label: "Mengandung huruf besar (A-Z)",
      valid: /[A-Z]/.test(passwordForm.newPassword),
    },
    {
      label: "Mengandung huruf kecil (a-z)",
      valid: /[a-z]/.test(passwordForm.newPassword),
    },
    {
      label: "Mengandung angka (0-9)",
      valid: /[0-9]/.test(passwordForm.newPassword),
    },
    {
      label: "Konfirmasi password cocok",
      valid:
        passwordForm.confirmPassword !== "" &&
        passwordForm.newPassword === passwordForm.confirmPassword,
    },
  ];
  const [showPreview, setShowPreview] = useState(true);
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);
  const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);
  const [adminTab, setAdminTab] = useState<"sections" | "pricing" | "testimoni">("sections");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPricingFormModal, setShowPricingFormModal] = useState(false);
  const [showPricingCategoryFormModal, setShowPricingCategoryFormModal] = useState(false);
  const [editingPricingModal, setEditingPricingModal] = useState<any | null>(null);
  const [showTestimoniFormModal, setShowTestimoniFormModal] = useState(false);

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

  // Lock body scroll (and pause Lenis smooth-scroll, kalau ada) selama modal manapun terbuka.
  // Fokusnya biar scroll cuma jalan di dalam card modal (yang punya overflow-y-auto sendiri),
  // bukan "bocor" ke halaman/backdrop di belakangnya.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const isAnyModalOpen = Boolean(
      successModal ||
        errorModal ||
        confirmModal ||
        showPricingFormModal ||
        showPricingCategoryFormModal ||
        editingPricingModal ||
        showTestimoniFormModal ||
        showPasswordForm,
    );
    const previousOverflow = document.body.style.overflow;
    const lenis = (window as any).lenis;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = previousOverflow;
      if (lenis) lenis.start();
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      if (lenis) lenis.start();
    };
  }, [successModal, errorModal, confirmModal, showPricingFormModal, showPricingCategoryFormModal, editingPricingModal, showTestimoniFormModal, showPasswordForm]);

  const request = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    const method = (options.method || "GET").toUpperCase();

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      const csrfCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrf_token="));
      const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1] || "") : "";

      if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401) {
      logout(true);
      throw new Error("Sesi admin berakhir");
    }

    return response;
  };

  const logout = async (skipServerLogout = false) => {
    if (!skipServerLogout && isAuthenticated) {
      try {
        const csrfCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token="));
        const csrfToken = csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1] || "") : "";

        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
          },
          credentials: "include",
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    setIsAuthenticated(false);
    setAdminUsername("");
  };

  const loadAll = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [pricingRes, pricingCategoriesRes, sectionsRes, testimoniRes] = await Promise.all([
        fetch("/api/public/pricing").then((res) => (res.ok ? res.json() : [])),
        fetch("/api/public/pricing-categories").then((res) => (res.ok ? res.json() : [])),
        fetch("/api/public/site-sections").then((res) => (res.ok ? res.json() : {})),
        fetch("/api/public/testimoni").then((res) => (res.ok ? res.json() : [])),
      ]);

      const pricingData = Array.isArray(pricingRes) ? pricingRes : [];
      const pricingCategoryData = Array.isArray(pricingCategoriesRes) ? pricingCategoriesRes : [];
      const testimoniData = Array.isArray(testimoniRes) ? testimoniRes : [];
      const sectionDataRes = (sectionsRes && typeof sectionsRes === "object" ? sectionsRes : {}) as Record<string, any>;

      const merged = {
        ...defaultSections,
        hero: { ...defaultSections.hero, ...(sectionDataRes.hero || {}) },
        about: { ...defaultSections.about, ...(sectionDataRes.about || {}) },
        contact: { ...defaultSections.contact, ...(sectionDataRes.contact || {}) },
        footer: { ...defaultSections.footer, ...(sectionDataRes.footer || {}) },
      };

      setPricingItems(pricingData);
      setPricingCategoryItems(pricingCategoryData);
      setTestimoniItems(testimoniData);
      setSectionData(merged);
    } catch (error: any) {
      console.error(error);
      setLoginError(error.message || "Gagal memuat data admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/info", { credentials: "include" })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setAdminUsername(data?.username || "");
          setIsAuthenticated(true);
        }
      })
      .catch(() => undefined)
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadAll();
  }, [isAuthenticated]);

  const openSuccessModal = (title: string, message: string) => {
    setSuccessModal({ title, message });
  };

  const openErrorModal = (title: string, message: string) => {
    setErrorModal({ title, message });
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Login gagal");
      }

      if (data?.csrfToken) {
        document.cookie = `csrf_token=${encodeURIComponent(data.csrfToken)}; path=/; SameSite=Lax; Secure`;
      }

      setAdminUsername(data?.user || loginForm.username);
      setIsAuthenticated(true);
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
      openErrorModal("Gagal Upload", error.message || "Gagal upload gambar");
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
      openErrorModal("Gagal Menyimpan", error.message || "Gagal menyimpan section");
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

  const handlePricingCategoryValue = (field: keyof PricingCategoryFormState, value: string) => {
    setPricingCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetPricingForm = () => {
    setPricingForm(emptyPricingForm());
    setEditId(null);
    if (typeof window !== "undefined") {
    }
  };

  const resetPricingCategoryForm = () => {
    setPricingCategoryForm(emptyPricingCategoryForm());
    setEditPricingCategoryId(null);
  };

  const savePricing = async () => {
    // Validasi client-side
    if (!pricingForm.category?.trim()) {
      openErrorModal("Validasi Gagal", "Kategori tidak boleh kosong");
      return false;
    }
    if (!pricingForm.title?.trim()) {
      openErrorModal("Validasi Gagal", "Judul tidak boleh kosong");
      return false;
    }
    if (!pricingForm.description?.trim()) {
      openErrorModal("Validasi Gagal", "Deskripsi tidak boleh kosong");
      return false;
    }
    if (!pricingForm.image?.trim()) {
      openErrorModal("Validasi Gagal", "URL gambar tidak boleh kosong");
      return false;
    }
    if (!pricingForm.duration || Number(pricingForm.duration) <= 0) {
      openErrorModal("Validasi Gagal", "Durasi harus lebih dari 0");
      return false;
    }
    if (!pricingForm.price || Number(pricingForm.price) <= 0) {
      openErrorModal("Validasi Gagal", "Harga harus lebih dari 0");
      return false;
    }

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
      return true;
    } catch (error: any) {
      openErrorModal("Gagal Menyimpan", error.message || "Gagal menyimpan pricing");
      return false;
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
    setConfirmModal({
      title: "Konfirmasi Hapus",
      message: "Apakah Anda yakin ingin menghapus pricing ini?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await request(`/api/pricing/${id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || "Gagal menghapus pricing");
          }
          await loadAll();
          if (editId === id) resetPricingForm();
          openSuccessModal("Berhasil", "Pricing telah berhasil dihapus.");
        } catch (error: any) {
          openErrorModal("Gagal Menghapus", error.message || "Gagal menghapus pricing");
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const savePricingCategory = async () => {
    if (!pricingCategoryForm.category?.trim()) {
      openErrorModal("Validasi Gagal", "Nama kategori tidak boleh kosong");
      return false;
    }
    if (!pricingCategoryForm.title?.trim()) {
      openErrorModal("Validasi Gagal", "Judul kategori tidak boleh kosong");
      return false;
    }
    if (!pricingCategoryForm.description?.trim()) {
      openErrorModal("Validasi Gagal", "Deskripsi kategori tidak boleh kosong");
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        category: pricingCategoryForm.category.trim(),
        title: pricingCategoryForm.title.trim(),
        description: pricingCategoryForm.description.trim(),
      };

      const url = editPricingCategoryId ? `/api/pricing-categories/${editPricingCategoryId}` : "/api/pricing-categories";
      const method = editPricingCategoryId ? "PUT" : "POST";

      const response = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan kategori pricing");
      }

      await loadAll();
      resetPricingCategoryForm();
      setShowPricingCategoryFormModal(false);
      openSuccessModal(
        "Kategori berhasil disimpan",
        editPricingCategoryId ? "Kategori pricing berhasil diperbarui." : "Kategori pricing baru berhasil ditambahkan.",
      );
      return true;
    } catch (error: any) {
      openErrorModal("Gagal Menyimpan", error.message || "Gagal menyimpan kategori pricing");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const editPricingCategory = (item: any) => {
    setEditPricingCategoryId(item.id);
    setPricingCategoryForm({
      category: item.category,
      title: item.title,
      description: item.description,
    });
    setShowPricingCategoryFormModal(true);
  };

  const deletePricingCategory = async (id: number) => {
    setConfirmModal({
      title: "Konfirmasi Hapus",
      message: "Apakah Anda yakin ingin menghapus kategori ini? Kategori yang masih dipakai oleh pricing tidak bisa dihapus.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await request(`/api/pricing-categories/${id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || "Gagal menghapus kategori pricing");
          }
          await loadAll();
          if (editPricingCategoryId === id) resetPricingCategoryForm();
          openSuccessModal("Berhasil", "Kategori pricing telah berhasil dihapus.");
        } catch (error: any) {
          openErrorModal("Gagal Menghapus", error.message || "Gagal menghapus kategori pricing");
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleTestimoniValue = (field: keyof TestimoniFormState, value: string) => {
    setTestimoniForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetTestimoniForm = () => {
    setTestimoniForm(emptyTestimoniForm());
    setEditTestimoniId(null);
  };

  const saveTestimoni = async () => {
    // Validasi client-side
    if (!testimoniForm.teks?.trim()) {
      openErrorModal("Validasi Gagal", "Teks testimoni tidak boleh kosong");
      return false;
    }
    if (!testimoniForm.author?.trim()) {
      openErrorModal("Validasi Gagal", "Nama author tidak boleh kosong");
      return false;
    }
    if (!testimoniForm.latarbelakang?.trim()) {
      openErrorModal("Validasi Gagal", "Latar belakang tidak boleh kosong");
      return false;
    }
    if (!testimoniForm.initial?.trim()) {
      openErrorModal("Validasi Gagal", "Initial tidak boleh kosong");
      return false;
    }

    setSaving(true);
    try {
      const url = editTestimoniId ? `/api/testimoni/${editTestimoniId}` : "/api/testimoni";
      const method = editTestimoniId ? "PUT" : "POST";
      const payload = {
        ...testimoniForm,
        latarBelakang: testimoniForm.latarbelakang.trim(),
        latarbelakang: testimoniForm.latarbelakang.trim(),
      };

      const response = await request(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Gagal menyimpan testimoni");
      }

      await loadAll();
      resetTestimoniForm();
      openSuccessModal("Testimoni berhasil disimpan", editTestimoniId ? "Data testimoni berhasil diperbarui." : "Data testimoni baru berhasil ditambahkan.");
      return true;
    } catch (error: any) {
      openErrorModal("Gagal Menyimpan", error.message || "Gagal menyimpan testimoni");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const editTestimoni = (item: any) => {
    setEditTestimoniId(item.id_testi);
    setTestimoniForm({
      teks: item.teks,
      author: item.author,
      latarbelakang: item.latarbelakang,
      initial: item.initial,
    });
  };

  const deleteTestimoni = async (id: number) => {
    setConfirmModal({
      title: "Konfirmasi Hapus",
      message: "Apakah Anda yakin ingin menghapus testimoni ini?",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await request(`/api/testimoni/${id}`, { method: "DELETE" });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || "Gagal menghapus testimoni");
          }
          await loadAll();
          if (editTestimoniId === id) resetTestimoniForm();
          openSuccessModal("Berhasil", "Testimoni telah berhasil dihapus.");
        } catch (error: any) {
          openErrorModal("Gagal Menghapus", error.message || "Gagal menghapus testimoni");
        }
      },
      onCancel: () => setConfirmModal(null),
    });
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Password tidak cocok");
      return;
    }

    if (
      passwordForm.newPassword.length < 12 ||
      !/[A-Z]/.test(passwordForm.newPassword) ||
      !/[a-z]/.test(passwordForm.newPassword) ||
      !/[0-9]/.test(passwordForm.newPassword)
    ) {
      setPasswordError("Password minimal 12 karakter dan harus mengandung huruf besar, huruf kecil, serta angka");
      return;
    }

    try {
      const response = await request("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengubah password");
      }

      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setAdminUsername("");
      setIsAuthenticated(false);
      setLoginError("Password berhasil diubah. Silakan login kembali dengan password baru.");
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

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--pine)]"
          role="status"
          aria-label="Memeriksa sesi"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        loginForm={loginForm}
        loginError={loginError}
        onChange={(field, value) => setLoginForm((previous) => ({ ...previous, [field]: value }))}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Global Styles */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 md:px-8 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Kelola Landing Page</h1>
            {adminUsername && (
              <p className="mt-1 text-sm text-slate-500">
                Admin: <span className="font-medium text-slate-700">{adminUsername}</span>
              </p>
            )}
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
              onClick={() => logout()}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-4 md:px-8">
          <button
            onClick={() => setAdminTab("sections")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              adminTab === "sections"
                ? "border-[var(--pine)] text-[var(--pine)]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Atur Sections
          </button>
          <button
            onClick={() => setAdminTab("pricing")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              adminTab === "pricing"
                ? "border-[var(--pine)] text-[var(--pine)]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Kelola Pricing
          </button>
          <button
            onClick={() => setAdminTab("testimoni")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
              adminTab === "testimoni"
                ? "border-[var(--pine)] text-[var(--pine)]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Kelola Testimoni
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" data-lenis-prevent>
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Ubah Password</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password Lama</label>
                <PasswordInput
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(value) => setPasswordForm((p) => ({ ...p, currentPassword: value }))}
                  isVisible={showCurrentPassword}
                  onToggleVisibility={() => setShowCurrentPassword((visible) => !visible)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
                <PasswordInput
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(value) => setPasswordForm((p) => ({ ...p, newPassword: value }))}
                  isVisible={showNewPassword}
                  onToggleVisibility={() => setShowNewPassword((visible) => !visible)}
                />
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Syarat password
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {passwordRequirements.map((requirement) => (
                      <p
                        key={requirement.label}
                        className={`text-xs ${requirement.valid ? "text-emerald-600" : "text-rose-500"}`}
                      >
                        <span className="mr-1 font-bold">{requirement.valid ? "✓" : "•"}</span>
                        {requirement.label}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-sky-700">
                    Simbol diperbolehkan, misalnya: ! @ # $
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <PasswordInput
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => setPasswordForm((p) => ({ ...p, confirmPassword: value }))}
                  isVisible={showConfirmPassword}
                  onToggleVisibility={() => setShowConfirmPassword((visible) => !visible)}
                />
                {passwordForm.confirmPassword && (
                  <p
                    className={`mt-1 text-xs ${passwordForm.newPassword === passwordForm.confirmPassword ? "text-emerald-600" : "text-rose-500"}`}
                  >
                    {passwordForm.newPassword === passwordForm.confirmPassword
                      ? "Konfirmasi password cocok"
                      : "Konfirmasi password belum cocok"}
                  </p>
                )}
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
                  disabled={!passwordRequirements.every((requirement) => requirement.valid)}
                  className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-2 font-medium text-white transition enabled:hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col min-h-[calc(100vh-65px)] bg-slate-50">
        {successModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" data-lenis-prevent>
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

        {/* Error Modal */}
        {errorModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" data-lenis-prevent>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
                ✕
              </div>
              <h3 className="text-center text-xl font-semibold text-slate-900">{errorModal.title}</h3>
              <p className="mt-2 text-center text-sm text-slate-600">{errorModal.message}</p>
              <button
                type="button"
                onClick={() => setErrorModal(null)}
                className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" data-lenis-prevent>
              <h3 className="text-center text-lg font-semibold text-slate-900">{confirmModal.title}</h3>
              <p className="mt-3 text-center text-sm text-slate-600">{confirmModal.message}</p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    confirmModal.onCancel?.();
                    setConfirmModal(null);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => confirmModal.onConfirm()}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {showPricingCategoryFormModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-2 sm:p-4">
            <div className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-[22rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-w-xl sm:p-5" data-lenis-prevent>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">
                  {editPricingCategoryId ? "Edit Kategori" : "Tambah Kategori"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowPricingCategoryFormModal(false);
                    if (!editPricingCategoryId) {
                      resetPricingCategoryForm();
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nama Kategori <span className="text-red-500">*</span></label>
                  <input
                    value={pricingCategoryForm.category}
                    onChange={(e) => handlePricingCategoryValue("category", e.target.value)}
                    placeholder="Contoh: Inisiasi Menyusu"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Judul <span className="text-red-500">*</span></label>
                  <input
                    value={pricingCategoryForm.title}
                    onChange={(e) => handlePricingCategoryValue("title", e.target.value)}
                    placeholder="Contoh: Perawatan Kehamilan"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={pricingCategoryForm.description}
                    onChange={(e) => handlePricingCategoryValue("description", e.target.value)}
                    placeholder="Deskripsikan kategori ini..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPricingCategoryFormModal(false)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={savePricingCategory}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-2.5 font-medium text-white hover:brightness-95 disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : editPricingCategoryId ? "Update" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Pricing Modal */}
        {showPricingFormModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-2 sm:p-4">
            <div className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-[22rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-w-2xl sm:p-5" data-lenis-prevent>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{editId ? "Edit Pricing" : "Tambah Pricing"}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowPricingFormModal(false);
                    if (!editId) {
                      resetPricingForm();
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-3" data-pricing-form>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Kategori <span className="text-red-500">*</span></label>
                  <select
                    value={pricingForm.category}
                    onChange={(e) => handlePricingValue("category", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    disabled={pricingCategoryItems.length === 0}
                  >
                    {pricingCategoryItems.length === 0 ? (
                      <option value="">Belum ada kategori tersimpan</option>
                    ) : (
                      <>
                        <option value="">Pilih kategori</option>
                        {pricingCategoryItems.map((item) => (
                          <option key={item.id} value={item.category}>
                            {item.category}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Judul <span className="text-red-500">*</span></label>
                  <input
                    value={pricingForm.title}
                    onChange={(e) => handlePricingValue("title", e.target.value)}
                    placeholder="Contoh: Paket Pemeriksaan 1 Jam"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={pricingForm.description}
                    onChange={(e) => handlePricingValue("description", e.target.value)}
                    placeholder="Deskripsikan layanan ini..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Image Produk <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      value={pricingForm.image}
                      onChange={(e) => handlePricingValue("image", e.target.value)}
                      placeholder="URL gambar"
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                    <ImageUploadButton field="image" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Durasi (min)</label>
                    <input
                      type="number"
                      min="1"
                      value={pricingForm.duration}
                      onChange={(e) => handlePricingValue("duration", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Harga (Rp)</label>
                    <input
                      type="number"
                      min="1"
                      value={pricingForm.price}
                      onChange={(e) => handlePricingValue("price", e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={pricingForm.recommended}
                    onChange={(e) => handlePricingValue("recommended", e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <span>Recommended</span>
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPricingFormModal(false);
                      if (!editId) {
                        resetPricingForm();
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const saved = await savePricing();
                      if (saved) {
                        setShowPricingFormModal(false);
                      }
                    }}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : editId ? "Update" : "Tambah"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Pricing Modal */}
        {editingPricingModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" data-lenis-prevent>
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Edit Pricing</h2>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEditId(editingPricingModal.id);
                  setPricingForm({
                    category: editingPricingModal.category,
                    title: editingPricingModal.title,
                    description: editingPricingModal.description,
                    image: editingPricingModal.image,
                    duration: editingPricingModal.duration,
                    price: editingPricingModal.price,
                    recommended: Boolean(editingPricingModal.recommended),
                  });
                  setEditingPricingModal(null);
                  setShowPricingFormModal(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{editingPricingModal.category}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Judul</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{editingPricingModal.title}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Deskripsi</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded max-h-20 overflow-y-auto">{editingPricingModal.description}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Durasi (menit)</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">{editingPricingModal.duration}</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Harga (Rp)</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">Rp{Number(editingPricingModal.price).toLocaleString("id-ID")}</p>
                </div>

                {editingPricingModal.recommended && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs font-semibold text-yellow-700">✓ Recommended</p>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPricingModal(null)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-2 font-medium text-white hover:brightness-95"
                  >
                    Edit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add / Edit Testimoni Modal */}
        {showTestimoniFormModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-2 sm:p-4">
            <div className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-[22rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:max-w-2xl sm:p-5" data-lenis-prevent>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-slate-900">{editTestimoniId ? "Edit Testimoni" : "Tambah Testimoni"}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowTestimoniFormModal(false);
                    if (!editTestimoniId) {
                      resetTestimoniForm();
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-3" data-testimoni-form>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Teks Testimoni <span className="text-red-500">*</span></label>
                  <textarea
                    rows={4}
                    value={testimoniForm.teks}
                    onChange={(e) => handleTestimoniValue("teks", e.target.value)}
                    placeholder="Tulis testimoni pelanggan..."
                    className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nama Author <span className="text-red-500">*</span></label>
                  <input
                    value={testimoniForm.author}
                    onChange={(e) => handleTestimoniValue("author", e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Latar Belakang <span className="text-red-500">*</span></label>
                  <input
                    value={testimoniForm.latarbelakang}
                    onChange={(e) => handleTestimoniValue("latarbelakang", e.target.value)}
                    placeholder="Contoh: Pemilik Café"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Initial <span className="text-red-500">*</span></label>
                  <input
                    maxLength={1}
                    value={testimoniForm.initial}
                    onChange={(e) => handleTestimoniValue("initial", e.target.value.toUpperCase())}
                    placeholder="B"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimoniFormModal(false);
                      if (!editTestimoniId) {
                        resetTestimoniForm();
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const saved = await saveTestimoni();
                      if (saved) {
                        setShowTestimoniFormModal(false);
                      }
                    }}
                    disabled={saving}
                    className="flex-1 rounded-lg bg-[var(--pine)] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? "Menyimpan..." : editTestimoniId ? "Update" : "Tambah"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 w-full flex flex-col p-3">
          {/* Section Editor & Preview - TAB 1 */}
          {adminTab === "sections" && (
          <div className="grid gap-3 grid-cols-1 xl:grid-cols-2 auto-rows-max xl:auto-rows-auto">
            {/* Editor Panel */}
            <section className="flex flex-col bg-white border border-slate-200 rounded-lg">
              <div className="p-4 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-base font-semibold text-slate-900 mb-3">Edit Section</h2>
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
                <p className="text-slate-500 p-4">Memuat...</p>
              ) : (
                <div className="hide-scrollbar overflow-y-auto max-h-[70vh] xl:max-h-none">
                  <div className="space-y-4 p-4">
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
                      className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
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
                              src={optimizeCloudinaryUrl(currentSection.image, 600)}
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
                              src={optimizeCloudinaryUrl(currentSection.image, 600)}
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
                              src={optimizeCloudinaryUrl(currentSection.image_2, 400)}
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
                              src={optimizeCloudinaryUrl(currentSection.image_3, 400)}
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
                          className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
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
                </div>
              )}
            </section>

            {/* Preview Panel */}
            <section className="flex flex-col bg-white border border-slate-200 rounded-lg min-h-[400px] xl:min-h-0">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Preview Website</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  {showPreview ? "Tutup" : "Buka"}
                </button>
              </div>

              {showPreview && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <style>{`
                    .admin-preview-static .scroll-fade-up,
                    .admin-preview-static .scroll-stagger {
                      opacity: 1 !important;
                      transform: none !important;
                      animation: none !important;
                      transition: none !important;
                    }
                  `}</style>
                  <div className="admin-preview-static w-full flex-1 overflow-y-auto bg-slate-50 border-t border-slate-200 min-h-0" style={{ scrollbarGutter: 'stable' }}>
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
          )}

          {/* Pricing Management - TAB 2 */}
          {adminTab === "pricing" && (
          <section className="flex min-h-0 flex-col bg-white border border-slate-200 rounded-lg xl:overflow-hidden xl:flex-1 xl:min-h-0">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Kelola Pricing</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setPricingForm(emptyPricingForm());
                    setShowPricingFormModal(true);
                  }}
                  className="rounded-lg bg-[var(--pine)] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
                >
                  Tambah Pricing
                </button>
              </div>
            </div>

            <div className="hide-scrollbar overflow-y-auto p-4 xl:max-h-none xl:flex-1">
              <div className="space-y-3 min-h-0">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-medium text-slate-800">Kategori Layanan ({pricingCategoryItems.length})</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEditPricingCategoryId(null);
                        setPricingCategoryForm(emptyPricingCategoryForm());
                        setShowPricingCategoryFormModal(true);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      + Tambah Kategori
                    </button>
                  </div>
                  <div className="space-y-2">
                    {pricingCategoryItems.length === 0 ? (
                      <p className="text-xs text-slate-500">Belum ada kategori layanan.</p>
                    ) : (
                      pricingCategoryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2">
                          <div>
                            <p className="text-xs font-bold uppercase text-[var(--pine)]">{item.category}</p>
                            <p className="text-xs text-slate-600">{item.title}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => editPricingCategory(item)}
                              className="rounded bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-600 hover:bg-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deletePricingCategory(item.id)}
                              className="rounded bg-red-100 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-200"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-800">Pricing List ({pricingItems.length})</h3>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pricing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {pricingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada pricing.</p>
                ) : (
                  <div className="max-h-[28rem] min-h-0 space-y-2 overflow-y-auto pr-1 xl:max-h-[40rem]">
                    {pricingItems
                      .filter((item) =>
                        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border-2 border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-xs font-bold uppercase text-[var(--pine)]">{item.category}</p>
                              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                              <p className="text-xs text-slate-600">
                                Rp{Number(item.price).toLocaleString("id-ID")} • {item.duration}m
                              </p>
                              {item.recommended && <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-semibold">Recommended</span>}
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
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
                                  setShowPricingFormModal(true);
                                }}
                                className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200"
                              >
                                Edit
                              </button>
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
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          )}

          {/* Testimoni Management - TAB 3 */}
          {adminTab === "testimoni" && (
          <section className="flex min-h-0 flex-col bg-white border border-slate-200 rounded-lg xl:overflow-hidden xl:flex-1 xl:min-h-0">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">Kelola Testimoni</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditTestimoniId(null);
                    setTestimoniForm(emptyTestimoniForm());
                    setShowTestimoniFormModal(true);
                  }}
                  className="rounded-lg bg-[var(--pine)] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
                >
                  Tambah Testimoni
                </button>
              </div>
            </div>

            <div className="hide-scrollbar overflow-y-auto p-4 xl:max-h-none xl:flex-1">
              <div className="space-y-3 min-h-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-800">Testimoni List ({testimoniItems.length})</h3>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari testimoni..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pl-9 text-sm"
                  />
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {testimoniItems.length === 0 ? (
                  <p className="text-sm text-slate-500">Belum ada testimoni.</p>
                ) : (
                  <div className="max-h-[28rem] min-h-0 space-y-2 overflow-y-auto pr-1 xl:max-h-[40rem]">
                    {testimoniItems
                      .filter((item) =>
                        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.teks.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.latarbelakang.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((item) => (
                        <div
                          key={item.id_testi}
                          className="rounded-lg border-2 border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pine)]/10 text-xs font-semibold text-[var(--pine)]">
                                  {item.initial}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{item.author}</p>
                                  <p className="text-xs text-slate-600">{item.latarbelakang}</p>
                                </div>
                              </div>
                              <p className="text-xs text-slate-600 italic line-clamp-2">"{item.teks}"</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  editTestimoni(item);
                                  setShowTestimoniFormModal(true);
                                }}
                                className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTestimoni(item.id_testi);
                                }}
                                className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200"
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}