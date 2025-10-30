import { useState } from "react";

interface SearchBarProps {
    onSearch: (query: string) => void;
}

export default function SearchBar({onSearch}: SearchBarProps){
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        onSearch(query);
    }

    return(
        <div className="flex items-center gap-2 mb-6">
            <input
                type='text'
                placeholder = 'Search Emails'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus: ring-2 focus: ring-blue-400"
                />
                <button onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition">
                    Search
                </button>
        </div>
    )
}