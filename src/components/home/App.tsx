"use client";

import "./style.scss";
import appDB from "@/database/appDS";
import { useGesture } from "@use-gesture/react";
import { useEffect, useRef, useState } from "react";

import { BiLogOutCircle } from "react-icons/bi";
import { useAuth } from "@/guards/auth.guard";
import { FingersType } from "@/types/types";
import { io, Socket } from "socket.io-client";
import { setFinger } from "@/api/users-api";
const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<{
    name: string;
    aadhar_number: string;
    fingers: FingersType[];
  }>({
    name: "",
    aadhar_number: "",
    fingers: [],
  });
  const [loading, setLoading] = useState(true); // Add loading state
  const [count, setImageIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [scale, setScale] = useState({ scale: 1 });
  const [settings, setSettings] = useState<boolean>(false);
  const [lockedScale, setLockedScale] = useState<number | null>(null);
  const [Primary, setPrimary] = useState("1");
  const { token, logout } = useAuth();
  const [imageLoading, setImageLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (token) {
      // Initialize the socket connection
      const newSocket = io(BackendUrl?.split("/api")[0] ?? "", {
        extraHeaders: {
          token,
        },
      });

      // Set up listeners for 'finger' event
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      const extractNumber = (primary: string | null): number => {
        if (primary && primary.startsWith("FD-")) {
          return parseInt(primary.substring(3), 10);
        }
        return Number.MAX_SAFE_INTEGER; // Place items with non-numeric primary at the end
      };

      newSocket.on(
        "finger_data",
        (receivedData: {
          data: {
            name: string;
            aadhar_number: string;
            fingers: FingersType[];
          };
        }) => {
          console.log("Received data:", receivedData);
          const sortedData = receivedData.data.fingers.toSorted(
            (a, b) => extractNumber(a.primary) - extractNumber(b.primary)
          );
          setData({ ...receivedData.data, fingers: sortedData });
          setLoading(false);
        }
      );

      // Set the socket state
      setSocket(newSocket);

      // Cleanup on component unmount
      return () => {
        newSocket.disconnect(); // Ensure socket disconnects properly
      };
    }
  }, [token]);

  useGesture(
    {
      onPinch: ({ offset: [d] }) => {
        if (lockedScale !== null) return;
        const newScale = Math.min(Math.max(1 + d / 5, 1), 2);
        setScale({ scale: newScale });
      },
    },
    {
      target: imageRef,
      eventOptions: { passive: false },
    }
  );

  const handlePrev = () => {
    if (data) {
      setImageLoading(true);
      setImageIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : data.fingers.length - 1
      );
      setLockedScale(data.fingers[count].scale);
    }
  };

  const handleNext = () => {
    if (data) {
      setImageLoading(true);
      setImageIndex((prevIndex) =>
        prevIndex < data.fingers.length - 1 ? prevIndex + 1 : 0
      );
      setLockedScale(data.fingers[count].scale);
    }
  };

  const toggleSettings = () => {
    setSettings(!settings);
  };

  const handleLockScale = () => {
    if (lockedScale === null) {
      setLockedScale(scale.scale);
    } else {
      setLockedScale(null);
    }
  };
  const handlesetScaleBtn = async () => {
    try {
      await setFinger(
        {
          primary:
            Primary == "1"
              ? data.fingers[count].primary ?? ""
              : "FD-" + Primary,
          scale: scale.scale,
        },
        data.fingers[count].id.toString(),
        token ?? ""
      );
      data.fingers[count].scale = scale.scale;
    } catch (e) {
      console.log(e);
    } finally {
      setScale({ scale: data.fingers[count].scale });

      setLockedScale(scale.scale);
    }
  };
  useEffect(() => {
    setLockedScale(data.fingers.length != 0 ? data.fingers[count].scale : 1);
  }, [data, count]);
  return (
    <>
      <section id="logout">
        <button onClick={() => logout()}>
          <BiLogOutCircle /> Logout
        </button>
      </section>

      {loading ? ( // Show loading state while waiting for data
        <section id="home">
          <div className="box">
            <p className="loading">Loading data...</p>
          </div>
        </section>
      ) : data.fingers.length !== 0 ? (
        <section id="home">
          <div className="img-container">
            <div className="image" ref={imageRef}>
              <img
                src={`${BackendUrl?.split("/api")[0] ?? ""}/finger/image/${
                  data.fingers[count].id
                }`}
                crossOrigin="anonymous"
                alt="finger"
                style={{
                  transform: `scale(${
                    lockedScale !== null
                      ? data.fingers[count].scale
                      : scale.scale
                  })`,
                }}
              />
            </div>
          </div>
          <div className="info">
            <div className="user">
              <p>Name: {data.name}</p>
              <p>ID: {data.aadhar_number}</p>
            </div>
            <div className="numbers">
              <p>FD: {data.fingers[count].primary}</p>
              <p>Scale: {data.fingers[count].scale}</p>
            </div>
          </div>
          <div className="button-container">
            <div className="settings">
              <div className="settings-btn">
                <div className="left">
                  <p>Unlock Scale</p>
                  <button
                    onClick={toggleSettings}
                    className={settings ? "green" : ""}
                  >
                    <div className={`dot ${settings ? "active" : ""}`} />
                  </button>
                </div>
                <div className="column">
                  <p className="scale-locked">
                    Scale: {lockedScale?.toFixed(3)}
                  </p>
                  <p>Priority:</p>
                  <div className="priority">
                    <select
                      name="primary"
                      onChange={(e) => setPrimary(e.target.value)}
                      value={Primary}
                      disabled={!settings}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                    <button
                      onClick={async () => {
                        try {
                          await setFinger(
                            { primary: "FD-" + Primary, scale: scale.scale },
                            data.fingers[count].id.toString(),
                            token ?? ""
                          );
                        } catch (e) {
                          console.log(e);
                        }
                      }}
                      className="priority-set"
                      disabled={!settings}
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
              <div className="scale-buttons">
                <button
                  className={`lock-settings ${
                    lockedScale === null ? "green" : ""
                  }`}
                  disabled={!settings}
                  onClick={handleLockScale}
                >
                  {lockedScale === null ? "Lock Scale" : "Unlock Scale"}
                </button>
                <button
                  className="set-scale"
                  disabled={!settings}
                  onClick={handlesetScaleBtn}
                >
                  Set Scale
                </button>
              </div>
            </div>
            <div className="change">
              <button onClick={handlePrev}>Previous</button>
              <button onClick={handleNext}>Next</button>
            </div>
          </div>
        </section>
      ) : (
        <section id="home">
          <div className="box">
            <p className="wait">Waiting for server</p>
          </div>
        </section>
      )}
    </>
  );
};

export default App;
