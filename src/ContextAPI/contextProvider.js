import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import React, { createContext, useEffect, useState } from "react";
import { db } from "../Firebase/config";

const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueUserPosts, setUniqueUserPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [uniqueHasMore, setUniqueHasMore] = useState(false);
  const [uniqueLastPost, setUniqueLastPost] = useState(null);

  const [feedHasMore, setFeedHasMore] = useState(false);
  const [feedLastPost, setFeedLastPost] = useState(null);

  const fetchInfo = async () => {
    let userUID = localStorage.getItem("userUID");
    try {
      const userRef = doc(db, "users", userUID);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserDetails(userDoc.data());
      } else {
        setUserDetails(null);
      }
    } catch (error) {
      setUserDetails(null);
      console.log("Error while fetching userinfo", error);
    } finally {
      setLoading(false);
    }
  };

  const size = 4;

  const fetchUniqueUserPosts = async () => {
    try {
      let userUID = localStorage.getItem("userUID");
      const postsRef = collection(db, "posts");

      const postsQuery = query(
        postsRef,
        where("userUID", "==", userUID),
        orderBy("timestamp", "desc"),
        limit(size)
      );

      const postsSnapshot = await getDocs(postsQuery);

      if (postsSnapshot.empty) {
        setUniqueUserPosts([]);
        setUniqueHasMore(false);
        return;
      }

      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUniqueUserPosts(posts);
      setUniqueLastPost(postsSnapshot.docs[postsSnapshot.docs.length - 1]);
      setUniqueHasMore(postsSnapshot.docs.length === size);
    } catch (error) {
      console.log("Error while fetching posts for user:", error);
      setUniqueUserPosts([]);
    }
  };

  const fetchMoreUniqueUserPosts = async () => {
    try {
      let userUID = localStorage.getItem("userUID");

      const postsRef = collection(db, "posts");

      const postsQuery = query(
        postsRef,
        where("userUID", "==", userUID),
        orderBy("timestamp", "desc"),
        startAfter(uniqueLastPost),
        limit(size)
      );

      const postsSnapshot = await getDocs(postsQuery);

      if (postsSnapshot.empty) {
        setUniqueHasMore(false);
        return;
      }

      const posts = postsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUniqueUserPosts((prev) => [...prev, ...posts]);
      setUniqueLastPost(postsSnapshot.docs[postsSnapshot.docs.length - 1]);
      setUniqueHasMore(postsSnapshot.docs.length === size);
    } catch (error) {
      console.log("Error while fetching more posts for user:", error);
    }
  };

  const batchSize = 5;
  const fetchAllPosts = async () => {
    try {
      const postsRef = collection(db, "posts");

      let postsQuery = query(
        postsRef,
        orderBy("timestamp", "desc"),
        limit(batchSize)
      );

      const postsSnapshot = await getDocs(postsQuery);

      if (postsSnapshot.empty) {
        setAllPosts([]);
        setFeedHasMore(false);
        return;
      }

      const posts = postsSnapshot.docs.map((postDoc) => ({
        id: postDoc.id,
        ...postDoc.data(),
        userUID: postDoc.data().userUID,
        name: postDoc.data().userName,
        photoURL: postDoc.data().photoURL,
      }));

      setAllPosts(posts);

      const lastPost = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setFeedLastPost(lastPost);

      setFeedHasMore(postsSnapshot.docs.length === batchSize);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setAllPosts([]);
    }
  };

  const fetchMoreAllPosts = async () => {
    try {
      const postsRef = collection(db, "posts");

      let postsQuery = query(
        postsRef,
        orderBy("timestamp", "desc"),
        startAfter(feedLastPost),
        limit(batchSize)
      );

      const postsSnapshot = await getDocs(postsQuery);

      if (postsSnapshot.empty) {
        setFeedHasMore(false);
        return;
      }

      const posts = postsSnapshot.docs.map((postDoc) => ({
        id: postDoc.id,
        ...postDoc.data(),
        userUID: postDoc.data().userUID,
        name: postDoc.data().userName,
        photoURL: postDoc.data().photoURL,
      }));

      setAllPosts((prevPosts) => [...prevPosts, ...posts]);

      const lastPost = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setFeedLastPost(lastPost);

      setFeedHasMore(postsSnapshot.docs.length === batchSize);
    } catch (error) {
      console.error("Error fetching more posts:", error);
      setAllPosts([]);
    }
  };

  useEffect(() => {
    fetchInfo();
    fetchUniqueUserPosts();
    fetchAllPosts();
  }, []);

  return (
    <DataContext.Provider
      value={{
        userDetails,
        setUserDetails,
        uniqueUserPosts,
        fetchInfo,
        fetchUniqueUserPosts,
        allPosts,
        uniqueHasMore,
        fetchMoreUniqueUserPosts,
        uniqueLastPost,
        fetchAllPosts,
        feedHasMore,
        fetchMoreAllPosts,
        feedLastPost,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, DataContext };
