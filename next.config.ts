import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
};

const withPwa = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPwa(nextConfig);
