import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'Getting Started with Next.js',
    excerpt: 'Learn how to build modern web applications with Next.js and React.',
    author: 'John Doe',
    date: 'Dec 10, 2023',
    category: 'Web Development',
    imageColor: 'bg-blue-500',
  },
  {
    id: 2,
    title: 'Styling in Next.js with Tailwind CSS',
    excerpt: 'Discover how to use Tailwind CSS to quickly style your Next.js applications.',
    author: 'Jane Smith',
    date: 'Dec 5, 2023',
    category: 'CSS',
    imageColor: 'bg-purple-500',
  },
  {
    id: 3,
    title: 'Working with MongoDB in Next.js',
    excerpt: 'A comprehensive guide to integrating MongoDB with your Next.js application.',
    author: 'John Doe',
    date: 'Nov 28, 2023',
    category: 'Database',
    imageColor: 'bg-green-500',
  },
  {
    id: 4,
    title: 'Authentication in Next.js with NextAuth.js',
    excerpt: 'Learn how to implement user authentication in your Next.js application using NextAuth.js.',
    author: 'Jane Smith',
    date: 'Nov 20, 2023',
    category: 'Security',
    imageColor: 'bg-red-500',
  },
];

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800">
          ← Back to Home
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Blog</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Create New Post
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className={`h-40 ${post.imageColor} flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{post.title}</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{post.date}</span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">By {post.author}</span>
                <Link href={`/blog/${post.id}`} className="text-indigo-600 hover:text-indigo-800">
                  Read More →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mt-10">
        <h2 className="text-2xl font-bold mb-4">CMS Dashboard</h2>
        <p className="text-gray-600 mb-6">Manage your blog posts, categories, and comments from this dashboard.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Posts</h3>
            <p className="text-3xl font-bold text-indigo-600">4</p>
            <p className="text-sm text-gray-600 mt-1">Total posts published</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Categories</h3>
            <p className="text-3xl font-bold text-indigo-600">4</p>
            <p className="text-sm text-gray-600 mt-1">Total categories</p>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Comments</h3>
            <p className="text-3xl font-bold text-indigo-600">12</p>
            <p className="text-sm text-gray-600 mt-1">Total comments</p>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button className="text-indigo-600 hover:text-indigo-800">View All</button>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <p className="text-gray-800">New comment on &quot;Getting Started with Next.js&quot;</p>
              <p className="text-sm text-gray-600 mt-1">2 hours ago</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <p className="text-gray-800">Post &quot;Authentication in Next.js with NextAuth.js&quot; published</p>
              <p className="text-sm text-gray-600 mt-1">1 day ago</p>
            </div>
            
            <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <p className="text-gray-800">New category &quot;Security&quot; created</p>
              <p className="text-sm text-gray-600 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 