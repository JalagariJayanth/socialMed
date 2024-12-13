import React, { useContext, useEffect, useRef } from "react";
import { DataContext } from "../../ContextAPI/contextProvider";
import { FaArrowLeft } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import "./index.css";
import { useNavigate } from "react-router-dom";
import ImageSlider from "../../Utilis/PostCard";
const Profile = () => {
  const {
    fetchUniqueUserPosts,
    userDetails,
    uniqueUserPosts,
    fetchMoreUniqueUserPosts,
    uniqueHasMore,
    uniqueLastPost,
  } = useContext(DataContext);
  const navigate = useNavigate();
  const observeRef = useRef(null);
  const userLastPostRef = useRef(null);

  useEffect(() => {
    fetchUniqueUserPosts();
  }, []);

  useEffect(() => {
    const observerCallback = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && uniqueHasMore) {
        fetchMoreUniqueUserPosts();
      }
    };

    observeRef.current = new IntersectionObserver(observerCallback, {
      root: null, 
      rootMargin: "0px", 
      threshold: 1.0, 
    });

    if (userLastPostRef.current) {
      observeRef.current.observe(userLastPostRef.current); 
    }

    return () => {
      if (observeRef.current && userLastPostRef.current) {
        observeRef.current.unobserve(userLastPostRef.current);
      }
    };
  }, [uniqueLastPost]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    navigate("/createPost", { state: { files } });
  };


  return (
    <>
      <div className="profile-banner-container">
        <button
          className="back-button"
          onClick={() => {
            navigate("/feeds");
          }}
        >
          <FaArrowLeft fontSize={20} />
        </button>
        {userDetails?.bannerURL ? (
          <img
            src={userDetails?.bannerURL}
            className="banner-image"
            alt="Banner"
          />
        ) : (
          <h1 className="add-cover-text">Add a cover pic</h1>
        )}

        <div className="profile-img-container">
          <img
            src={userDetails?.photoURL}
            className="profile-img"
            alt="Profile"
          />
        </div>
      </div>
      <div className="edit-profile-container">
        <button
          className="edit-profile-button"
          onClick={() => {
            navigate("/editProfile");
          }}
        >
          Edit Profile
        </button>
      </div>
      <div className="profile-info-container">
        <h1 className="user-name">{userDetails?.userName}</h1>
        {userDetails?.bio && <p className="bio">{userDetails.bio}</p>}

        <h2 className="my-posts">My Posts</h2>
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
        <div className="posts-container">
          {uniqueUserPosts.length > 0 &&
            uniqueUserPosts.map((eachPost, index) => (
              <div key={eachPost.id}>
                <ImageSlider eachPost={eachPost} />
              </div>
            ))}

          {uniqueHasMore && (
            <div ref={userLastPostRef} style={{ height: "1px" }} />
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
