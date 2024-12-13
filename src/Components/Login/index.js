import { useContext, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../Firebase/config";
import "./index.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../../ContextAPI/contextProvider";

const Login = () => {
  const navigate = useNavigate();
  const { fetchInfo } = useContext(DataContext);

  const images = [
    "/images/image1.png",
    "/images/image2.png",
    "/images/image3.png",
    "/images/image4.png",
    "/images/image5.png",
    "/images/image6.png",
    "/images/image7.png",
    "/images/image8.png",
    "/images/image9.png",
  ];

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loginUser = result.user;

      const user = {
        userName: loginUser.displayName,
        email: loginUser.email,
        photoURL: loginUser.photoURL,
        uid: loginUser.uid,
      };

      const userRef = doc(db, "users", loginUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, user);
      }
      localStorage.setItem("userUID", loginUser.uid);
      fetchInfo();
      navigate("/feeds");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="login-grid-container">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`image-${index + 1}`}
            className={`image-${index + 1}`}
          />
        ))}
      </div>
      <div className="footer">
        <div className="logo-container">
          <img src="/images/logo.png" alt="logo" className="logo" />
          <h1 className="logo-name">Vibesnap</h1>
        </div>

        <p className="tagline">Moments That Matter, Shared Forever.</p>
        <button onClick={handleGoogleLogin} className="google-button">
          <img src="/images/google.png" alt="google" className="google-logo" />
          Continue with Google
        </button>
      </div>
    </>
  );
};

export default Login;
