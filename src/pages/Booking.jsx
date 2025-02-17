import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DateTimeSelector from "../components/DateTimeSelector";
import { useAuthStore } from "../stores/authStore";
import dayjs from "dayjs";
import { Button, message, Spin } from "antd";
import { useAppointmentStore } from "../stores/appointmentStore";
import { useUserStore } from "../stores/userStore";
import {
  getPsychologistSpecializations,
  getPsychologistsBySpecialization,
} from "../utils/Helper";

const SUCCESS_PROP = {
  content: "Your submission was successful! Thank you!",
};

const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { CreateBooking } = useAppointmentStore();
  const { users, getAllUsers } = useUserStore();
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [formData, setFormData] = useState({
    specialization: "",
    timeSlotId: null,
    reason: "",
    psychologist: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getAllUsers();
      } catch (error) {
        console.error("Error fetching users:", error);
        message.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get list of specializations
  const specializations = useMemo(() => {
    if (!users || users.length === 0) return [];
    return getPsychologistSpecializations(users);
  }, [users]);

  // Get psychologists based on selected specialization
  const psychologists = useMemo(() => {
    if (!users || users.length === 0 || !selectedSpecialization) return [];
    return getPsychologistsBySpecialization(users, selectedSpecialization);
  }, [users, selectedSpecialization]);

  const validateFormData = () => {
    const newErrors = {};

    if (!formData.timeSlotId) {
      newErrors.timeSlotId = "Appointment time is required.";
    }

    if (formData.specialization.trim() === "") {
      newErrors.specialization = "Specialization selection is required.";
    }

    if (formData.psychologist.trim() === "") {
      newErrors.psychologist = "Psychologist selection is required.";
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms and conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetFormData = () => {
    setSelectedSpecialization("");
    return setFormData((prev) => ({
      ...prev,
      specialization: "",
      appointmentDate: dayjs().format("YYYY-MM-DD"),
      appointmentTime: "",
      reason: "",
      psychologist: "",
      consent: false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFormData()) {
      try {
        const bookingData = {
          userId: user.userId,
          timeSlotId: formData.timeSlotId,
          note: formData.reason || "No notes provided",
        };

        await CreateBooking(bookingData);
        message.success(SUCCESS_PROP);
        resetFormData();
      } catch (error) {
        message.error({
          content: "Failed to create booking. Please try again.",
        });
        console.error("Booking error:", error);
      }
    } else {
      console.log("Validation errors:", errors);
    }
  };

  useEffect(() => {
    setIsFormValid(validateFormData());
  }, [formData]); // Revalidate when formData changes

  const disabledButton = useMemo(() => !isFormValid, [isFormValid]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name === "specialization") {
      setSelectedSpecialization(value);
      // Reset psychologist selection when specialization changes
      setFormData((prev) => ({
        ...prev,
        psychologist: "",
      }));
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 general-wrapper">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 z-50 flex justify-center items-center">
            <Spin size="large" />
          </div>
        )}
        <div
          className={`max-w-7xl min-w-6xl mx-auto bg-white rounded-lg shadow-md p-8 mb-8 ${
            isLoading ? "pointer-events-none" : ""
          }`}>
          <h2 className="text-2xl font-bold text-custom-green mb-8 pb-2 border-b">
            Book an Appointment
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Appointment Details
            </h3>
            <div className="flex gap-16 flex-wrap flex-row">
              <div className="w-2/5 min-w-80 space-y-4 pt-6">
                {/* Specialization Selection */}
                <div>
                  <label
                    htmlFor="specialization"
                    className="block text-base font-medium text-gray-700 mb-4">
                    Select Specialization<span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialization"
                    id="specialization"
                    required
                    value={selectedSpecialization}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green">
                    <option value="" className="text-gray-400">
                      --- Select a Specialization ---
                    </option>
                    {specializations.map((spec, index) => (
                      <option key={index} value={spec}>
                        {spec}
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
                  selectedPsychologist={formData.psychologist}
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
                  I consent to the processing of my personal information and
                  agree to the terms of service.
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-green focus:outline-none"
                disabled={disabledButton}
                onClick={handleSubmit}>
                Book Appointment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
