import { FaClock, FaUser } from "react-icons/fa"
import { useQueryClient } from "@tanstack/react-query"
import { fetchGithubUser } from "../api/github"

type RecentSerachesProps = {
    users: string[],
    onSelect: (username: string)=> void
}

const RecentSearches = ({users, onSelect}: RecentSerachesProps) => {

  const queryClinet = useQueryClient();
  
  return (
    <div className="recent-searches">
                    <div className="recent-header">
                        <FaClock />
                        <h3> Recent Searches</h3>
                    </div>
                    <ul>
                        {users.map(user => {
                            return <li key={user}>
                                <button onClick={() => 
                                    onSelect(user)
                                }
                                onMouseEnter={()=>{
                                    queryClinet.prefetchQuery({queryKey: ['users', user],
                                    queryFn: () => fetchGithubUser(user),
                                    })
                                }}
                                >
                                    <FaUser className="user-icon" />
                                    {user}
                                </button>
                            </li>
                        })}
                    </ul>
                </div>
  )
}

export default RecentSearches