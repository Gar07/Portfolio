// frontend/src/api/backendApi.js
import axios from "axios";

// Alamat dasar server PHP backend
export const BASE_URL = '/api';

// Helper delay untuk visual transition yang halus
export const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// Membuat instance axios dengan konfigurasi dasar
const backendApi = axios.create({
  baseURL: BASE_URL,
});

// ==================== AUTENTIKASI ====================
export const LoginApi = async (username, password) => {
  return await backendApi.post('/login', { username, password });
};

export const LogoutApi = async (token) => {
  return await backendApi.post('/logout', { token });
};

// ==================== ENDPOINT PUBLIK ====================
export const GetPublic = async () => {
  return await backendApi.get('/public');
};

// ==================== BIODATA & PROFIL ====================
export const GetUser = async () => {
  return await backendApi.get('/users');
};

export const UpdateUser = async (formData) => {
  return await backendApi.post('/users', formData);
};

// ==================== RIWAYAT PENDIDIKAN ====================
export const GetPendidikan = async () => {
  return await backendApi.get('/pendidikan');
};

export const AddPendidikan = async (data) => {
  return await backendApi.post('/pendidikan', data);
};

export const UpdatePendidikan = async (data) => {
  return await backendApi.put('/pendidikan', data);
};

export const DeletePendidikan = async (id, token) => {
  return await backendApi.delete('/pendidikan', { data: { id, token } });
};

// ==================== PENGALAMAN ====================
export const GetPengalaman = async () => {
  return await backendApi.get('/pengalaman');
};

export const AddPengalaman = async (data) => {
  return await backendApi.post('/pengalaman', data);
};

export const UpdatePengalaman = async (data) => {
  return await backendApi.put('/pengalaman', data);
};

export const DeletePengalaman = async (id, token) => {
  return await backendApi.delete('/pengalaman', { data: { id, token } });
};

// ==================== KEAHLIAN (SKILLS) ====================
export const GetKeahlian = async () => {
  return await backendApi.get('/keahlian');
};

export const AddKeahlian = async (data) => {
  return await backendApi.post('/keahlian', data);
};

export const UpdateKeahlian = async (data) => {
  return await backendApi.put('/keahlian', data);
};

export const DeleteKeahlian = async (id, token) => {
  return await backendApi.delete('/keahlian', { data: { id, token } });
};

// ==================== KONTAK AKTIF ====================
export const GetKontak = async () => {
  return await backendApi.get('/kontak');
};

export const AddKontak = async (data) => {
  return await backendApi.post('/kontak', data);
};

export const UpdateKontak = async (data) => {
  return await backendApi.put('/kontak', data);
};

export const DeleteKontak = async (id, token) => {
  return await backendApi.delete('/kontak', { data: { id, token } });
};

// ==================== KARYA TERBAIK ====================
export const GetKarya = async () => {
  return await backendApi.get('/karya');
};

export const AddKarya = async (data) => {
  return await backendApi.post('/karya', data);
};

export const UpdateKarya = async (data) => {
  return await backendApi.put('/karya', data);
};

export const DeleteKarya = async (id, token) => {
  return await backendApi.delete('/karya', { data: { id, token } });
};

export default backendApi;
export const GetPencapaian = () => backendApi.get('/pencapaian');
export const AddPencapaian = data => backendApi.post('/pencapaian', data);
export const UpdatePencapaian = data => backendApi.put('/pencapaian', data);
export const DeletePencapaian = (id, token) => backendApi.delete('/pencapaian', { data: { id, token } });

export const VerifyLoginApi = () => backendApi.get('/verify_login');
backendApi.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !['/login', '/verify_login'].includes(error.config?.url)) window.dispatchEvent(new Event('portfolio:session-expired'));
  return Promise.reject(error);
});
