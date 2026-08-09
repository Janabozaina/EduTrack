import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { getGroups, createGroup, updateGroup, deleteGroup } from "../../services/group.service";
import { getClasses } from "../../services/class.service";

interface ClassItem {
  id: string;
  title: string;
}

interface GroupItem {
  id: string;
  name: string;
  class: { id: string; title: string };
  _count?: { students: number };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GroupItem | null>(null);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [groupData, classData] = await Promise.all([
        getGroups(),
        getClasses(),
      ]);
      setGroups(groupData);
      setClasses(classData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load groups.");
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    setCurrentGroup(null);
    setName("");
    setClassId("");
    setModalOpen(true);
  };

  const openEdit = (group: GroupItem) => {
    setCurrentGroup(group);
    setName(group.name);
    setClassId(group.class.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  async function handleSave() {
    if (!name.trim() || !classId) {
      toast.error("Group name and class are required.");
      return;
    }

    setSaving(true);

    try {
      if (currentGroup) {
        await updateGroup(currentGroup.id, {
          name: name.trim(),
        });
        toast.success("Group updated successfully.");
      } else {
        await createGroup({
          name: name.trim(),
          classId,
        });
        toast.success("Group created successfully.");
      }

      closeModal();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save group.");
    } finally {
      setSaving(false);
    }
  }

  const handleDelete = async (group: GroupItem) => {
    if (!window.confirm("Delete this group? This cannot be undone.")) {
      return;
    }

    try {
      await deleteGroup(group.id);
      toast.success("Group deleted successfully.");
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete group.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-500">Manage groups and class assignments.</p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          + Add Group
        </button>
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center">Loading groups...</div>
      ) : groups.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-slate-500">
            No groups found. Create a group to start assigning students.
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs text-slate-400">Group</p>
                  <h2 className="text-xl font-semibold">{group.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{group._count?.students ?? 0} Students</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Class</p>
                  <p>{group.class.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(group)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm transition hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(group)}
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
        title={currentGroup ? "Edit Group" : "Add Group"}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
          />
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Class
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select Class</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
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
              {saving ? "Saving..." : currentGroup ? "Update Group" : "Create Group"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
