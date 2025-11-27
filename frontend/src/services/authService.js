import axios from "axios";

const API_URL = "http://localhost:4000/api/v1";

const authService = {
  login: async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return res.data;
  },
};

export default authService;
