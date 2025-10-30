import { useEffect, useState } from "react";
import api from "../api";
import EmailCard from "../components/EmailCard";
import SearchBar from "../components/SearchBar";

interface AIAnalysis {
  Importance?: string;
  Intent?: string;
  shortSummary?: string;
}

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date?: string;
  aiAnalysis?: AIAnalysis;
  score?: number;
}

export default function Dashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async (query?: string) => {
    setLoading(true);
    try {
      const endpoint = query ? `/search?q=${query}` : "/emails";
      const { data } = await api.get<Email[]>(endpoint);
      setEmails(data);
    } catch (error) {
      console.error("❌ Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        📬 IntentBox Dashboard
      </h1>

      <SearchBar onSearch={fetchEmails} />

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">
          Loading emails...
        </p>
      ) : emails.length > 0 ? (
        <div className="space-y-4">
          {emails.map((email) => (
            <EmailCard
              key={email.id}
              from={email.from}
              subject={email.subject}
              snippet={email.snippet}
              aiAnalysis={email.aiAnalysis}
              score={email.score}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No emails found.</p>
      )}
    </div>
  );
}
