import { FaInstagram } from "react-icons/fa";

export default function InstagramProfileCard() {
  return (
    <div className="bg-brand-charcoal-light p-6 rounded-xl shadow-lg border border-neutral-600 flex flex-col items-center text-center max-w-md mx-auto">
      <div className="bg-red-600/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <FaInstagram className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">QuikSpit Auto Detailing</h3>
      <p className="text-neutral-300 mb-4">@quikspitboise</p>
      <a
        href="https://www.instagram.com/quikspitboise/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-neutral-800 flex items-center gap-2"
      >
        <FaInstagram className="w-5 h-5" />
        View on Instagram
      </a>
    </div>
  );
}
