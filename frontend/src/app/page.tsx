"use client";

import { motion } from "framer-motion";
import { CheckCircle, ListTodo, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black text-white flex flex-col">
      {/* Navbar */}
      <header className="flex justify-between max-w-full items-center px-8 py-5 border-b gap-4 border-gray-800 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-wide">TaskFlow</h1>
        <div className=" hidden sm:flex gap-3">
          <a
            href="/login"
            className="px-4 py-2 rounded-xl border border-gray-700 hover:bg-gray-800 transition"
          >
            Login
          </a>
          <a
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-white text-black font-medium hover:opacity-90 transition"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-1 px-6 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Manage Tasks
          <br />
          <span className="text-gray-400">Like a Pro ⚡</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-xl mb-8 text-lg"
        >
          Stay focused, organized, and productive with a minimal yet powerful
          task management system built for speed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition"
          >
            Login
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 px-8 pb-20">
        {[
          {
            icon: <ListTodo />,
            title: "Organize Tasks",
            desc: "Create, edit, and manage your tasks effortlessly.",
          },
          {
            icon: <Zap />,
            title: "Blazing Fast",
            desc: "Optimized for speed with a distraction-free UI.",
          },
          {
            icon: <CheckCircle />,
            title: "Stay Consistent",
            desc: "Track progress and build productive habits.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur p-6 hover:scale-105 transition"
          >
            <div className="mb-4 text-white">{item.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-6 border-t border-gray-800">
        © {new Date().getFullYear()} TaskFlow. Built by Harish
      </footer>
    </div>
  );
}
