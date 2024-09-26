"use client";
import { useAuth } from "@/guards/auth.guard";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import "./style.scss";

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const Page = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [data, setData] = useState<any>(null); // Changed to 'any' to handle dynamic data
  const { token } = useAuth();

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
        //console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("finger_data", (receivedData) => {
        //console.log("Received data:", receivedData); // Debugging to see if data is received
        setData(receivedData);
      });

      // Set the socket state
      setSocket(newSocket);

      // Cleanup on component unmount
      return () => {
        newSocket.disconnect(); // Ensure socket disconnects properly
      };
    }
  }, [token]); // Only run when 'token' changes

  return (
    <section id="socketConnect">
      <div className="data">
        {socket ? (
          data ? (
            JSON.stringify(data)
          ) : (
            <p className="red">Waiting for data...</p>
          )
        ) : (
          <p className="yellow">Connecting...</p>
        )}
      </div>
    </section>
  );
};

export default Page;
