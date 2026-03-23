"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function BookingModal() {
  const [doctor, setDoctor] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [bookingNo, setBookingNo] = useState<string | null>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [availability, setAvailability] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const listener = async (e: any) => {
      setDoctor(e.detail);
      setOpen(true);
      setBookingNo(null);
      setErrorMessage(null);
      setCopied(false);

      const res = await fetch("/api/doctor-availability", {
        cache: "no-store",
      });
      const data = await res.json();
      setAvailability(data);
    };

    window.addEventListener("open-booking", listener);
    return () => window.removeEventListener("open-booking", listener);
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          doctor: doctor.name,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error === "Doctor not available today") {
          setErrorMessage(
            "Doctor is not available today. Please try another doctor.",
          );
          return;
        }

        setErrorMessage("Booking failed. Please try again.");
        return;
      }

      if (result.bookingNo) {
        setBookingNo(result.bookingNo);
        setPatientData(data);

        const tokenNumber = parseInt(result.bookingNo.split("-")[1]);
        const wait = (tokenNumber - 1) * 5;
        setEstimatedWait(wait);

        // Fire event so OPD queue auto-fills this token
        window.dispatchEvent(
          new CustomEvent("booking-confirmed", {
            detail: { token: result.bookingNo, doctor: doctor.name },
          }),
        );

        reset();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (bookingNo) {
      navigator.clipboard.writeText(bookingNo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToQueue = () => {
    setOpen(false);
    setBookingNo(null);
    setTimeout(() => {
      const queueSection = document.getElementById("opd-queue");
      if (queueSection) {
        queueSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (!open) return null;

  const whatsappNumber = patientData?.whatsapp || patientData?.phone;

  const whatsappMessage = `Patil Multispeciality Hospital\n\nAppointment Confirmed ✅\n\nToken: ${bookingNo}\nDoctor: ${doctor?.name}\nPatient: ${patientData?.name}\n\nTo check live queue: ${typeof window !== "undefined" ? window.location.origin : ""}\nLook for "Live OPD Queue" and enter your token ${bookingNo} to see your position.`;

  const whatsappURL = `https://api.whatsapp.com/send?phone=91${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;

  const doctorAvailable = availability[doctor?.name] ?? true;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-[400px] overflow-hidden">
        {/* HEADER */}
        <div className="bg-primary px-6 py-4">
          <h2 className="text-white font-semibold text-lg">
            {bookingNo ? "Booking Confirmed" : `Book with ${doctor?.name}`}
          </h2>
        </div>

        <div className="p-6">
          {/* BOOKING FORM */}
          {!bookingNo && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {!doctorAvailable && (
                <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
                  Doctor is not available today
                </p>
              )}

              {errorMessage && (
                <p className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded">
                  {errorMessage}
                </p>
              )}

              <input
                {...register("name")}
                placeholder="Patient Name"
                required
                className="w-full border rounded p-2 text-sm"
              />

              <input
                {...register("phone")}
                placeholder="Phone Number"
                required
                className="w-full border rounded p-2 text-sm"
              />

              <input
                {...register("whatsapp")}
                placeholder="WhatsApp Number (optional)"
                className="w-full border rounded p-2 text-sm"
              />

              <p className="text-xs text-gray-400">
                Enter WhatsApp number to receive your token on WhatsApp.
              </p>

              <button
                type="submit"
                disabled={loading || !doctorAvailable}
                className={`w-full p-2.5 rounded text-white font-semibold ${
                  doctorAvailable
                    ? "bg-primary"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          )}

          {/* CONFIRMATION SCREEN */}
          {bookingNo && (
            <div className="space-y-4">
              {/* BIG TOKEN */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                  Your Token Number
                </p>

                <p className="text-5xl font-black text-blue-600 tracking-wider">
                  {bookingNo}
                </p>

                <button
                  onClick={handleCopy}
                  className="mt-3 text-xs text-blue-500 underline"
                >
                  {copied ? "✅ Copied!" : "Tap to copy"}
                </button>
              </div>

              {/* REMEMBER BOX */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-yellow-800">
                  📌 Remember this number!
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Visit this website and check "Live OPD Queue" to see which
                  token is being called. Come when your turn is near.
                </p>
              </div>

              {/* DETAILS */}
              <div className="text-sm space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Doctor</span>
                  <span className="font-medium">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Patient</span>
                  <span className="font-medium">{patientData?.name}</span>
                </div>
                {estimatedWait !== null && estimatedWait > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Est. Wait</span>
                    <span className="font-medium text-blue-600">
                      ~{estimatedWait} min
                    </span>
                  </div>
                )}
              </div>

              {/* CHECK QUEUE BUTTON */}
              <button
                onClick={scrollToQueue}
                className="w-full border-2 border-blue-600 text-blue-600 py-2.5 rounded-lg font-semibold text-sm"
              >
                👁 Check Live Queue Now
              </button>

              {/* WHATSAPP */}
              {whatsappNumber && (
                <a
                  href={whatsappURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-500 text-white py-2.5 rounded-lg text-center font-semibold text-sm"
                >
                  📲 Send Token to WhatsApp
                </a>
              )}
            </div>
          )}

          <button
            onClick={() => {
              setOpen(false);
              setBookingNo(null);
              setErrorMessage(null);
            }}
            className="mt-4 text-sm text-gray-400 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
