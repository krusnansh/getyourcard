"use client";

import { useState } from "react";
import { saveLead } from "@/lib/leads";

export default function FormPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    await saveLead({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      hasCreditHistory: formData.get("history") === "yes",
    });

    setLoading(false);
    alert("Interest recorded. Our executive will call you.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <input name="name" placeholder="Name" required className="w-full p-2" />
        <input name="email" placeholder="Email" required className="w-full p-2" />
        <input name="phone" placeholder="Phone" required className="w-full p-2" />

        <select name="history" className="w-full p-2">
          <option value="no">No credit history</option>
          <option value="yes">I have a credit card</option>
        </select>

        <button disabled={loading} className="w-full bg-indigo-600 text-white py-2">
          {loading ? "Saving..." : "Check Eligibility"}
        </button>
      </form>
    </main>
  );
}
