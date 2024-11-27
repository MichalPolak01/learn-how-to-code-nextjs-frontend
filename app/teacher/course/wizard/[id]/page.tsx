import CourseWizard from "../page";

export default function CourseEditorPage({ params }: { params: { id: string } }) {
    const courseId = parseInt(params.id);
  
    return <CourseWizard courseId={courseId} />;
  }