'use client';

import TaskForm from '@/components/TaskForm';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditTaskPage() {
  const params = useParams();
  const taskId = params?.id as string;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/task-manager" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            &larr; Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
        </div>
        
        <TaskForm taskId={taskId} isEditMode={true} />
      </div>
    </div>
  );
} 