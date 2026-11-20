const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('poi_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getAuthHeadersForUpload = () => {
  const token = localStorage.getItem('poi_token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth endpoints
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }
    return data;
  },

  async register(registrationData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate user.');
    }
    return data;
  },

  // Dashboard endpoints
  async getOrganizationOverview() {
    const res = await fetch(`${API_BASE_URL}/dashboard/organization`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch organization dashboard data.');
    }
    return data;
  },

  async getVerifierOverview() {
    const res = await fetch(`${API_BASE_URL}/dashboard/verifier`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch verifier dashboard data.');
    }
    return data;
  },

  // Campaign endpoints
  async getPublicCampaigns(filters = {}) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.category && filters.category !== 'ALL') query.append('category', filters.category);

    const res = await fetch(`${API_BASE_URL}/campaigns?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch public campaigns.');
    }
    return data;
  },

  async createCampaign(campaignData) {
    const res = await fetch(`${API_BASE_URL}/campaigns`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(campaignData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create campaign.');
    }
    return data;
  },

  async getMyCampaigns(filters = {}) {
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.category && filters.category !== 'ALL') query.append('category', filters.category);
    if (filters.status && filters.status !== 'ALL') query.append('status', filters.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/campaigns/mine${qs}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch your campaigns.');
    }
    return data;
  },

  async getCampaignById(id) {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch campaign details.');
    }
    return data;
  },

  async updateCampaign(id, updateData) {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update campaign.');
    }
    return data;
  },

  async deleteCampaign(id) {
    const res = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete campaign.');
    }
    return data;
  },

  // Report & Evidence Endpoints (Milestone 5)
  async previewOcr(file) {
    const formData = new FormData();
    formData.append('evidenceFile', file);

    const res = await fetch(`${API_BASE_URL}/reports/ocr-preview`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to process evidence OCR.');
    }
    return data;
  },

  async submitReport(formData) {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit impact report.');
    }
    return data;
  },

  async getMyReports() {
    const res = await fetch(`${API_BASE_URL}/reports/mine`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch impact reports.');
    }
    return data;
  },

  async getReportById(id) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch impact report details.');
    }
    return data;
  },

  // Milestone 7: Blockchain Integration Endpoints
  async getReportBlockchainDetails(id) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/blockchain`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch blockchain details.');
    }
    return data;
  },

  async verifyReport(id) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Blockchain verification failed.');
    }
    return data;
  },

  async rejectReport(id, reason) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Blockchain rejection failed.');
    }
    return data;
  },

  // Milestone 8: Cryptographic Evidence Integrity Validation
  async validateEvidenceIntegrity(id) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}/integrity`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to validate evidence integrity.');
    }
    return data;
  },

  // Milestone 9: Analytics & Global Statistics
  async getAnalytics(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.organizationId) query.append('organizationId', params.organizationId);
    if (params.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE_URL}/dashboard/analytics?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch analytics.');
    }
    return data;
  },
};
