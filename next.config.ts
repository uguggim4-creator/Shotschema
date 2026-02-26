import type { NextConfig } from "next";

const allowedOrigins = [
  "https://www.ainspire.co.kr",
  "https://ainspire.co.kr",
  "https://shotschema-dmdu.vercel.app",
  "http://localhost:3000",
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // CORS — API 요청 허용
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: allowedOrigins.join(", "),
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        // iframe 임베드 허용 — ainspire.co.kr에서 iframe으로 삽입 가능
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://www.ainspire.co.kr https://ainspire.co.kr",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
