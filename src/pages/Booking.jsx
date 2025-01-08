import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Booking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    psychologist: "",
    consent: false,
  });

  // Sample psychologist list
  const psychologists = [
    { id: 1, name: "Dr. Sarah Johnson", speciality: "Anxiety & Depression" },
    { id: 2, name: "Dr. Michael Chen", speciality: "Trauma & PTSD" },
    { id: 3, name: "Dr. Emily Williams", speciality: "Student Counseling" },
    { id: 4, name: "Dr. David Kim", speciality: "Stress Management" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    // Add your submission logic here
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-custom-green mb-8 pb-2 border-b">
          Book an Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appointment Details Section */}
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Appointment Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="appointmentDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  id="appointmentDate"
                  required
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="appointmentTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  id="appointmentTime"
                  required
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="psychologist"
                className="block text-sm font-medium text-gray-700"
              >
                Preferred Psychologist
              </label>
              <select
                name="psychologist"
                id="psychologist"
                required
                value={formData.psychologist}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a psychologist</option>
                {psychologists.map((psych) => (
                  <option key={psych.id} value={psych.id}>
                    {psych.name} - {psych.speciality}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700"
              >
                Reason for Appointment
              </label>
              <textarea
                name="reason"
                id="reason"
                rows={4}
                required
                value={formData.reason}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Please briefly describe your reason for seeking consultation..."
              />
            </div>
          </div>

          {/* Consent Section */}
          <div className="pt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                required
                className="form-checkbox text-blue-600 h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-600">
                I consent to the processing of my personal information and agree
                to the terms of service.
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-green hover:bg-custom-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green"
            >
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
