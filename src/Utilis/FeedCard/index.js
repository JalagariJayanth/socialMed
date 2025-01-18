import React, { useState, useEffect } from "react";
import { FcLike, FcLikePlaceholder } from "react-icons/fc";
import { BiSolidNavigation } from "react-icons/bi";
import { FaCopy } from "react-icons/fa";
import "./index.css";
import ImageSlider from "../PostCard";
import {
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaDiscord,
  FaFacebookMessenger,
  FaTelegramPlane,
  FaTimes,
} from "react-icons/fa";
import { RiWhatsappFill } from "react-icons/ri";
import { GrReddit } from "react-icons/gr";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../Firebase/config";

const appLink = "https://socialmedia-vibesnap.onrender.com"
const socialMediaLinks = [
  {
    platform: "Twitter",
    backgroundColor: "#E9F6FB",
    platformIcon: <FaTwitter size={40} color="#03A9F4" />,
    platformUrl: `https://twitter.com/intent/tweet?url=${appLink}`,
  },
  {
    platform: "Facebook",
    backgroundColor: "#E7F1FD",
    platformIcon: <FaFacebook size={40} color="#1877F2" />,
    platformUrl: "https://www.facebook.com/sharer/sharer.php?u=POST_LINK",
  },
  {
    platform: "Reddit",
    backgroundColor: "#FDECE7",
    platformIcon: <GrReddit size={40} color="#FF5722" />,
    platformUrl: "https://www.reddit.com/submit?url=POST_LINK",
  },
  {
    platform: "Discord",
    backgroundColor: "#ECF5FA",
    platformIcon: <FaDiscord size={40} color="#6665D2" />,
    platformUrl: "https://discord.com/channels/@me",
  },
  {
    platform: "WhatsApp",
    backgroundColor: "#E7FBF0",
    platformIcon: <RiWhatsappFill size={40} color="#67C15E" />,
    platformUrl: `https://wa.me/?text=Check this out:${appLink}`,
  },
  {
    platform: "Messenger",
    backgroundColor: "#E5F3FE",
    platformIcon: <FaFacebookMessenger size={40} color="#1E88E5" />,
    platformUrl: "https://www.facebook.com/dialog/send?link=POST_LINK",
  },
  {
    platform: "Telegram",
    backgroundColor: "#E6F3FB",
    platformIcon: <FaTelegramPlane size={40} color="#1B92D1" />,
    platformUrl: "https://t.me/share/url?url=POST_LINK",
  },
  {
    platform: "Instagram",
    backgroundColor: "#FF40C617",
    platformIcon: <FaInstagram size={40} color="#E4405F" />,
    platformUrl: "https://www.instagram.com/sharer/sharer.php?u=POST_LINK",
  },
];



const FeedCard = ({ eachFeed }) => {
  const [liked, setLiked] = useState(false); 
  const [likes, setLikes] = useState(eachFeed.likes);
  const [showPopup, setShowPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  const userUID = localStorage.getItem("userUID"); 

  useEffect(() => {
  
    const checkUserLikeStatus = async () => {
      const postRef = doc(db, "posts", eachFeed.id); 

      try {
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          const postData = postDoc.data();
          if (postData[`likes_${userUID}`]) {
            setLiked(true);
          }
          setLikes(postData.likes);
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    checkUserLikeStatus();
  }, [eachFeed.id]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(appLink)
      .then(() => {
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000); 
      })
      .catch(() => setCopySuccess("Failed to copy!"));
  };

  const feedhandleLikeClick = async () => {
    const newLikedStatus = !liked; 
    const newLikesCount = newLikedStatus ? likes + 1 : likes - 1; 

    setLiked(newLikedStatus); 
    setLikes(newLikesCount); 

    const postRef = doc(db, "posts", eachFeed.id);

    try {
      await updateDoc(postRef, {
        likes: newLikesCount,
        [`likes_${userUID}`]: newLikedStatus, 
      });
    } catch (error) {
      console.error("Error updating like status in Firestore:", error);
    }
  };

  const getRelativeTime = (timestamp) => {
    const postDate = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  return (
    <div className="feedcard-container">
      <div className="feedcard-profile">
        <img src={eachFeed.photoURL} alt="profile" className="feedprofile" />
        <div className="feedcard-text">
          <p className="feedcard-name">{eachFeed.userName}</p>
          <p className="feedcard-time">{getRelativeTime(eachFeed.timestamp)}</p>
        </div>
      </div>
      <p className="feedcard-quote">{eachFeed.quote}</p>
      <div className="feedcard-slide-container">
        <ImageSlider
          eachPost={eachFeed}
          containerStyle={{
            width: "285px",
          }}
          showLikes={false}
        />
      </div>
      <div className="feed-bottom-container">
        <div className="feed-like-container" onClick={feedhandleLikeClick}>
          {liked ? (
            <FcLike className="like-icon" />
          ) : (
            <FcLikePlaceholder className="like-icon" />
          )}
          <span className="feed-like-count">{likes}</span>
        </div>
        <div onClick={() => setShowPopup(true)} className="share-container">
          <BiSolidNavigation size={20} />
          <p className="share-text">Share</p>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button
              className="popup-close-button"
              onClick={() => setShowPopup(false)}
            >
              <FaTimes size={16} />
            </button>
            <h1 className="share-post">Share this Post</h1>
            <section className="social-media-links">
              {socialMediaLinks.map((item, i) => {
                const postLink = encodeURIComponent("");
                const shareUrl = item.platformUrl.replace(
                  "POST_LINK",
                  postLink
                );
                return (
                  <div key={i} className="social-icon">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      style={{
                        backgroundColor: item.backgroundColor,
                      }}
                    >
                      <div
                        style={{
                          color: item?.iconColorCode,
                        }}
                      >
                        {item.platformIcon}
                      </div>
                    </a>
                    <p className="social-platform-name">{item.platform}</p>
                  </div>
                );
              })}
            </section>
            <p className="page-link-text">Page Link</p>

            <div className="container">
              <span className="text">{appLink}</span>
              <FaCopy
                onClick={handleCopy}
                className="copy-icon"
                size={20}
                color="#333"
              />
              {copySuccess && (
                <span className="success-message">{copySuccess}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedCard;
