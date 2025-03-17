import { useSurveyStore } from "../../stores/surveyStore";

export default function SurveyManagement() {
  const { surveys, loading, fetchSurveys } = useSurveyStore();
}
