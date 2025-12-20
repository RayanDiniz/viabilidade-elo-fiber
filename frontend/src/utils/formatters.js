export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('pt-BR').format(num);
};

export const getViabilidadeColor = (viabilidade) => {
  if (viabilidade?.includes('ALTA')) return '#10b981';
  if (viabilidade?.includes('MÉDIA')) return '#f59e0b';
  if (viabilidade?.includes('BAIXA')) return '#ef4444';
  return '#6b7280';
};

export const getViabilidadeIcon = (viabilidade) => {
  if (viabilidade?.includes('ALTA')) return '✅';
  if (viabilidade?.includes('MÉDIA')) return '⚠️';
  if (viabilidade?.includes('BAIXA')) return '❌';
  return 'ℹ️';
};