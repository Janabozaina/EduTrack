import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { getClasses, createClass, updateClass, deleteClass } from "../../services/class.service";

interface ClassItem {
  id: string;
  title: string;
  _count?: { groups: number; students: number };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<ClassItem | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load classes.");
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    setCurrentClass(null);
    setTitle("");
    setModalOpen(true);
  };

  const openEdit = (item: ClassItem) => {
    setCurrentClass(item);
    setTitle(item.title);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Class title is required.");
      return;
    }

    setSaving(true);

    try {
      if (currentClass) {
        await updateClass(currentClass.id, title.trim());
        toast.success("Class updated successfully.");
      } else {
        await createClass(title.trim());
        toast.success("Class created successfully.");
      }

      closeModal();
      loadClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save class.");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async (item: ClassItem) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) {
      return;
    }

    try {
      await deleteClass(item.id);
      toast.success("Class deleted successfully.");
      loadClasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete class.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classes</h1>
          <p className="text-gray-500">Manage class categories.</p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          + Add Class
        </button>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">Loading classes...</div>
      ) : classes.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-slate-500">
            No classes found. Add a class to get started.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Class</p>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item._count?.groups ?? 0} Groups • {item._count?.students ?? 0} Students</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={currentClass ? "Edit Class" : "Add Class"}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Class title"
          />
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={closeModal}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : currentClass ? "Update Class" : "Create Class"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
