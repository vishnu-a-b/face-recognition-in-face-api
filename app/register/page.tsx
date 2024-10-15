"use client";
import { useEffect, useState } from "react";
import * as faceapi from "face-api.js";

const Register = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const setupCamera = async () => {
      const video = document.getElementById("video") as HTMLVideoElement;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 720, height: 560 },
      });
      video.srcObject = stream;
    };

    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    };

    setupCamera();
    loadModels();
  }, []);

  const detectFace = async () => {
    const video = document.getElementById("video") as HTMLVideoElement;
    const options = new faceapi.TinyFaceDetectorOptions();
    const detections = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detections?.descriptor || null;
  };

  const registerFace = async () => {
    if (!name) {
      alert("Please enter a name");
      return;
    }

    const faceDescriptor = await detectFace();
    if (faceDescriptor) {
      const registeredFaces = JSON.parse(
        localStorage.getItem("registeredFaces") || "[]"
      );
      registeredFaces.push({ name, descriptor: Array.from(faceDescriptor) });
      localStorage.setItem("registeredFaces", JSON.stringify(registeredFaces));
      alert("Face registered successfully!");
    } else {
      alert("No face detected. Please try again.");
    }
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black px-6 sm:px-10 md:px-20 lg:px-24 pt-10 md:pt-16 min-h-screen">
      <h1 className="pl-4 md:pl-10 text-3xl md:text-4xl text-[#FBEFDD] text-center md:text-left">
        <span className="font-bold text-slate-400">N</span>ew{" "}
        <span className="font-bold text-slate-400">S</span>taff{" "}
        <span className="font-bold text-slate-400">R</span>egistration
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 mt-10 md:mt-16">
        {/* Video Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <video
            id="video"
            autoPlay
            muted
            className="w-full max-w-[550px] h-auto rounded-3xl shadow-lg"
          ></video>
        </div>

        {/* Form Section */}
        <div className="relative w-full max-w-[550px] shadow-lg rounded-3xl p-6 md:p-10 bg-black/40">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name for registration"
            className="w-full h-12 rounded-lg py-2 px-4 mb-4 text-black"
          />
          <button
            id="register"
            onClick={registerFace}
            className="w-full h-14 bg-white text-[20px] font-medium rounded-lg border border-black hover:scale-105 hover:shadow-lg transition-transform"
          >
            Register Face
          </button>
          <p className="text-sm mt-2 text-slate-100 text-center">
            *Please put your face in front of the webcam.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
