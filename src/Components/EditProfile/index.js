import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { DataContext } from "../../ContextAPI/contextProvider";
import { HiPencil } from "react-icons/hi";
import "./index.css";
import { db } from "../../Firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../../Cloudinary/upload";

const EditProfile = () => {
  const navigate = useNavigate();
  const { userDetails, fetchInfo } = useContext(DataContext);
  const userUID = localStorage.getItem("userUID");
  const [userInfo, setUserInfo] = useState({
    name: userDetails?.userName,
    bio: userDetails?.bio || "",
    photoURL: userDetails?.photoURL,
    bannerURL: "",
  });


  const [tempImageURLs, setTempImageURLs] = useState({
    photoURL: "",
    bannerURL: "",
  });

  const handleFileInput = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const tempURL = URL.createObjectURL(file);
      setTempImageURLs((prev) => ({
        ...prev,
        [type]: tempURL,
      }));
      setUserInfo((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const handleSaveUser = async () => {
    try {
      let uploadedPhotoURL = userInfo.photoURL;

      if (
        userInfo.photoURL &&
        userInfo.photoURL.name &&
        userInfo.photoURL.size !== undefined
      ) {
        uploadedPhotoURL = await uploadToCloudinary(
          userInfo.photoURL,
          false,
          userUID,
          "photoURL"
        );
      }

      let uploadedBannerURL = userDetails.bannerURL;
      if (
        userInfo.bannerURL &&
        userInfo.bannerURL.name &&
        userInfo.bannerURL.size !== undefined
      ) {
        uploadedBannerURL = await uploadToCloudinary(
          userInfo.bannerURL,
          false,
          userUID,
          "bannerURL"
        );
      }

      const userRef = doc(db, "users", userUID);
      const newData = {
        userName: userInfo.name,
        bio: userInfo.bio,
        photoURL: uploadedPhotoURL,
        bannerURL: uploadedBannerURL,
      };
      await updateDoc(userRef, newData);
      fetchInfo();
      navigate("/profile");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <>
      <div className="profile-banner-container">
        <button
          className="back-button"
          onClick={() => {
            navigate("/profile");
          }}
        >
          <FaArrowLeft fontSize={20} />
        </button>
        {tempImageURLs.bannerURL || userDetails?.bannerURL ? (
          <img
            src={tempImageURLs.bannerURL || userDetails.bannerURL}
            className="banner-image"
            alt="Banner"
          />
        ) : (
          <h1 className="add-cover-text">Add a cover pic</h1>
        )}

        <div
          onClick={() => document.getElementById("bannerFile").click()}
          className="edit-bannerimg-container"
        >
          <HiPencil fontSize={22} />
        </div>

        <input
          id="bannerFile"
          type="file"
          accept="image/*"
          className="bannerHideInput"
          onChange={(e) => handleFileInput(e, "bannerURL")}
        />

        <input
          id="profilFile"
          type="file"
          accept="image/*"
          className="bannerHideInput"
          onChange={(e) => handleFileInput(e, "photoURL")}
        />

        <div className="profile-img-container">
          <img
            src={tempImageURLs.photoURL || userDetails?.photoURL}
            className="profile-img"
            alt="Profile"
          />
          <div
            onClick={() => document.getElementById("profilFile").click()}
            className="edit-container"
          >
            <HiPencil fontSize={22} />
          </div>
        </div>
      </div>

      <div className="profile-edit-input-container">
        <p className="edit-profile-name">Name</p>
        <input
          value={userInfo.name}
          type="text"
          className="edit-inputs"
          onChange={(e) =>
            setUserInfo((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />

        <p className="edit-profile-name">Bio</p>
        <textarea
          value={userInfo.bio}
          className="edit-inputs"
          rows="3"
          cols="50"
          onChange={(e) =>
            setUserInfo((prev) => ({
              ...prev,
              bio: e.target.value,
            }))
          }
        />
      </div>
      <div className="save-button">
        <button onClick={handleSaveUser} className="save-button-prop">
          Save
        </button>
      </div>
    </>
  );
};

export default EditProfile;
