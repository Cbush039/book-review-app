import React, { useState, useEffect } from 'react';
import { Star, BookOpen, CheckCircle, LogOut, Search, Plus, X } from 'lucide-react';

export default function BookReviewApp() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const userResult = localStorage.getItem('current_user');
      if (userResult) {
        const userData = JSON.parse(userResult);
        setUser(userData);

        const booksResult = localStorage.getItem(`books_${userData.username}`);
        if (booksResult) {
          setBooks(JSON.parse(booksResult));
        }
      }
    } catch (error) {
      console.log('No existing data found');
    }
    setLoading(false);
  };

  const saveBooks = (username, booksData) => {
    try {
      localStorage.setItem(`books_${username}`, JSON.stringify(booksData));
    } catch (error) {
      console.error('Error saving books:', error);
    }
  };

  const handleLogin = (username, password) => {
    try {
      const userKey = `user_${username}`;
      const result = localStorage.getItem(userKey);

      if (result) {
        const userData = JSON.parse(result);
        if (userData.password === password) {
          setUser(userData);
          localStorage.setItem('current_user', JSON.stringify(userData));

          const booksResult = localStorage.getItem(`books_${username}`);
          if (booksResult) {
            setBooks(JSON.parse(booksResult));
          }
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSignup = (username, password) => {
    try {
      const userKey = `user_${username}`;
      const result = localStorage.getItem(userKey);

      if (result) {
        return false;
      }

      const userData = { username, password };
      localStorage.setItem(userKey, JSON.stringify(userData));
      localStorage.setItem('current_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      return true;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('current_user');
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setUser(null);
    setBooks([]);
  };

  const addBook = (bookData) => {
    const newBook = {
      id: Date.now().toString(),
      ...bookData,
      dateAdded: new Date().toISOString()
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    saveBooks(user.username, updatedBooks);
  };

  const updateBook = (bookId, updates) => {
    const updatedBooks = books.map(book =>
      book.id === bookId ? { ...book, ...updates } : book
    );
    setBooks(updatedBooks);
    saveBooks(user.username, updatedBooks);
  };

  const deleteBook = (bookId) => {
    const updatedBooks = books.filter(book => book.id !== bookId);
    setBooks(updatedBooks);
    saveBooks(user.username, updatedBooks);
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">My Book Reviews</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Books</option>
            <option value="reading">Currently Reading</option>
            <option value="completed">Completed</option>
            <option value="want-to-read">Want to Read</option>
          </select>
          <button
            onClick={() => setShowAddBook(true)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </button>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No books found. Start adding your reviews!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={updateBook}
                onDelete={deleteBook}
              />
            ))}
          </div>
        )}
      </div>

      {showAddBook && (
        <AddBookModal
          onClose={() => setShowAddBook(false)}
          onAdd={addBook}
        />
      )}
    </div>
  );
}

function LoginScreen({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isLogin) {
      const success = onLogin(username, password);
      if (!success) {
        setError('Invalid username or password');
      }
    } else {
      const success = onSignup(username, password);
      if (!success) {
        setError('Username already exists');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to continue to your library' : 'Create an account to start tracking'}
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            {' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-indigo-600 hover:text-purple-600 font-semibold transition"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

function BookCard({ book, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{book.title}</h3>
          <p className="text-gray-600 text-sm">by {book.author}</p>
        </div>
        <button
          onClick={() => onDelete(book.id)}
          className="text-gray-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onUpdate(book.id, { rating: star })}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${star <= book.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>

      <select
        value={book.status}
        onChange={(e) => onUpdate(book.id, { status: e.target.value })}
        className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="want-to-read">Want to Read</option>
        <option value="reading">Currently Reading</option>
        <option value="completed">Completed</option>
      </select>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={book.review}
            onChange={(e) => onUpdate(book.id, { review: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows="4"
            placeholder="Write your review..."
          />
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Done
          </button>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 text-sm line-clamp-3">{book.review || 'No review yet'}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            {book.review ? 'Edit review' : 'Add review'}
          </button>
        </div>
      )}
    </div>
  );
}

function AddBookModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState('want-to-read');
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (!title || !author) return;
    onAdd({ title, author, rating, status, review });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Book</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reading Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="want-to-read">Want to Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows="4"
              placeholder="Write your review (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Add Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}