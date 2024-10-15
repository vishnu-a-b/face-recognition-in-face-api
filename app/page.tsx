"use client";
import { useEffect } from "react";
import * as faceapi from "face-api.js";

interface FaceDescriptor {
  name: string;
  descriptor: number[];
}

interface AttendanceRecord {
  name: string;
  date: string;
  time: string;
}

const Home = () => {
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

  const recognizeFace = async () => {
    const faceDescriptor = await detectFace();
    if (faceDescriptor) {
      const registeredFaces: FaceDescriptor[] = JSON.parse(
        localStorage.getItem("registeredFaces") || "[]"
      );
      const labeledDescriptors = registeredFaces.map(
        (f) =>
          new faceapi.LabeledFaceDescriptors(f.name, [
            new Float32Array(f.descriptor),
          ])
      );
      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
      const bestMatch = faceMatcher.findBestMatch(faceDescriptor);

      if (bestMatch.label !== "unknown") {
        markAttendance(bestMatch.label);
        alert(`Face recognized! Attendance marked for ${bestMatch.label}.`);
      } else {
        alert("Face not recognized.");
      }
    }
  };

  const markAttendance = (name: string) => {
    const attendanceRecords: AttendanceRecord[] = JSON.parse(
      localStorage.getItem("attendanceRecords") || "[]"
    );
    const date = new Date().toLocaleDateString("en-IN");
    const time = new Date().toLocaleTimeString("en-IN");
    attendanceRecords.push({ name, date, time });
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(attendanceRecords)
    );
  };

  const exportAttendance = () => {
    const attendanceRecords: AttendanceRecord[] = JSON.parse(
      localStorage.getItem("attendanceRecords") || "[]"
    );
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Date,Time"]
        .concat(
          attendanceRecords.map(
            (record) => `${record.name},${record.date},${record.time}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black px-6 sm:px-10 md:px-20 pt-10 md:pt-16 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mt-10 md:mt-16">
        {/* Video Section */}
        <div className="w-full md:w-1/2 flex justify-center">
          <video
            id="video"
            autoPlay
            muted
            className="w-full max-w-[550px] h-auto rounded-3xl bg-slate-600 shadow-lg shadow-slate-500 border border-slate-400"
          ></video>
        </div>

        {/* Action Section */}
        <div className="relative w-full max-w-[550px] h-auto md:h-[450px] bg-black/40 shadow-lg rounded-3xl p-6 md:p-10">
          <button
            id="recognize"
            onClick={recognizeFace}
            className="w-full h-14 bg-gray-100 text-lg md:text-xl font-medium border border-gray-300 rounded-lg hover:scale-105 hover:shadow-lg transition-transform mt-4"
          >
            Click for Attendance
          </button>
          <p className="text-sm mt-2 text-slate-100 text-center">
            *Please put your face in front of the webcam.
          </p>

          {/* Action Buttons at Bottom */}
          <div className="pt-10 flex gap-4">
            <button className="py-2 px-4 bg-gray-200 font-medium rounded-lg border-black hover:scale-105 hover:shadow-lg transition-transform">
              <a href="/register">Register Face</a>
            </button>
            <button
              id="export"
              onClick={exportAttendance}
              className="py-2 px-4 bg-gray-200 font-medium rounded-lg border-black hover:scale-105 hover:shadow-lg transition-transform"
            >
              Export Attendance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
