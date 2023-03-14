import React from "react";
import Head from "next/head";
import Link from "next/link";
import { theme, ConfigProvider } from "antd";

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Head>
        <title>Gamify</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#014652] to-[#152c29]">
        <div className="container flex max-w-full flex-col items-center justify-center gap-12 px-4 py-8">
          <Link href="/" className="cursor-pointer">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              <span className="text-[hsl(226,86%,61%)]">Gamify</span>
            </h1>
          </Link>
          {children}
        </div>
      </main>
    </ConfigProvider>
  );
};
