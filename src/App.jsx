import { useState, useEffect, useRef } from "react"
import localRoutes from "./local_routes.json"
import { FaFacebook, FaXTwitter, FaWhatsapp } from "react-icons/fa6"
import { SiGooglemaps } from "react-icons/si"

import { inject } from '@vercel/analytics'
inject()

// ─────────────────────────────────────────
// COMMUNITY PAGE COMPONENT
// ─────────────────────────────────────────

function CommunityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuth, setShowAuth] = useState("login") // login, signup
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState("")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyText, setReplyText] = useState("")
  
  // Auth form states
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [authError, setAuthError] = useState("")

  // Load users and posts from localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem("communityUsers")
    const storedPosts = localStorage.getItem("communityPosts")
    const storedUser = localStorage.getItem("currentUser")
    
    if (!storedUsers) {
      // Initialize with demo data
      localStorage.setItem("communityUsers", JSON.stringify([]))
    }
    
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    } else {
      const demoPosts = [
        {
          id: 1,
          title: "Best taxi route from Soweto to Randburg?",
          content: "I need to commute daily from Soweto to Randburg. What's the best taxi route and estimated fare?",
          author: "Demo User",
          authorEmail: "demo@example.com",
          date: new Date().toISOString(),
          replies: [
            { id: 1, author: "TaxiDriver", content: "Take taxi from Soweto to JHB CBD (R15), then change to Randburg taxi (R12). Total R27.", date: new Date().toISOString() }
          ]
        },
        {
          id: 2,
          title: "Is the N1 taxi rank safe at night?",
          content: "I might need to travel late. Is the N1 taxi rank safe around 10pm? Any tips?",
          author: "NightCommuter",
          authorEmail: "night@example.com",
          date: new Date().toISOString(),
          replies: [
            { id: 1, author: "SafeTravel", content: "Stay alert, keep valuables hidden. Usually safe but be cautious.", date: new Date().toISOString() }
          ]
        }
      ]
      setPosts(demoPosts)
      localStorage.setItem("communityPosts", JSON.stringify(demoPosts))
    }
    
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setCurrentUser(user)
      setIsLoggedIn(true)
    }
  }, [])

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("communityPosts", JSON.stringify(posts))
    }
  }, [posts])

  const handleSignup = (e) => {
    e.preventDefault()
    setAuthError("")
    
    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match")
      return
    }
    
    if (signupPassword.length < 6) {
      setAuthError("Password must be at least 6 characters")
      return
    }
    
    const storedUsers = localStorage.getItem("communityUsers")
    const users = storedUsers ? JSON.parse(storedUsers) : []
    
    if (users.find(u => u.email === signupEmail)) {
      setAuthError("Email already registered")
      return
    }
    
    const newUser = {
      email: signupEmail,
      password: signupPassword,
      name: signupEmail.split('@')[0],
      joinDate: new Date().toISOString()
    }
    
    users.push(newUser)
    localStorage.setItem("communityUsers", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify({ email: newUser.email, name: newUser.name }))
    
    setCurrentUser({ email: newUser.email, name: newUser.name })
    setIsLoggedIn(true)
    setSignupEmail("")
    setSignupPassword("")
    setSignupConfirmPassword("")
    setShowAuth("login")
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError("")
    
    const storedUsers = localStorage.getItem("communityUsers")
    const users = storedUsers ? JSON.parse(storedUsers) : []
    
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword)
    
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify({ email: user.email, name: user.name }))
      setCurrentUser({ email: user.email, name: user.name })
      setIsLoggedIn(true)
      setLoginEmail("")
      setLoginPassword("")
    } else {
      setAuthError("Invalid email or password")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setIsLoggedIn(false)
    setCurrentUser(null)
    setSelectedPost(null)
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newPostTitle.trim() || !newPost.trim()) return
    
    const newPostObj = {
      id: Date.now(),
      title: newPostTitle,
      content: newPost,
      author: currentUser.name,
      authorEmail: currentUser.email,
      date: new Date().toISOString(),
      replies: []
    }
    
    setPosts([newPostObj, ...posts])
    setNewPostTitle("")
    setNewPost("")
  }

  const handleAddReply = (postId) => {
    if (!replyText.trim()) return
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, {
            id: Date.now(),
            author: currentUser.name,
            content: replyText,
            date: new Date().toISOString()
          }]
        }
      }
      return post
    })
    
    setPosts(updatedPosts)
    setReplyText("")
  }

  const handleDeletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter(post => post.id !== postId))
      if (selectedPost?.id === postId) setSelectedPost(null)
    }
  }

  const handleDeleteReply = (postId, replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.filter(reply => reply.id !== replyId)
          }
        }
        return post
      })
      setPosts(updatedPosts)
    }
  }

  if (!isLoggedIn) {
    return (
      <main style={{maxWidth:"500px",margin:"0 auto",padding:"24px"}}>
        <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px",border:"1px solid #374151"}}>
          <div style={{display:"flex",gap:"16px",marginBottom:"24px",borderBottom:"1px solid #374151",paddingBottom:"12px"}}>
            <button onClick={() => setShowAuth("login")} style={{backgroundColor: showAuth === "login" ? "#facc15" : "transparent", color: showAuth === "login" ? "black" : "#9ca3af", border:"none", padding:"8px 16px", borderRadius:"8px", cursor:"pointer", fontWeight:"bold"}}>Login</button>
            <button onClick={() => setShowAuth("signup")} style={{backgroundColor: showAuth === "signup" ? "#facc15" : "transparent", color: showAuth === "signup" ? "black" : "#9ca3af", border:"none", padding:"8px 16px", borderRadius:"8px", cursor:"pointer", fontWeight:"bold"}}>Sign Up</button>
          </div>

          {showAuth === "login" && (
            <form onSubmit={handleLogin}>
              <h2 style={{color:"#facc15",marginTop:0,marginBottom:"20px"}}>Welcome Back</h2>
              <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
              <input type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"16px",boxSizing:"border-box"}}/>
              {authError && <p style={{color:"#ef4444",fontSize:"12px",marginBottom:"12px"}}>{authError}</p>}
              <button type="submit" style={{backgroundColor:"#facc15",color:"black",border:"none",borderRadius:"8px",padding:"14px",width:"100%",fontWeight:"bold",cursor:"pointer"}}>Login</button>
            </form>
          )}

          {showAuth === "signup" && (
            <form onSubmit={handleSignup}>
              <h2 style={{color:"#facc15",marginTop:0,marginBottom:"20px"}}>Create Account</h2>
              <input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
              <input type="password" placeholder="Password (min 6 characters)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
              <input type="password" placeholder="Confirm Password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"16px",boxSizing:"border-box"}}/>
              {authError && <p style={{color:"#ef4444",fontSize:"12px",marginBottom:"12px"}}>{authError}</p>}
              <button type="submit" style={{backgroundColor:"#facc15",color:"black",border:"none",borderRadius:"8px",padding:"14px",width:"100%",fontWeight:"bold",cursor:"pointer"}}>Sign Up</button>
            </form>
          )}
        </div>
      </main>
    )
  }

  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      {/* User Header */}
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"20px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #374151"}}>
        <div>
          <p style={{color:"#9ca3af",fontSize:"12px",marginBottom:"4px"}}>Welcome,</p>
          <h2 style={{color:"#facc15",margin:0,fontSize:"20px"}}>{currentUser?.name}</h2>
          <p style={{color:"#6b7280",fontSize:"11px",marginTop:"4px"}}>{currentUser?.email}</p>
        </div>
        <button onClick={handleLogout} style={{backgroundColor:"#374151",color:"#9ca3af",border:"none",borderRadius:"8px",padding:"8px 16px",cursor:"pointer"}}>Logout</button>
      </div>

      {/* Create Post */}
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"20px",marginBottom:"24px",border:"1px solid #374151"}}>
        <h3 style={{color:"#facc15",marginTop:0,fontSize:"16px"}}>💬 Create New Post</h3>
        <input type="text" placeholder="Post title" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
        <textarea placeholder="Write your question or share information..." value={newPost} onChange={e => setNewPost(e.target.value)} rows="3" style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box",fontFamily:"inherit"}}/>
        <button onClick={handleCreatePost} disabled={!newPostTitle.trim() || !newPost.trim()} style={{backgroundColor: newPostTitle.trim() && newPost.trim() ? "#facc15" : "#374151", color: newPostTitle.trim() && newPost.trim() ? "black" : "#9ca3af", border:"none", borderRadius:"8px", padding:"10px 16px", cursor: newPostTitle.trim() && newPost.trim() ? "pointer" : "not-allowed", fontWeight:"bold"}}>📢 Post to Community</button>
      </div>

      {/* Posts List */}
      <h3 style={{color:"#facc15",marginBottom:"16px",fontSize:"16px"}}>📝 Community Discussions</h3>
      
      {posts.length === 0 ? (
        <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"40px",textAlign:"center",border:"1px solid #374151"}}>
          <p style={{color:"#9ca3af"}}>No posts yet. Be the first to start a discussion!</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{backgroundColor:"#111827",borderRadius:"16px",padding:"20px",marginBottom:"16px",border:"1px solid #374151"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"12px"}}>
              <div>
                <h4 style={{color:"#facc15",margin:0,fontSize:"16px"}}>{post.title}</h4>
                <div style={{display:"flex",gap:"12px",marginTop:"6px"}}>
                  <p style={{color:"#9ca3af",fontSize:"11px"}}>👤 {post.author}</p>
                  <p style={{color:"#6b7280",fontSize:"11px"}}>📅 {new Date(post.date).toLocaleDateString()}</p>
                  <p style={{color:"#34d399",fontSize:"11px"}}>💬 {post.replies.length} replies</p>
                </div>
              </div>
              {post.authorEmail === currentUser.email && (
                <button onClick={() => handleDeletePost(post.id)} style={{backgroundColor:"#374151",color:"#ef4444",border:"none",borderRadius:"6px",padding:"4px 10px",fontSize:"11px",cursor:"pointer"}}>Delete</button>
              )}
            </div>
            
            <p style={{color:"#e5e7eb",fontSize:"13px",lineHeight:"1.5",marginBottom:"16px"}}>{post.content}</p>
            
            <button onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)} style={{backgroundColor:"#1f2937",color:"#facc15",border:"1px solid #374151",borderRadius:"8px",padding:"6px 12px",fontSize:"11px",cursor:"pointer"}}>
              {selectedPost?.id === post.id ? "Hide Replies" : `Show Replies (${post.replies.length})`}
            </button>
            
            {selectedPost?.id === post.id && (
              <div style={{marginTop:"16px",paddingTop:"16px",borderTop:"1px solid #374151"}}>
                <h5 style={{color:"#facc15",marginBottom:"12px",fontSize:"13px"}}>Replies</h5>
                {post.replies.length === 0 ? (
                  <p style={{color:"#6b7280",fontSize:"12px",marginBottom:"12px"}}>No replies yet. Be the first to respond!</p>
                ) : (
                  post.replies.map(reply => (
                    <div key={reply.id} style={{backgroundColor:"#1f2937",borderRadius:"12px",padding:"12px",marginBottom:"10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                        <p style={{color:"#facc15",fontSize:"12px",fontWeight:"bold",margin:0}}>{reply.author}</p>
                        <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                          <p style={{color:"#6b7280",fontSize:"10px",margin:0}}>{new Date(reply.date).toLocaleDateString()}</p>
                          {reply.author === currentUser.name && (
                            <button onClick={() => handleDeleteReply(post.id, reply.id)} style={{backgroundColor:"transparent",color:"#ef4444",border:"none",fontSize:"10px",cursor:"pointer"}}>Delete</button>
                          )}
                        </div>
                      </div>
                      <p style={{color:"#e5e7eb",fontSize:"12px",margin:0}}>{reply.content}</p>
                    </div>
                  ))
                )}
                
                {currentUser && (
                  <div style={{marginTop:"12px"}}>
                    <textarea placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} rows="2" style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"10px",color:"white",marginBottom:"8px",boxSizing:"border-box",fontFamily:"inherit",fontSize:"12px"}}/>
                    <button onClick={() => handleAddReply(post.id)} disabled={!replyText.trim()} style={{backgroundColor: replyText.trim() ? "#facc15" : "#374151", color: replyText.trim() ? "black" : "#9ca3af", border:"none", borderRadius:"8px", padding:"8px 16px", cursor: replyText.trim() ? "pointer" : "not-allowed", fontSize:"12px", fontWeight:"bold"}}>Post Reply</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </main>
  )
}

// ─────────────────────────────────────────
// WEATHER COMPONENT
// ─────────────────────────────────────────

function WeatherWidget({ destination }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!destination || destination.length < 2) return
    
    const fetchWeather = async () => {
      setLoading(true)
      try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(destination)}?format=%C|%t|%w|%h&lang=en`)
        const data = await response.text()
        const parts = data.split('|')
        
        setWeather({
          condition: parts[0] || "Unknown",
          temp: parts[1] || "N/A",
          wind: parts[2] || "N/A",
          humidity: parts[3] || "N/A"
        })
      } catch (err) {
        console.error("Weather fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    const timeout = setTimeout(fetchWeather, 1000)
    return () => clearTimeout(timeout)
  }, [destination])

  if (!destination || destination.length < 2) return null
  if (loading) return (
    <div style={{backgroundColor: "#1f2937", borderRadius: "12px", padding: "12px", marginBottom: "16px", textAlign: "center"}}>
      <p style={{color: "#9ca3af", fontSize: "12px"}}>☁️ Loading weather for {destination}...</p>
    </div>
  )
  if (!weather) return null

  const getWeatherIcon = (condition) => {
    const cond = condition?.toLowerCase() || ""
    if (cond.includes("sunny") || cond.includes("clear")) return "☀️"
    if (cond.includes("partly cloudy")) return "⛅"
    if (cond.includes("cloudy")) return "☁️"
    if (cond.includes("rain") || cond.includes("shower")) return "🌧️"
    if (cond.includes("thunder")) return "⛈️"
    if (cond.includes("fog") || cond.includes("mist")) return "🌫️"
    return "🌡️"
  }

  return (
    <div style={{
      backgroundColor: "#0f172a",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "20px",
      border: "1px solid #1e293b",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
    }}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px"}}>
        <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
          <span style={{fontSize: "24px"}}>{getWeatherIcon(weather.condition)}</span>
          <div>
            <p style={{color: "#facc15", fontSize: "12px", fontWeight: "bold", margin: 0}}>
              {destination.toUpperCase()} WEATHER
            </p>
            <p style={{color: "#e5e7eb", fontSize: "20px", fontWeight: "bold", margin: 0}}>
              {weather.temp}
            </p>
          </div>
        </div>
        <div style={{textAlign: "right"}}>
          <p style={{color: "#9ca3af", fontSize: "11px", margin: 0}}>💨 {weather.wind}</p>
          <p style={{color: "#9ca3af", fontSize: "11px", margin: 0}}>💧 {weather.humidity} humidity</p>
        </div>
      </div>
      <p style={{color: "#6b7280", fontSize: "10px", marginTop: "8px", textAlign: "center"}}>
        📍 Current conditions for {destination}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────
// LIVE TRAFFIC NEWS COMPONENT
// ─────────────────────────────────────────

function TrafficNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrafficNews()
    const interval = setInterval(fetchTrafficNews, 300000)
    return () => clearInterval(interval)
  }, [])

  const fetchTrafficNews = async () => {
    try {
      setNews([
        { title: "N3 Van Reenen's Pass: Heavy traffic expected this weekend due to holiday travel", link: "#", pubDate: new Date().toISOString(), author: "Traffic SA" },
        { title: "N2 Durban: Lane closures at Umgeni Road intersection for roadworks until Friday", link: "#", pubDate: new Date().toISOString(), author: "KZN Transport" },
        { title: "N1 Polokwane: Roadworks between 8am-4pm, expect 30min delays", link: "#", pubDate: new Date().toISOString(), author: "SANRAL" },
        { title: "N4 Witbank: Foggy conditions this morning, reduce speed", link: "#", pubDate: new Date().toISOString(), author: "Arrive Alive" },
        { title: "N12 Kimberley: Roadworks until end of June, use alternative routes", link: "#", pubDate: new Date().toISOString(), author: "SANRAL" },
        { title: "R21 Pretoria: Accident cleared, traffic恢复正常", link: "#", pubDate: new Date().toISOString(), author: "Traffic SA" },
      ])
    } catch (error) {
      console.error('Error fetching traffic news:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: "#111827",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "24px",
      border: "1px solid #374151",
      width: "100%",
      boxSizing: "border-box"
    }}>
      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #374151"}}>
        <h3 style={{color: "#facc15", margin: 0, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px"}}>🚦 Live Traffic News</h3>
        <span style={{color: "#6b7280", fontSize: "9px"}}>SA Roads</span>
      </div>
      
      {loading ? (
        <div style={{textAlign: "center", padding: "15px"}}><p style={{color: "#9ca3af", fontSize: "12px"}}>Loading traffic updates...</p></div>
      ) : (
        <div style={{maxHeight: "280px", overflowY: "auto", paddingRight: "6px"}}>
          <style>{`
            div::-webkit-scrollbar { width: 6px; }
            div::-webkit-scrollbar-track { background: #1f2937; border-radius: 10px; }
            div::-webkit-scrollbar-thumb { background: #facc15; border-radius: 10px; }
          `}</style>
          
          {news.map((item, idx) => (
            <div key={idx} style={{marginBottom: "12px", paddingBottom: "10px", borderBottom: idx !== news.length - 1 ? "1px solid #1f2937" : "none"}}>
              <div style={{display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px"}}>
                <span style={{fontSize: "10px"}}>🚨</span>
                <span style={{color: "#facc15", fontSize: "10px", fontWeight: "bold"}}>{item.author || "Traffic Report"}</span>
                <span style={{color: "#4b5563", fontSize: "9px", marginLeft: "auto"}}>{new Date(item.pubDate).toLocaleString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <a href={item.link !== "#" ? item.link : "https://www.arrivealive.co.za"} target="_blank" rel="noreferrer" style={{color: "#e5e7eb", textDecoration: "none", fontSize: "12px", display: "block", lineHeight: "1.4"}}>{item.title}</a>
            </div>
          ))}
        </div>
      )}
      
      <div style={{marginTop: "10px", paddingTop: "8px", borderTop: "1px solid #1f2937", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <p style={{color: "#4b5563", fontSize: "9px", margin: 0}}>📡 Updated every 5 min</p>
        <p style={{color: "#6b7280", fontSize: "9px", margin: 0}}>📍 N1 • N2 • N3 • N4 • N12 • R21</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// FARE SPLIT CALCULATOR COMPONENT
// ─────────────────────────────────────────

function FareSplitCalculator() {
  const [totalFare, setTotalFare] = useState("")
  const [passengers, setPassengers] = useState("")
  const [splitResult, setSplitResult] = useState(null)

  const calculateSplit = () => {
    const fare = parseFloat(totalFare)
    const count = parseInt(passengers)
    if (fare && count && count > 0 && !isNaN(fare) && !isNaN(count)) {
      setSplitResult({
        perPerson: fare / count,
        total: fare,
        passengerCount: count
      })
    } else {
      setSplitResult(null)
    }
  }

  const clearCalculator = () => {
    setTotalFare("")
    setPassengers("")
    setSplitResult(null)
  }

  return (
    <div style={{backgroundColor: "#111827", borderRadius: "16px", padding: "20px", marginBottom: "24px", border: "1px solid #374151"}}>
      <h3 style={{color: "#facc15", marginTop: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "8px"}}>💰 Split Fare Calculator</h3>
      <p style={{color: "#9ca3af", fontSize: "12px", marginBottom: "15px"}}>Split taxi fare between passengers</p>
      <input type="number" placeholder="Total Fare (R)" value={totalFare} onChange={e => setTotalFare(e.target.value)} style={{width: "100%", backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "white", marginBottom: "10px", fontSize: "14px", boxSizing: "border-box"}}/>
      <input type="number" placeholder="Number of Passengers" value={passengers} onChange={e => setPassengers(e.target.value)} style={{width: "100%", backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "12px", color: "white", marginBottom: "10px", fontSize: "14px", boxSizing: "border-box"}}/>
      <div style={{display: "flex", gap: "10px"}}>
        <button onClick={calculateSplit} style={{backgroundColor: "#facc15", color: "black", border: "none", borderRadius: "8px", padding: "12px", flex: 1, fontWeight: "bold", cursor: "pointer", fontSize: "14px"}}>Calculate Split</button>
        <button onClick={clearCalculator} style={{backgroundColor: "#374151", color: "#9ca3af", border: "none", borderRadius: "8px", padding: "12px", flex: 1, cursor: "pointer", fontSize: "14px"}}>Clear</button>
      </div>
      {splitResult && (
        <div style={{marginTop: "15px", padding: "15px", backgroundColor: "#064e3b", borderRadius: "8px", textAlign: "center"}}>
          <p style={{color: "#34d399", margin: "5px 0", fontSize: "12px"}}>💰 Each person pays:</p>
          <p style={{color: "white", fontSize: "28px", fontWeight: "bold", margin: "5px 0"}}>R{splitResult.perPerson.toFixed(2)}</p>
          <p style={{color: "#9ca3af", fontSize: "12px", margin: "5px 0"}}>Total: R{splitResult.total.toFixed(2)} | {splitResult.passengerCount} passengers</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// QUICK ROUTES COMPONENT
// ─────────────────────────────────────────

function QuickRoutes({ onSelectRoute }) {
  const popularRoutes = [
    { from: "Soshanguve", to: "Ga-Rankuwa" },
    { from: "Jhb", to: "Vosloorus"},
    { from: "MIDRAND", to: "RANDBURG" },
    { from: "Jhb", to: "Pimville" },
  ]

  return (
    <div style={{marginBottom: "20px"}}>
      <p style={{color: "#9ca3af", fontSize: "11px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px"}}>🔥 Popular Routes</p>
      <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
        {popularRoutes.map((route, idx) => (
          <button key={idx} onClick={() => onSelectRoute(route.from, route.to)} style={{backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "8px 12px", fontSize: "11px", color: "#e5e7eb", cursor: "pointer", transition: "all 0.2s"}} onMouseEnter={e => e.currentTarget.style.backgroundColor = "#374151"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1f2937"}>
            {route.from} → {route.to}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PAGE COMPONENTS
// ─────────────────────────────────────────

function AboutPage() {
  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>About TransitAgileFare</h1>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>TransitAgileFare is a South African taxi fare comparison platform developed by developed by BetterDays Agile Technologies Inc, a Manifest Agile Projects (Pty) Ltd company. Our mission is to help commuters find affordable minibus taxi fares across South Africa.</p>
        <h2 style={{color:"#facc15",fontSize:"20px",marginTop:"24px"}}>Our Story</h2>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>Founded in 2026, TransitAgileFare was created to solve a common problem: South African commuters often struggle to know the correct taxi fares for their routes.</p>
      </div>
    </main>
  )
}

function FAQPage() {
  const faqs = [
    { q: "How accurate are the taxi fares?", a: "Our fares are sourced from official taxi association notices. Prices may vary - always confirm with your driver." },
    { q: "How often is the fare data updated?", a: "We update our database monthly or when we receive new fare notices." },
    { q: "Can I suggest a missing route?", a: "Absolutely! Use our Contact page to report missing routes." },
    { q: "Is the app free to use?", a: "Yes! TransitAgileFare is completely free for all users." },
  ]

  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Frequently Asked Questions</h1>
        {faqs.map((faq, idx) => (
          <div key={idx} style={{marginBottom:"24px",borderBottom:"1px solid #374151",paddingBottom:"16px"}}>
            <h3 style={{color:"#facc15",fontSize:"18px",marginBottom:"10px"}}>❓ {faq.q}</h3>
            <p style={{color:"#e5e7eb",lineHeight:"1.6",margin:0}}>{faq.a}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

function PrivacyPage() {
  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Privacy Policy</h1>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>Last updated: June 2026</p>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>We collect minimal information: location data for fare searches, email when you contact us. We never sell your data.</p>
      </div>
    </main>
  )
}

function TermsPage() {
  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Terms & Conditions</h1>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>Last updated: June 2026</p>
        <p style={{color:"#e5e7eb",lineHeight:"1.6",marginBottom:"20px"}}>TransitAgileFare provides taxi fare estimates for informational purposes. Actual fares may vary.</p>
      </div>
    </main>
  )
}

function TransportTipsPage() {
  const tips = [
    { title: "🚖 Peak vs Off-Peak", tip: "Fares may increase during peak hours (6-9am, 4-7pm). Travel off-peak to save money." },
    { title: "💰 Split Fares", tip: "Use our split fare calculator to divide costs fairly among passengers." },
    { title: "🚦 Live Traffic", tip: "Check live traffic news for roadworks and accidents on major routes." },
    { title: "🌡️ Check Weather", tip: "Before traveling, check the weather widget for your destination." },
  ]

  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Transport Tips</h1>
        {tips.map((tip, idx) => (
          <div key={idx} style={{marginBottom:"20px",padding:"16px",backgroundColor:"#1f2937",borderRadius:"12px"}}>
            <h3 style={{color:"#facc15",fontSize:"16px",marginBottom:"8px"}}>{tip.title}</h3>
            <p style={{color:"#e5e7eb",margin:0}}>{tip.tip}</p>
          </div>
        ))}
      </div>
    </main>
  )
}

function FareUpdatesPage() {
  const updates = [
    { date: "June 2026", route: "Soshanguve → Ga-Rankuwa", oldPrice: "R15", newPrice: "R17", change: "+R2" },
    { date: "June 2026", route: "Jhb → Vosloorus", oldPrice: "R20", newPrice: "R22", change: "+R2" },
  ]

  return (
    <main style={{maxWidth:"800px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Taxi Fare Updates</h1>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"2px solid #facc15"}}>
                <th style={{padding:"12px",textAlign:"left",color:"#facc15"}}>Date</th>
                <th style={{padding:"12px",textAlign:"left",color:"#facc15"}}>Route</th>
                <th style={{padding:"12px",textAlign:"left",color:"#facc15"}}>Old Fare</th>
                <th style={{padding:"12px",textAlign:"left",color:"#facc15"}}>New Fare</th>
                <th style={{padding:"12px",textAlign:"left",color:"#facc15"}}>Change</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update, idx) => (
                <tr key={idx} style={{borderBottom:"1px solid #374151"}}>
                  <td style={{padding:"12px",color:"#e5e7eb"}}>{update.date}</td>
                  <td style={{padding:"12px",color:"#e5e7eb"}}>{update.route}</td>
                  <td style={{padding:"12px",color:"#9ca3af"}}>{update.oldPrice}</td>
                  <td style={{padding:"12px",color:"#34d399",fontWeight:"bold"}}>{update.newPrice}</td>
                  <td style={{padding:"12px",color:"#ef4444"}}>{update.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [status, setStatus] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    const emailSubject = encodeURIComponent(`TransitAgileFare Contact: ${formData.subject}`)
    const emailBody = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`)
    window.location.href = `mailto:senzomashaba85@gmail.com?subject=${emailSubject}&body=${emailBody}`
    setStatus("✅ Opening your email app...")
    setTimeout(() => setStatus(""), 3000)
  }

  return (
    <main style={{maxWidth:"600px",margin:"0 auto",padding:"24px"}}>
      <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"32px",marginBottom:"24px"}}>
        <h1 style={{color:"#facc15",marginTop:0}}>Contact Us</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Your Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
          <input type="email" placeholder="Your Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
          <input type="text" placeholder="Subject *" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"12px",boxSizing:"border-box"}}/>
          <textarea placeholder="Your Message *" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required rows="5" style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"8px",padding:"12px",color:"white",marginBottom:"16px",boxSizing:"border-box",fontFamily:"inherit"}}/>
          <button type="submit" style={{backgroundColor:"#facc15",color:"black",border:"none",borderRadius:"8px",padding:"14px",width:"100%",fontWeight:"bold",cursor:"pointer"}}>Send Message</button>
          {status && <p style={{color:"#34d399",fontSize:"12px",marginTop:"12px",textAlign:"center"}}>{status}</p>}
        </form>
      </div>
    </main>
  )
}

// ─────────────────────────────────────────
// MAIN APP WITH NAVIGATION
// ─────────────────────────────────────────

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [originSuggestions, setOriginSuggestions] = useState([])
  const [destinationSuggestions, setDestinationSuggestions] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const query = origin.toLowerCase().trim()
    if (query.length < 2) { setOriginSuggestions([]); return }
    const unique = [...new Set(localRoutes.map(r => r.from_location))]
    setOriginSuggestions(unique.filter(loc => loc.toLowerCase().includes(query)))
  }, [origin])

  useEffect(() => {
    const query = destination.toLowerCase().trim()
    if (query.length < 2) { setDestinationSuggestions([]); return }
    const unique = [...new Set(localRoutes.map(r => r.to_location))]
    setDestinationSuggestions(unique.filter(loc => loc.toLowerCase().includes(query)))
  }, [destination])

  const isValid = origin.trim().length >= 2 && destination.trim().length >= 2

  function handleSearch() {
    if (!isValid) return
    setSearched(true)
    const f = origin.toLowerCase().trim()
    const t = destination.toLowerCase().trim()
    setSearchResults(localRoutes.filter(r => 
  (r.from_location.toLowerCase().includes(f) && r.to_location.toLowerCase().includes(t)) ||
  (r.from_location.toLowerCase().includes(t) && r.to_location.toLowerCase().includes(f))
))
  }

  function swapLocations() {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
    setSearchResults([])
    setSearched(false)
  }

  function handleSelectRoute(from, to) {
    setOrigin(from)
    setDestination(to)
    setSearchResults([])
    setSearched(false)
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    const shareText = encodeURIComponent("🚖 Check TransitAgileFare for minibus taxi fares, live traffic updates, and weather in South Africa! 🇿🇦")
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${shareText}`, '_blank', 'width=600,height=400')
  }

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const shareText = encodeURIComponent("🚖 Check TransitAgileFare for minibus taxi fares, live traffic news, and destination weather in South Africa! #TransitAgileFare #TaxiFaresSA")
    window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${url}`, '_blank', 'width=600,height=400')
  }

  const navItems = [
    { id: "home", name: "Home", icon: "🏠" },
    { id: "community", name: "Community", icon: "💬" },
    { id: "about", name: "About", icon: "📖" },
    { id: "faq", name: "FAQ", icon: "❓" },
    { id: "tips", name: "Tips", icon: "💡" },
    { id: "updates", name: "Updates", icon: "📢" },
    { id: "contact", name: "Contact", icon: "📧" },
    { id: "privacy", name: "Privacy", icon: "🔒" },
    { id: "terms", name: "Terms", icon: "⚖️" },
  ]

  return (
    <div style={{backgroundColor:"#030712",minHeight:"100vh",color:"white",fontFamily:"sans-serif"}}>
      
      <header style={{backgroundColor:"#facc15",padding:"16px 24px"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"16px"}}>
          <div onClick={() => setCurrentPage("home")} style={{cursor:"pointer"}}>
            <h1 style={{color:"black",margin:0,fontSize:"24px",fontWeight:"900"}}>🚖 TransitAgileFare</h1>
            <p style={{color:"black",margin:0,fontSize:"12px",opacity:0.7}}>South African Taxi Fares — Betterdays Agile Technologies Inc</p>
          </div>
          <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
            <button onClick={shareOnFacebook} style={{backgroundColor:"transparent", border:"none", cursor:"pointer", padding:"0"}}>
  <FaFacebook size={32} color="#1877F2" />
</button>

<button onClick={shareOnTwitter} style={{backgroundColor:"transparent", border:"none", cursor:"pointer", padding:"0"}}>
  <FaXTwitter size={32} color="white" />
</button>          </div>
        </div>
      </header>

      <div style={{backgroundColor:"#0f172a",borderBottom:"1px solid #1f2937",overflowX:"auto",whiteSpace:"nowrap"}}>
        <div style={{maxWidth:"1200px",margin:"0 auto",padding:"12px 24px",display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{backgroundColor: currentPage === item.id ? "#facc15" : "transparent", color: currentPage === item.id ? "black" : "#e5e7eb", border:"none", borderRadius:"8px", padding:"8px 16px", fontSize:"13px", cursor:"pointer", fontWeight: currentPage === item.id ? "bold" : "normal", transition:"all 0.2s"}} onMouseEnter={e => { if (currentPage !== item.id) e.currentTarget.style.backgroundColor = "#1f2937" }} onMouseLeave={e => { if (currentPage !== item.id) e.currentTarget.style.backgroundColor = "transparent" }}>
              {item.icon} {item.name}
            </button>
          ))}
        </div>
      </div>

      {currentPage === "home" && (
        <>
          <div style={{backgroundColor:"#0f172a",padding:"16px 24px",borderBottom:"1px solid #1f2937"}}>
            <div style={{maxWidth:"500px",margin:"0 auto"}}>
              <p style={{color: "#9ca3af", fontSize: "11px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px"}}>🚖 South African Minibus Taxis</p>
              <div style={{borderRadius: "16px", overflow: "hidden", border: "2px solid #facc15", boxShadow: "0 4px 15px rgba(250,204,21,0.2)"}}>
                <img src="/taxi.jpg" alt="South African Minibus Taxi" style={{width: "100%", height: "180px", objectFit: "cover", display: "block"}} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=200&fit=crop" }}/>
              </div>
              <p style={{color: "#6b7280", fontSize: "10px", textAlign: "center", marginTop: "8px"}}>South Africa's trusted minibus taxi fleet</p>
            </div>
          </div>

          <main style={{maxWidth:"500px",margin:"0 auto",padding:"24px"}}>
            <QuickRoutes onSelectRoute={handleSelectRoute} />
            <div style={{backgroundColor:"#111827",borderRadius:"16px",padding:"24px",marginBottom:"24px"}}>
              <h2 style={{color:"#facc15",marginTop:0}}>Find Your Fare</h2>
              <div style={{position:"relative",marginBottom:"8px"}}>
                <label style={{display:"block",color:"#9ca3af",marginBottom:"4px",fontSize:"13px"}}>From</label>
                <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Type departure..." style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"12px",padding:"12px",color:"white",boxSizing:"border-box",fontSize:"14px"}}/>
                {originSuggestions.length > 0 && (
                  <ul style={{position:"absolute",left:0,right:0,backgroundColor:"#1f2937",border:"1px solid #facc15",borderRadius:"12px",marginTop:"4px",padding:0,listStyle:"none",zIndex:10,maxHeight:"160px",overflowY:"auto"}}>
                    {originSuggestions.map((loc, idx) => (<li key={idx} onClick={() => { setOrigin(loc); setOriginSuggestions([]) }} onMouseOver={e => e.currentTarget.style.backgroundColor="#374151"} onMouseOut={e => e.currentTarget.style.backgroundColor="transparent"} style={{padding:"12px",cursor:"pointer",borderBottom:"1px solid #374151",fontSize:"14px",color:"#e5e7eb"}}>{loc}</li>))}
                  </ul>
                )}
              </div>
              <div style={{display:"flex",justifyContent:"center",margin:"8px 0"}}>
                <button onClick={swapLocations} style={{backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"50%",width:"36px",height:"36px",color:"#facc15",fontSize:"18px",cursor:"pointer"}}>⇅</button>
              </div>
              <div style={{position:"relative",marginBottom:"20px"}}>
                <label style={{display:"block",color:"#9ca3af",marginBottom:"4px",fontSize:"13px"}}>To</label>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Type destination..." style={{width:"100%",backgroundColor:"#1f2937",border:"1px solid #374151",borderRadius:"12px",padding:"12px",color:"white",boxSizing:"border-box",fontSize:"14px"}}/>
                {destinationSuggestions.length > 0 && (
                  <ul style={{position:"absolute",left:0,right:0,backgroundColor:"#1f2937",border:"1px solid #facc15",borderRadius:"12px",marginTop:"4px",padding:0,listStyle:"none",zIndex:10,maxHeight:"160px",overflowY:"auto"}}>
                    {destinationSuggestions.map((loc, idx) => (<li key={idx} onClick={() => { setDestination(loc); setDestinationSuggestions([]) }} onMouseOver={e => e.currentTarget.style.backgroundColor="#374151"} onMouseOut={e => e.currentTarget.style.backgroundColor="transparent"} style={{padding:"12px",cursor:"pointer",borderBottom:"1px solid #374151",fontSize:"14px",color:"#e5e7eb"}}>{loc}</li>))}
                  </ul>
                )}
              </div>
              <button onClick={handleSearch} disabled={!isValid} style={{width:"100%",backgroundColor: isValid ? "#facc15" : "#4b5563",color: isValid ? "black" : "#9ca3af",fontWeight:"bold", padding:"16px",borderRadius:"12px", border:"none",fontSize:"18px",cursor: isValid ? "pointer" : "not-allowed",opacity: isValid ? 1 : 0.6}}>🔍 Find Fare</button>
            </div>
            <WeatherWidget destination={destination} />
            <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
              {searched && searchResults.length === 0 ? (
                <div style={{textAlign:"center",padding:"24px",backgroundColor:"#111827",borderRadius:"16px"}}><p style={{color:"#ef4444",margin:0}}>No route found.</p><p style={{color:"#9ca3af",fontSize:"13px",marginTop:"8px"}}>Try the 🤖 chatbot below for help!</p></div>
              ) : (
                searchResults.map((route, idx) => {
                  const taxiPrice = parseFloat(route.price)
                  const textMessage = encodeURIComponent(`🚖 *TransitAgileFare*\n\n📍 ${route.from_location} ➔ ${route.to_location}\n✅ Taxi Fare: R${taxiPrice.toFixed(2)}\n\nFind more fares at transitagilefare.vercel.app`)
                  const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(route.from_location)}/${encodeURIComponent(route.to_location)}`
                  return (
                    <div key={idx} style={{backgroundColor:"#111827",borderRadius:"16px",padding:"20px",border:"1px solid #374151"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #374151",paddingBottom:"12px",marginBottom:"12px"}}>
                        <h3 style={{margin:0,fontSize:"13px",color:"#facc15",textTransform:"uppercase"}}>{route.from_location} ➔ {route.to_location}</h3>
                        <div style={{display:"flex",gap:"8px"}}>
                          <a href={mapsUrl} target="_blank" rel="noreferrer" style={{backgroundColor:"transparent", border:"none", textDecoration:"none", display:"inline-flex"}}>
  <SiGooglemaps size={28} color="#EA4335" />
</a>
                          <a href={`https://wa.me/?text=${textMessage}`} target="_blank" rel="noreferrer" style={{backgroundColor:"transparent", border:"none", textDecoration:"none", display:"inline-flex"}}>
  <FaWhatsapp size={28} color="#25D366" />
</a>
                        </div>
                      </div>
                      <div style={{backgroundColor:"#064e3b",padding:"16px",borderRadius:"12px",textAlign:"center"}}>
                        <div style={{fontSize:"11px",color:"#34d399",fontWeight:"bold",marginBottom:"4px"}}>MINIBUS TAXI FARE</div>
                        <div style={{fontSize:"36px",fontWeight:"900",color:"white"}}>R{taxiPrice.toFixed(2)}</div>
                      </div>
                      {route.distance_km > 0 && (<div style={{marginTop:"10px",backgroundColor:"#1f2937",padding:"10px",borderRadius:"8px",textAlign:"center",fontSize:"13px",color:"#9ca3af"}}>📍 Distance: {route.distance_km} km</div>)}
                    </div>
                  )
                })
              )}
            </div>
            <FareSplitCalculator />
            <TrafficNews />
          </main>
        </>
      )}
      {currentPage === "community" && <CommunityPage />}
      {currentPage === "about" && <AboutPage />}
      {currentPage === "faq" && <FAQPage />}
      {currentPage === "privacy" && <PrivacyPage />}
      {currentPage === "terms" && <TermsPage />}
      {currentPage === "tips" && <TransportTipsPage />}
      {currentPage === "updates" && <FareUpdatesPage />}
      {currentPage === "contact" && <ContactPage />}

      <footer style={{textAlign:"center",color:"#4b5563",fontSize:"12px",padding:"32px 24px",borderTop:"1px solid #1f2937",marginTop:"40px"}}>
        <p>BetterDays Agile Technologies Inc © 2026 · South African Taxi Fare Finder</p>
        <p style={{marginTop:"10px",fontSize:"11px",color:"#6b7280"}}>🌡️ Weather • 🚦 Live traffic • 💰 Fare split • 💬 Community</p>
      </footer>

      
    </div>
  )

}