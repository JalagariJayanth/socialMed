export const uploadToCloudinary = (file, isVideo = false, userId, type) => {
  return new Promise((resolve, reject) => {
    const resourceType = isVideo ? "video" : "image";

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vibesnap");
    formData.append("public_id", `${type}/${uniqueId}`);

    fetch(`https://api.cloudinary.com/v1_1/dau2bi3nn/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.secure_url) {
          console.log("Uploaded successfully:", data);
          resolve(data.secure_url);
        } else {
          reject(new Error("Upload failed: No secure URL returned"));
        }
      })
      .catch((error) => {
        console.error("Error uploading:", error);
        reject(error);
      });
  });
};
