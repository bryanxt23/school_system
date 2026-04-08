// Falls back to localhost:8080 in development if REACT_APP_API_URL is unset.
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

export default API_BASE;
