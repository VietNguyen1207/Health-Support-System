import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimeSelector from "../components/DateTimeSelector";
import psychologistData from "../data/psychologist.json";

const Booking = () => {
  const navigate = useNavigate();
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
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

  // Get list of specialities
  const specialities = Object.keys(psychologistData).map((key) => ({
    id: key,
    name: key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  }));

  // Get psychologists based on selected speciality
  const psychologists = selectedSpeciality
    ? psychologistData[selectedSpeciality]
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    // Add your submission logic here
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "speciality") {
      setSelectedSpeciality(value);
      // Reset psychologist selection when speciality changes
      setFormData((prev) => ({
        ...prev,
        psychologist: "",
      }));
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const selectedPsychologistData = psychologists.find(
    (p) => p.id === parseInt(formData.psychologist)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 general-wrapper">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-custom-green mb-8 pb-2 border-b">
          Book an Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Appointment Details
          </h3>
          <div className="flex gap-4">
            <div className="space-y-4 pt-6 flex-1">
              {/* Speciality Selection */}
              <div>
                <label
                  htmlFor="speciality"
                  className="block text-base font-medium text-gray-700 mb-4">
                  Select Speciality<span className="text-red-500">*</span>
                </label>
                <select
                  name="speciality"
                  id="speciality"
                  required
                  value={selectedSpeciality}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green">
                  <option value="" className="text-gray-400">
                    --- Select a speciality ---
                  </option>
                  {specialities.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Psychologist Selection */}
              <div>
                <label
                  htmlFor="psychologist"
                  className="block text-base font-medium text-gray-700 mb-4">
                  Select Psychologist<span className="text-red-500">*</span>
                </label>
                <select
                  name="psychologist"
                  id="psychologist"
                  required
                  value={formData.psychologist}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green">
                  <option value="" className="text-gray-400">
                    --- Select a psychologist ---
                  </option>
                  {psychologists.map((psych) => (
                    <option key={psych.id} value={psych.id}>
                      {psych.name} - {psych.experience}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-base font-medium text-gray-700 mb-4">
                  Reason for Appointment
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={4}
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green"
                  placeholder="Please briefly describe your reason for seeking consultation..."
                />
              </div>
            </div>

            <div className="w-1/2">
              <DateTimeSelector
                selectedPsychologist={selectedPsychologistData}
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
                className="form-checkbox h-4 w-4"
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
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-green hover:bg-custom-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-green">
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
