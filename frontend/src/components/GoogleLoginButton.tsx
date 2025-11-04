export default function GoogleLoginButton() {
  const handleGoogleConnect = () => {
    window.location.href = "https://intentbox.onrender.com/api/auth/google";
  };

  return (
    <button
      onClick={handleGoogleConnect}
      className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md transition"
    >
      <img
        src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
        alt="Google"
        className="w-5 h-5"
      />
      Connect Gmail
    </button>
  );
}
