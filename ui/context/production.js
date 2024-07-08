const isLocal = true;

// production url
const ServerUrl = isLocal
  ? "http://127.0.0.1:5001"
  // : "https://versoview-backend.vercel.app"
  : " https://vvt-api.currlybraces.com";

export default ServerUrl;