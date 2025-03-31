import { useCallback, useEffect, useMemo, useState, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DateTimeSelector from "../components/DateTimeSelector";
import { useAuthStore } from "../stores/authStore";
import {
  Button,
  Spin,
  notification,
  Select,
  Avatar,
  Card,
  Empty,
  Divider,
  Tag,
} from "antd";
import { useAppointmentStore } from "../stores/appointmentStore";
// import { useUserStore } from "../stores/userStore";
import PropTypes from "prop-types";
import { getPsychologistSpecializations } from "../utils/Helper";
import { usePsychologistStore } from "../stores/psychologistStore";
import {
  UserOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

// Memoized form components to prevent unnecessary re-renders
const SpecializationSelect = memo(
  ({ specializations, selectedSpecialization, onChange, error }) => (
    <div>
      <label
        htmlFor="specialization"
        className="block text-base font-medium text-gray-700 mb-4"
      >
        Select Specialization<span className="text-red-500">*</span>
      </label>
      <select
        name="specialization"
        id="specialization"
        required
        value={selectedSpecialization}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md shadow-sm focus:border-custom-green focus:ring-custom-green ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="" className="text-gray-400">
          --- Select a Specialization ---
        </option>
        {specializations.map((spec, index) => (
          <option key={index} value={spec}>
            {spec}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
);

SpecializationSelect.propTypes = {
  specializations: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedSpecialization: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

SpecializationSelect.displayName = "SpecializationSelect";

const PsychologistSelect = memo(
  ({ psychologists, selectedPsychologist, onChange, error, disabled }) => (
    <div className="space-y-3">
      <label
        htmlFor="psychologist"
        className="block text-base font-medium text-gray-700"
      >
        Select Psychologist<span className="text-red-500">*</span>
      </label>

      {/* Search hint */}
      <p className="text-sm text-gray-500 italic">
        Select a psychologist to view their available time slots
      </p>

      {disabled ? (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <UserOutlined className="text-gray-400 text-xl mb-2" />
          <p className="text-gray-500">Please select a specialization first</p>
        </div>
      ) : psychologists.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <Empty
            description="No psychologists available for this specialization"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <Select
          id="psychologist"
          name="psychologist"
          value={selectedPsychologist}
          onChange={(value) =>
            onChange({ target: { name: "psychologist", value } })
          }
          disabled={disabled}
          placeholder="---Select a Psychologist---"
          className={`w-full ${error ? "ant-select-status-error" : ""}`}
          size="large"
          optionFilterProp="children"
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          notFoundContent={<Empty description="No matching psychologists" />}
          dropdownStyle={{ padding: "8px 0" }}
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <div className="px-3 py-1 text-xs text-gray-500">
                <InfoCircleOutlined className="mr-1" />
                Select a psychologist to view their available appointment slots
              </div>
            </div>
          )}
        >
          {psychologists.map((psych) => (
            <Select.Option
              key={psych.psychologistId}
              value={psych.psychologistId}
            >
              <div className="flex items-center gap-5 py-2 px-1">
                <div className="font-medium text-base text-gray-700">
                  {psych.info.fullName}
                </div>
                <span className="text-sm text-gray-600 flex items-center">
                  {psych.yearsOfExperience} years of experience
                </span>
              </div>
            </Select.Option>
          ))}
        </Select>
      )}

      {error && (
        <div className="flex items-center text-red-500">
          <ExclamationCircleOutlined className="mr-1" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Selected psychologist card */}
      {!disabled && selectedPsychologist && psychologists.length > 0 && (
        <div className="mt-4">
          {psychologists
            .filter((p) => p.psychologistId === selectedPsychologist)
            .map((psych) => (
              <Card
                key={psych.psychologistId}
                className="bg-green-50 border border-green-100 shadow-sm"
              >
                <div className="flex items-start">
                  <Avatar
                    icon={<UserOutlined />}
                    className="bg-primary-green text-white"
                    size={64}
                    style={{ minWidth: "64px" }}
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">
                      {psych.info.fullName}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <p className="text-gray-600 flex items-center">
                        <ClockCircleOutlined className="mr-2" />
                        {psych.yearsOfExperience} years of experience
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <TeamOutlined className="mr-2" />
                        {psych.departmentName}
                      </p>
                    </div>
                    <div className="mt-3">
                      <Tag color="green" className="px-3 py-1">
                        Available for booking
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
);

PsychologistSelect.propTypes = {
  psychologists: PropTypes.arrayOf(
    PropTypes.shape({
      psychologistId: PropTypes.string.isRequired,
      info: PropTypes.shape({
        fullName: PropTypes.string.isRequired,
      }).isRequired,
      yearsOfExperience: PropTypes.number.isRequired,
      departmentName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedPsychologist: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

PsychologistSelect.displayName = "PsychologistSelect";

const ReasonTextarea = memo(({ value, onChange }) => (
  <div>
    <label
      htmlFor="reason"
      className="block text-base font-medium text-gray-700 mb-4"
    >
      Reason for Appointment (Optional)
    </label>
    <textarea
      name="reason"
      id="reason"
      rows={4}
      value={value || ""}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-green focus:ring-custom-green"
      placeholder="Please briefly describe your reason for seeking consultation..."
    />
  </div>
));

ReasonTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ReasonTextarea.displayName = "ReasonTextarea";

const ConsentCheckbox = memo(({ checked, onChange, error }) => (
  <div className="pt-4">
    <label className="flex items-start">
      <input
        type="checkbox"
        name="consent"
        checked={checked || false}
        onChange={onChange}
        required
        className={`form-checkbox h-4 w-4 text-primary-green border-gray-300 focus:ring-primary-green mt-1 ${
          error ? "border-red-500" : ""
        }`}
      />
      <span className="ml-2 text-sm text-gray-600">
        I agree to the terms of service.
      </span>
    </label>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
));

ConsentCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

ConsentCheckbox.displayName = "ConsentCheckbox";

// Main Booking component
const Booking = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loading: bookingLoading, CreateBooking } = useAppointmentStore();
  const {
    psychologists,
    loading: psychologistsLoading,
    fetchPsychologists,
    timeSlots,
    getTimeSlots,
    clearTimeSlots,
  } = usePsychologistStore();

  const [timeSlotsLoading, setTimeSlotsLoading] = useState(false);

  // Use refs to track mounted state
  const isMountedRef = useRef(true);

  // State initialization
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch psychologists data only once when component mounts
  useEffect(() => {
    let isActive = true;

    // Sử dụng ref để theo dõi việc đã fetch hay chưa
    const fetchData = async () => {
      try {
        if (isActive) {
          await fetchPsychologists();
        }
      } catch (error) {
        if (isActive) {
          console.error("Error fetching psychologists:", error);
          notification.error({
            message: "Failed to load psychologist data",
            description: "Please try refreshing the page",
          });
        }
      }
    };

    // Chỉ fetch khi mảng rỗng
    if (!psychologists || psychologists.length === 0) {
      fetchData();
    }

    return () => {
      isActive = false;
    };
  }, [fetchPsychologists]); // Loại bỏ psychologists khỏi dependencies

  // Memoized specializations list
  const specializations = useMemo(() => {
    if (!psychologists || psychologists.length === 0) return [];
    return getPsychologistSpecializations(psychologists);
  }, [psychologists]);

  //filter psychologists by specialization
  const filteredPsychologists = useMemo(() => {
    if (!psychologists || psychologists.length === 0) return [];
    return psychologists.filter((psych) =>
      psych.departmentName.includes(selectedSpecialization)
    );
  }, [psychologists, selectedSpecialization]);

  // Validate form data
  const validateFormData = useCallback(() => {
    const newErrors = {};

    if (!formData.timeSlotId) {
      newErrors.timeSlotId = "Appointment time is required.";
    }

    if (!formData.specialization) {
      newErrors.specialization = "Specialization selection is required.";
    }

    if (!formData.psychologist) {
      newErrors.psychologist = "Psychologist selection is required.";
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms and conditions.";
    }

    // Only update errors state if there are changes
    if (Object.keys(newErrors).length > 0 || Object.keys(errors).length > 0) {
      setErrors(newErrors);
    }

    return Object.keys(newErrors).length === 0;
  }, [formData, errors]);

  // Reset form data
  const resetFormData = useCallback(() => {
    clearTimeSlots();
    setSelectedSpecialization("");
    setFormData({
      specialization: "",
      timeSlotId: null,
      reason: "",
      psychologist: "",
      consent: false,
    });
    setErrors({});
  }, []);

  // Show success notification
  const showSuccessNotification = useCallback(() => {
    notification.destroy();
    notification.success({
      message: "Booking Confirmed",
      description: "Your booking has been successfully confirmed!",
      duration: 0,
      btn: (
        <Button
          className="border-primary text-primary-green"
          onClick={() => {
            notification.destroy();
            navigate("/calendar");
          }}
        >
          View Calendar
        </Button>
      ),
      placement: "bottomRight",
    });
  }, [navigate]);

  // Handle form submission - optimized with error handling
  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (!validateFormData()) {
        return;
      }

      try {
        const bookingData = {
          userId: user?.userId,
          timeSlotId: formData.timeSlotId,
          note: formData.reason || "No notes provided",
        };

        await CreateBooking(bookingData);

        showSuccessNotification();
        resetFormData();
      } catch (error) {
        if (isMountedRef.current) {
          notification.error({
            message: "Booking Failed",
            description:
              error.message || "Failed to create booking. Please try again.",
          });
          console.error("Booking error:", error);
        }
      }
    },
    [
      formData,
      user,
      CreateBooking,
      validateFormData,
      showSuccessNotification,
      resetFormData,
    ]
  );

  // Optimized way to check form validity
  useEffect(() => {
    // Only check required fields instead of running full validation
    const isValid = Boolean(
      formData.timeSlotId &&
        formData.specialization &&
        formData.psychologist &&
        formData.consent
    );

    if (isFormValid !== isValid) {
      setIsFormValid(isValid);
    }
  }, [formData, isFormValid]);

  // Handle form field changes with optimized batch updates
  const handleChange = useCallback(
    async (e) => {
      const { name, value, type, checked } = e.target;

      if (name === "specialization") {
        // When specialization changes
        setSelectedSpecialization(value);

        // Reset psychologist and timeSlot in one update to prevent race conditions
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          psychologist: null, // Reset psychologist when specialization changes
          timeSlotId: null, // Reset timeSlotId when specialization changes
        }));

        // Clear time slots when specialization changes
        clearTimeSlots();

        // Clear related errors
        setErrors((prev) => ({
          ...prev,
          specialization: undefined,
          psychologist: undefined,
          timeSlotId: undefined,
        }));
      } else if (name === "psychologist") {
        // Update form data with selected psychologist
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          timeSlotId: null, // Reset timeSlotId when psychologist changes
        }));

        // Clear related error
        if (errors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
            timeSlotId: undefined,
          }));
        }

        // Fetch time slots for the selected psychologist
        if (value) {
          try {
            setTimeSlotsLoading(true);
            await getTimeSlots(value);
            setTimeSlotsLoading(false);
          } catch (error) {
            console.error("Error fetching time slots:", error);
            notification.error({
              message: "Failed to load time slots",
              description: "Please try selecting the psychologist again",
            });
            setTimeSlotsLoading(false);
          }
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));

        // Clear related error
        if (errors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: undefined,
          }));
        }
      }
    },
    [errors, clearTimeSlots, getTimeSlots]
  );

  // Add a useEffect to monitor timeSlots changes
  // useEffect(() => {
  //   console.log("timeSlots changed:", timeSlots);
  // }, [timeSlots]);

  // Handle cancel button
  const handleCancel = useCallback(() => {
    resetFormData();
    navigate(-1);
  }, [resetFormData, navigate]);

  // Combined loading state
  const isLoading = psychologistsLoading;

  // Disable psychologist selection if no specialization is selected
  const isPsychologistSelectDisabled = !selectedSpecialization;

  // Memoize disabled button state
  const disabledButton = useMemo(() => !isFormValid, [isFormValid]);

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
            isLoading ? "pointer-events-none opacity-75" : ""
          }`}
        >
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
                <SpecializationSelect
                  specializations={specializations}
                  selectedSpecialization={selectedSpecialization}
                  onChange={handleChange}
                  error={errors.specialization}
                />

                {/* Psychologist Selection */}
                <PsychologistSelect
                  psychologists={filteredPsychologists}
                  selectedPsychologist={formData.psychologist}
                  onChange={handleChange}
                  error={errors.psychologist}
                  disabled={isPsychologistSelectDisabled}
                />

                {/* Reason Textarea */}
                <ReasonTextarea
                  value={formData.reason}
                  onChange={handleChange}
                />
                {/* Consent Section */}
                <ConsentCheckbox
                  checked={formData.consent}
                  onChange={handleChange}
                  error={errors.consent}
                />
              </div>

              <div className="w-3/5 flex-1">
                <DateTimeSelector
                  timeSlots={timeSlots}
                  loading={timeSlotsLoading}
                  selectedPsychologist={formData.psychologist}
                  setFormData={setFormData}
                  formData={formData}
                />
                {errors.timeSlotId && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.timeSlotId}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-6 pt-6">
              <Button danger onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                disabled={disabledButton}
                loading={bookingLoading}
                onClick={handleSubmit}
              >
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
