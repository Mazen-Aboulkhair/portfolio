import TaskForm from '@/components/TaskForm';
import Link from 'next/link';

export default function NewTaskPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/task-manager" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            &larr; Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
        </div>
        
        <TaskForm />
      </div>
    </div>
  );
} 