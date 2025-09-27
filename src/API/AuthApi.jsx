import axios from 'axios';
const URL_base = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_BASE_URL2 ||  import.meta.env.VITE_locale;
const API_URL = `${URL_base}/api/auth`;

const AuthApi = {
  login: async (email, password) => {
    const response = await axios.post(
      `${API_URL}/login`,
      { username: email, password },
      { withCredentials: true }
    );
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(
      `${API_URL}/logout`,
      null,
      { withCredentials: true }
    );
    return response.data;
  },
};

export default AuthApi;
