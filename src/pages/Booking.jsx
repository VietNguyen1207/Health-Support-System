import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimeSelector from "../components/DateTimeSelector";
import psychologistData from "../data/psychologist.json";
import { useAuthStore } from "../stores/authStore";
import dayjs from "dayjs";
import { Button, message } from "antd";

const SUCCESS_PROP = {
  content: "Your submission was successful! Thank you!",
  duration: 2000,
};

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [formData, setFormData] = useState({
    fullName: user?.name,
    dateOfBirth: user?.dateOfBirth,
    gender: user?.gender,
    phoneNumber: user?.phoneNumber,
    appointmentDate: dayjs().format("YYYY-MM-DD"),
    appointmentTime: "",
    reason: "",
    psychologist: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Get list of specialities
  const specialities = Object.keys(psychologistData)?.map((key) => ({
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

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = "Appointment date is required.";
    }

    if (formData.appointmentTime === "") {
      newErrors.appointmentTime = "Appointment time is required.";
    }

    if (formData.psychologist.trim() === "") {
      newErrors.psychologist = "Psychologist selection is required.";
    }

    if (formData.consent === "") {
      newErrors.consent = "You must agree to the terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    return setFormData((prev) => ({
      ...prev,
      appointmentDate: dayjs().format("YYYY-MM-DD"),
      appointmentTime: "",
      reason: "",
      psychologist: "",
      consent: false,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateFormData()) {
      console.log("Booking submitted:", formData);
      message.success(SUCCESS_PROP);
      resetFormData();
    } else {
      console.log("Validation errors:", errors);
    }
  };
  useEffect(() => {
    setIsFormValid(validateFormData());
  }, [formData]); // Revalidate when formData changes

  const disabledButton = useMemo(() => !isFormValid, [isFormValid]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "speciality") {
      setSelectedSpeciality(value);
      // Reset psychologist selection when speciality changes
      setFormData((prev) => ({
        ...prev,
        psychologist: "",
        appointmentDate: dayjs().format("YYYY-MM-DD"),
        appointmentTime: "",
      }));
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const selectedPsychologistData = psychologists?.find(
    (p) => p.id === parseInt(formData.psychologist)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 general-wrapper">
      <div className="max-w-7xl min-w-6xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-custom-green mb-8 pb-2 border-b">
          Book an Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">
            Appointment Details
          </h3>
          <div className="flex gap-16 flex-wrap flex-row">
            <div className="w-2/5 min-w-80 space-y-4 pt-6">
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
                  Reason for Appointment (Optional)
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={4}
                  // required
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green"
                  placeholder="Please briefly describe your reason for seeking consultation..."
                />
              </div>
            </div>

            <div className="w-3/5 flex-1">
              <DateTimeSelector
                selectedPsychologist={selectedPsychologistData}
                setFormData={setFormData}
                formData={formData}
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
              onClick={() => {
                resetFormData();
                navigate(-1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <Button
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-green hover:bg-custom-green/90 focus:outline-none"
              disabled={disabledButton}>
              Book Appointment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Booking;
