import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchGithubUser, searchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import RecentSearches from "./RecentSearches";
import { useDebounce } from "use-debounce";
import { type GithubUser } from "../types";
import SuggestionDropdown from "./SuggestionDropdown";

const UserSearch = () => {
    const [username, setUsername] = useState("");
    const [submittedUsername, setSubmittedUsername] = useState("")
    const [recentUsers, setRecentUsers] = useState<string[]>(() => {
        const stored = localStorage.getItem('recentUsers')
        return stored ? JSON.parse(stored) : []
    })
    const [debounceUsername] = useDebounce(username, 300)
    const [showSuggestions, setShowSuggestions] = useState(false);


    // Query to fetch specific user
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["users", submittedUsername],
        queryFn: async () => {
            return await fetchGithubUser(submittedUsername)
        },
        enabled: !!submittedUsername

    });

    const { data: suggestions } = useQuery({
        queryKey: ["github-user-suggestion", debounceUsername],
        queryFn: async () => {
            return await searchGithubUser(debounceUsername)
        },
        enabled: debounceUsername.length > 1

    });

    // Query to fetch suggestions for user search

    useEffect(() => {
        localStorage.setItem("recentUsers", JSON.stringify(recentUsers))
    }, [recentUsers])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = username.trim()
        if (!trimmed) return;
        setSubmittedUsername(trimmed)
        setUsername("")
        setRecentUsers((prev) => {
            const updated = [trimmed, ...prev.filter(u => u !== trimmed)]

            return updated.slice(0.5)
        })
    }

    return (
        <div>
            <form className="form" onSubmit={handleSubmit}>
                <div className="dropdown-wrapper">

                    <input type="text" placeholder="Enter Github Username..." value={username}
                        onChange={e => {
                            const val = e.target.value
                            setUsername(val)
                            setShowSuggestions(val.trim().length > 1)
                        }} />
                    {showSuggestions && suggestions?.length > 0 && (
                        <SuggestionDropdown suggestions={suggestions} show={showSuggestions} onSelect={(selected) => {
                            setUsername(selected);
                            setShowSuggestions(false);

                            if (submittedUsername !== selected) {
                                setSubmittedUsername(selected)
                            } else {
                                refetch();
                            }
                            setRecentUsers((prev) => {
                                const updated = [selected, ...prev.filter(u => u !== selected)]

                                return updated.slice(0.5)
                            })
                        }} />
                    )}
                </div>
                <button type="submit"> Search </button>
            </form>

            {isLoading && <p className="status"> Loading... </p>}
            {isError && <p className="status error"> {error.message} </p>}
            {data && <UserCard user={data} />}

            {recentUsers.length > 0 && (
                <RecentSearches users={recentUsers} onSelect={(username) => { setUsername(username); setSubmittedUsername(username); }} />
            )}
        </div>
    )
}

export default UserSearch