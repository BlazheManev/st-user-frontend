import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceCommand: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after the first command is recognized
      recognition.interimResults = false; // We only want final results

      recognition.onresult = function (event: any) {
        console.log("SpeechRecognitionEvent received:", event); // Log the entire event
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();
        console.log("Command recognized:", command); // Log the recognized command
        handleCommand(command);
      };

      recognition.onerror = function (event: any) {
        console.error("Speech recognition error", event.error);
        alert(`Speech recognition error: ${event.error}`); // Show an alert with the error
      };

      document.getElementById("startVoiceCommand")?.addEventListener("click", function () {
        console.log("Voice command button clicked"); // Log button click
        recognition.start();
      });

      return () => {
        document.getElementById("startVoiceCommand")?.removeEventListener("click", function () {
          recognition.start();
        });
        recognition.abort();
      };
    } else {
      console.error("Speech Recognition API not supported in this browser.");
      alert("Speech Recognition API not supported in this browser.");
    }
  }, [navigate]);

  const handleCommand = (command: string) => {
    command = command.toLowerCase(); // Ensure command is in lower case
    console.log("Recognized command:", command); // Log the command to debug it

    if (command.includes("home")) {
      navigate("/");
      speak("Opening the home page.");
    } else if (command.includes("qr")) {
      navigate("/myQR");
      speak("Displaying your QR code.");
    } else if (command.includes("go to the calendar")) {
      navigate("/calendar");
      speak("Opening the calendar.");
    } else if (command.includes("install the app")) {
      document.getElementById("installButton")?.click(); // Simulate click on install button
      speak("Installing the app");
    } else {
      speak("Command not recognized, please try again.");
    }
  };

  const speak = (text: string) => {
    console.log("Speaking text:", text); // Log the text to be spoken
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  return (
    <button id="startVoiceCommand" className="btn btn-secondary">
      🎤 Voice Command
    </button>
  );
};

export default VoiceCommand;
