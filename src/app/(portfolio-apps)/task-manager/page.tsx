'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError('Error loading tasks. Please try again later.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      setError('Error deleting task. Please try again.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task._id === id ? updatedTask : task));
    } catch (err) {
      setError('Error updating task. Please try again.');
    }
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filterStatus);

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
            <p className="text-gray-600 mt-1">Manage your tasks efficiently</p>
          </div>
          <Link 
            href="/task-manager/new" 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Add New Task
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button 
            onClick={() => setFilterStatus('all')} 
            className={`px-4 py-2 rounded ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterStatus('todo')} 
            className={`px-4 py-2 rounded ${filterStatus === 'todo' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            To Do
          </button>
          <button 
            onClick={() => setFilterStatus('in-progress')} 
            className={`px-4 py-2 rounded ${filterStatus === 'in-progress' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            In Progress
          </button>
          <button 
            onClick={() => setFilterStatus('completed')} 
            className={`px-4 py-2 rounded ${filterStatus === 'completed' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Completed
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(task.status)}`}>
                        {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                      </span>
                      {task.dueDate && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => router.push(`/task-manager/${task._id}`)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(task._id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">Update Status:</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(task._id, 'todo')}
                      className={`px-3 py-1 text-sm rounded ${task.status === 'todo' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                    >
                      To Do
                    </button>
                    <button 
                      onClick={() => handleStatusChange(task._id, 'in-progress')}
                      className={`px-3 py-1 text-sm rounded ${task.status === 'in-progress' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(task._id, 'completed')}
                      className={`px-3 py-1 text-sm rounded ${task.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 