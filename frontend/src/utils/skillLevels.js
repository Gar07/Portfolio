export const SKILL_LEVELS = [
  { value: 'Beginner', label: 'Pemula', description: 'Memahami dasar dan masih membutuhkan panduan saat menerapkannya.' },
  { value: 'Intermediate', label: 'Menengah', description: 'Mampu menyelesaikan tugas umum secara mandiri dan masih belajar menangani kasus yang lebih kompleks.' },
  { value: 'Advanced', label: 'Mahir', description: 'Mampu menangani kebutuhan kompleks, memilih pendekatan, dan memperbaiki masalah secara mandiri.' },
  { value: 'Expert', label: 'Ahli', description: 'Memahami teknologi secara mendalam, mengevaluasi kompromi desain, dan dapat membimbing orang lain.' },
];

export const SKILL_CATEGORIES = ['Bahasa pemrograman', 'Web & aplikasi', 'Basis data & penyimpanan', 'Keamanan & analisis', 'AI & komputasi', 'Infrastruktur & alat kerja', 'Lainnya'];
const unspecified = { value: '', label: 'Belum dinilai', description: 'Teknologi dicantumkan berdasarkan penggunaan atau pembelajaran; tingkat kemahiran belum dinilai.' };

export function getSkillLevel(value) {
  return SKILL_LEVELS.find(level => level.value.toLowerCase() === String(value ?? '').trim().toLowerCase()) || unspecified;
}
