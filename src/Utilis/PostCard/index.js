import React, { useState, useEffect } from "react";
import { FcLike, FcLikePlaceholder } from "react-icons/fc"; 
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import Slider from "react-slick";
import "./index.css";
import { db } from "../../Firebase/config";

const ImageSlider = ({ eachPost, containerStyle = {}, showLikes = true }) => {
  const [liked, setLiked] = useState(false); 
  const [likes, setLikes] = useState(eachPost.likes); 
  const userUID = localStorage.getItem("userUID"); 

  useEffect(() => {
    const checkUserLikeStatus = async () => {
      const postRef = doc(db, "posts", eachPost.id); 

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
  }, [eachPost.id, userUID]); 

  const handleLikeClick = async () => {
    const newLikedStatus = !liked; 
    const newLikesCount = newLikedStatus ? likes + 1 : likes - 1; 

    setLiked(newLikedStatus); 
    setLikes(newLikesCount); 
    const postRef = doc(db, "posts", eachPost.id); 

    try {
     
      await updateDoc(postRef, {
        likes: newLikesCount,
        [`likes_${userUID}`]: newLikedStatus, 
      });
    } catch (error) {
      console.error("Error updating like status in Firestore:", error);
    }
  };


  const settings = () => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
  });

  const renderMedia = (url, index) => {
    if (url.endsWith(".mp4")) {
      return (
        <video key={index} controls src={url} className="post-media-item" />
      );
    } else {
      return (
        <img
          key={index}
          src={url}
          alt={`media-${index}`}
          className="post-media-item"
        />
      );
    }
  };

  return (
    <div style={{ ...containerStyle }} className="post-slider-container">
      {eachPost.mediaURLs.length > 1 ? (
        <Slider {...settings()}>
          {eachPost.mediaURLs.map((url, index) => (
            <div key={index} className="post-media-slide">
              {renderMedia(url, index)}
              {showLikes && (
                <div className="like-container" onClick={handleLikeClick}>
                  {liked ? (
                    <FcLike className="like-icon" />
                  ) : (
                    <FcLikePlaceholder className="like-icon" />
                  )}
                  <span className="like-count">{likes}</span>{" "}
                </div>
              )}
            </div>
          ))}
        </Slider>
      ) : (
        <div className="post-media-slide">
          {renderMedia(eachPost.mediaURLs[0], 0)}
          {showLikes && (
            <div className="like-container" onClick={handleLikeClick}>
              {liked ? (
                <FcLike className="like-icon" />
              ) : (
                <FcLikePlaceholder className="like-icon" />
              )}
              <span className="like-count">{likes}</span>{" "}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
