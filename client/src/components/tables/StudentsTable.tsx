import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import type { Student } from "../../types/student";

interface Props {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export default function StudentsTable({
  students,
  onView,
  onEdit,
  onDelete,
}: Props) {
  if (students.length === 0) {
    return (
      <Card>
        <div className="py-12 text-center text-slate-500">
          No students found.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <Card key={student.id}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => onView(student)}
                className="flex items-center gap-4 text-left focus:outline-none min-w-0"
              >
                <Avatar name={student.name} image={student.photo} size="lg" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold underline-offset-2 hover:underline truncate">{student.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{student.studentCode}</p>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 min-w-0">
              <div>
                <p className="text-xs text-slate-400">Class</p>
                <p className="truncate">{student.class?.title ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Group</p>
                <p className="truncate">{student.group?.name ?? "-"}</p>
              </div>
              </div>

            <div className="flex items-center gap-3">
              <Badge active={student.isActive} />
              <button
                type="button"
                onClick={() => onView(student)}
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label={`View ${student.name}`}
              >
                <FiEye size={20} />
              </button>
              <button
                type="button"
                onClick={() => onEdit(student)}
                className="rounded-xl p-2 transition hover:bg-slate-100"
                aria-label={`Edit ${student.name}`}
              >
                <FiEdit2 size={20} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(student)}
                className="rounded-xl p-2 text-red-500 transition hover:bg-red-50"
                aria-label={`Delete ${student.name}`}
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
