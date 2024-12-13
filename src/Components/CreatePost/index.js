import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import "./index.css";
import { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../Firebase/config";
import { uploadToCloudinary } from "../../Cloudinary/upload";
import { DataContext } from "../../ContextAPI/contextProvider";

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const files = location.state?.files || [];
  const [previews, setPreviews] = useState([]);
  const [quote, setQuote] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const { fetchUniqueUserPosts, fetchAllPosts, userDetails } =
    useContext(DataContext);
  const [dataUploading, setDataUploading] = useState(false);

  useEffect(() => {
    const generatedPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type, 
    }));
    setPreviews(generatedPreviews);
    setMediaFiles(files);
  }, [files]);

  const userUID = localStorage.getItem("userUID");

  const renderMedia = (file, index) => {
    if (file?.type.startsWith("image/")) {
      return (
        <img src={file.url} alt={`media-${index}`} className="media-item" />
      );
    } else if (file?.type.startsWith("video/")) {
      return (
        <video
          controls
          src={file.url}
          alt={`media-video-${index}`}
          className="media-item"
        />
      );
    }
  };

  const handleCreatePost = async () => {
    setDataUploading(true);
    try {
      const mediaURLs = await Promise.all(
        mediaFiles.map(async (file) => {
          const isVideo = file.type.startsWith("video");
          const mediaURL = await uploadToCloudinary(
            file,
            isVideo,
            userUID,
            "postMedia"
          );
          return mediaURL;
        })
      );

      const newPost = {
        quote: quote,
        mediaURLs: mediaURLs,
        timestamp: serverTimestamp(),
        likes: 0,
        userUID: userUID,
        photoURL: userDetails.photoURL,
        userName: userDetails.userName,
      };

      const postsRef = collection(db, "posts");
      await addDoc(postsRef, newPost);

      fetchUniqueUserPosts();
      fetchAllPosts();
      navigate("/profile");
    } catch (error) {
      console.log(error);
    } finally {
      setDataUploading(false);
    }
  };

  return (
    <div className="newpost-head-container">
      <button
        className="back-button"
        onClick={() => {
          navigate("/profile");
        }}
      >
        <FaArrowLeft fontSize={20} />
      </button>
      <h1 className="newPost-text">New Post</h1>

    
      <div className="newPost-input-container">
        {previews.length > 1 ? (
          <Slider
            dots={true} 
            infinite={true}
            speed={500}
            slidesToShow={1}
            slidesToScroll={1}
            autoplay={true} 
            centerMode={false}
          >
            {previews.map((preview, index) => (
              <div key={index} className="media-slide">
                {renderMedia(preview, index)}{" "}
               
              </div>
            ))}
          </Slider>
        ) : (
          <div className="media-slide">
            {renderMedia(previews[0], 0)} 
          </div>
        )}
      </div>

      <div className="textarea-container">
        <textarea
          className="edit-inputs"
          rows="3"
          cols="50"
          placeholder="Add a quote"
          onChange={(e) => setQuote(e.target.value)}
          value={quote}
        />
      </div>

      <div className="create-button">
        <button
          disabled={dataUploading}
          onClick={handleCreatePost}
          className="save-button-prop"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
