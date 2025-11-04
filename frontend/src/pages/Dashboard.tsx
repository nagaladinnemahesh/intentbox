import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import EmailCard from "../components/EmailCard";
import SearchBar from "../components/SearchBar";
import GoogleLoginButton from "../components/GoogleLoginButton";

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
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userLoaded, setUserLoaded] = useState(false);
  const location = useLocation();

  // Capture token from Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // clean the URL so ?token=... disappears
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, [location]);

  // Fetch user status
  const fetchUserStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { data } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGmailConnected(data.gmailConnected);
      setUserEmail(data.email);
    } catch (error) {
      console.error("Error fetching user status:", error);
    } finally {
      setUserLoaded(true);
    }
  };

  // Fetch emails if Gmail connected
  const fetchEmails = async (query?: string) => {
    if (!gmailConnected) return;
    setLoading(true);
    try {
      const endpoint = query ? `/search?q=${query}` : "/emails";
      const { data } = await api.get<Email[]>(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmails(data);
    } catch (error) {
      console.error("❌ Error fetching emails:", error);
    } finally {
      setLoading(false);
    }
  };

  // demo mode emails 

  const demoEmails: Email[] = [
    {
      id: "1",
      from: "recruiter@company.com",
      to: "you@gmail.com",
      subject: "Interview Invitation – Backend Engineer",
      snippet:
        "We reviewed your profile and would like to schedule a technical interview this week.",
      aiAnalysis: {
        Importance: "High",
        Intent: "Job Opportunity",
        shortSummary: "Schedule a backend interview",
      },
      score: 0.95,
    },
    {
      id: "2",
      from: "noreply@linkedin.com",
      to: "you@gmail.com",
      subject: "Your post is getting attention!",
      snippet: "50+ new people engaged with your recent post.",
      aiAnalysis: {
        Importance: "Medium",
        Intent: "Engagement Notification",
        shortSummary: "Post gaining engagement on LinkedIn",
      },
      score: 0.75,
    },
    {
      id: "3",
      from: "amazon.in",
      to: "you@gmail.com",
      subject: "Your order has been shipped",
      snippet: "Your recent order #12345 has been shipped and will arrive soon.",
      aiAnalysis: {
        Importance: "Low",
        Intent: "Order Update",
        shortSummary: "Amazon shipment notification",
      },
      score: 0.6,
    },
  ];

  const activateDemoMode = () => {
    localStorage.setItem("token", "demo-token");
    setGmailConnected(true);
    setEmails(demoEmails);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchUserStatus();
  }, []);

  useEffect(() => {
    if (gmailConnected) fetchEmails();
  }, [gmailConnected]);

  // Conditional rendering
  if (!userLoaded) {
    return (
      <div className="text-center text-gray-500 mt-20 animate-pulse">
        Checking login status...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">📬 IntentBox</h1>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-gray-600">
              Connected as <strong>{userEmail}</strong>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {!gmailConnected ? (
        <div className="flex flex-col items-center justify-center mt-10">
          <p className="mb-4 text-gray-600 text-center">
            Connect your Gmail account to start analyzing your emails with AI.
          </p>
          <GoogleLoginButton />
          <button onClick={activateDemoMode}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Try Demo Mode 🚀
          </button>
        </div>
      ) : (
        <>
          {/* Search Bar */}
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
            <p className="text-center text-gray-500 mt-8">
              No emails found.
            </p>
          )}
        </>
      )}
    </div>
  );
}
