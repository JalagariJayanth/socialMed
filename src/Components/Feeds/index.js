import React, { useContext, useEffect, useRef } from "react";
import { DataContext } from "../../ContextAPI/contextProvider";

import "./index.css";
import { useNavigate } from "react-router-dom";
import FeedCard from "../../Utilis/FeedCard";
import { FaPlus } from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";

const Feeds = () => {
  const {
    userDetails,
    allPosts,
    feedHasMore,
    fetchMoreAllPosts,
    feedLastPost,
  } = useContext(DataContext);
  const navigate = useNavigate();
  const observeRef = useRef(null);
  const feedLastPostRef = useRef(null);
  useEffect(() => {
    const observerCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && feedHasMore) {
        fetchMoreAllPosts(); 
      }
    };

    observeRef.current = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    });

    if (feedLastPostRef.current) {
      observeRef.current.observe(feedLastPostRef.current);
    }

    return () => {
      if (observeRef.current && feedLastPostRef.current) {
        observeRef.current.unobserve(feedLastPostRef.current);
      }
    };
  }, [feedLastPost]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    navigate("/createPost", { state: { files } });
  };

  const handleLogout = () => {
    localStorage.removeItem("userUID");
    navigate("/");
  };

  return (
    <>
      <div className="feed-profile-container">
        <div
          onClick={() => {
            navigate("/profile");
          }}
          style={{ display: "flex" }}
        >
          <img
            src={userDetails?.photoURL}
            alt="profile"
            className="profile-feed-image"
          />
          <p className="feed-profile-text">
            Welcome Back,
            <br />
            <span className="feed-profile-name">{userDetails?.userName}</span>
          </p>
        </div>
        <RiLogoutCircleLine
          onClick={handleLogout}
          className="logout-icon"
          size={20}
        />
      </div>

      <div className="feeds-continer">
        <h1 className="feed-text">Feeds</h1>

        {allPosts.length > 0 &&
          allPosts.map((eachFeed) => (
            <FeedCard key={eachFeed.id} eachFeed={eachFeed} />
          ))}
        {feedHasMore && <div ref={feedLastPostRef} style={{ height: "1px" }} />}
      </div>

      <button
        className="add-post-button"
        onClick={() => document.getElementById("fileInput").click()}
      >
        <FaPlus fontSize={30} />
      </button>

      <input
        type="file"
        id="fileInput"
        accept="image/*,video/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
        capture="camera"
      />
    </>
  );
};

export default Feeds;
