import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/global/Navbar";
import { Sidebar } from "@/components/global/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { moviesApi } from "../Home/api/movies";
import type { Movie } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Upload,
  FileJson,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState<Partial<Movie>>({
    title: "",
    description: "",
    releaseDate: "",
    duration: 0,
    rating: 0,
    genre: [],
    director: "",
    cast: [],
    posterUrl: "",
    imdbId: "",
  });
  const [genreInput, setGenreInput] = useState("");
  const [castInput, setCastInput] = useState("");

  // Bulk import states
  const [bulkMovies, setBulkMovies] = useState<Partial<Movie>[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      // mobile only
      const timer = setTimeout(() => {
        const navbar = document.querySelector("nav");
        if (navbar) {
          navbar.classList.add("-translate-y-full"); // slide navbar up
        }
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/");
      return;
    }

    fetchMovies();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await moviesApi.getMovies(1, 100);
      setMovies(response.data || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await moviesApi.updateMovie(editingMovie._id, formData);
      } else {
        await moviesApi.createMovie(formData);
      }
      await fetchMovies();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to save movie");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await moviesApi.deleteMovie(id);
      await fetchMovies();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete movie");
    }
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      releaseDate: movie.releaseDate?.split("T")[0] || "",
      duration: movie.duration,
      rating: movie.rating,
      genre: movie.genre || [],
      director: movie.director,
      cast: movie.cast || [],
      posterUrl: movie.posterUrl,
      imdbId: movie.imdbId || "",
    });
    setGenreInput(movie.genre.join(", "));
    setCastInput(movie.cast.join(", "));
    setShowForm(true);
    setShowBulkImport(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      releaseDate: "",
      duration: 0,
      rating: 0,
      genre: [],
      director: "",
      cast: [],
      posterUrl: "",
      imdbId: "",
    });
    setGenreInput("");
    setCastInput("");
    setEditingMovie(null);
    setShowForm(false);
  };

  const handleGenreChange = (value: string) => {
    setGenreInput(value);
    setFormData({
      ...formData,
      genre: value
        .split(",")
        .map((g) => g.trim())
        .filter((g) => g.length > 0),
    });
  };

  const handleCastChange = (value: string) => {
    setCastInput(value);
    setFormData({
      ...formData,
      cast: value
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0),
    });
  };

  const handleSearch = (query: string) => {
    navigate(`/movies?search=${encodeURIComponent(query)}`);
  };

  // Bulk import functions
  const validateMovie = (movie: any, index: number): string[] => {
    const errors: string[] = [];
    const prefix = `Movie ${index + 1}`;

    if (!movie.title || typeof movie.title !== "string") {
      errors.push(`${prefix}: Title is required and must be a string`);
    }
    if (!movie.description || typeof movie.description !== "string") {
      errors.push(`${prefix}: Description is required and must be a string`);
    }
    if (!movie.director || typeof movie.director !== "string") {
      errors.push(`${prefix}: Director is required and must be a string`);
    }
    if (!movie.releaseDate) {
      errors.push(`${prefix}: Release date is required`);
    }
    if (
      !movie.duration ||
      typeof movie.duration !== "number" ||
      movie.duration <= 0
    ) {
      errors.push(`${prefix}: Duration must be a positive number`);
    }
    if (!movie.posterUrl || typeof movie.posterUrl !== "string") {
      errors.push(`${prefix}: Poster URL is required and must be a string`);
    }
    if (!Array.isArray(movie.genre) || movie.genre.length === 0) {
      errors.push(`${prefix}: Genre must be a non-empty array`);
    }
    if (
      movie.rating !== undefined &&
      (typeof movie.rating !== "number" ||
        movie.rating < 0 ||
        movie.rating > 10)
    ) {
      errors.push(`${prefix}: Rating must be a number between 0 and 10`);
    }
    if (movie.cast && !Array.isArray(movie.cast)) {
      errors.push(`${prefix}: Cast must be an array`);
    }

    return errors;
  };

  const handleJsonParse = () => {
    setImportStatus({ type: null, message: "" });
    setValidationErrors([]);

    try {
      const parsed = JSON.parse(jsonInput);
      const moviesArray = Array.isArray(parsed) ? parsed : [parsed];

      const allErrors: string[] = [];
      moviesArray.forEach((movie, index) => {
        const errors = validateMovie(movie, index);
        allErrors.push(...errors);
      });

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
        setImportStatus({
          type: "error",
          message: `Found ${allErrors.length} validation error(s). Please fix them before importing.`,
        });
        return;
      }

      setBulkMovies(moviesArray);
      setImportStatus({
        type: "success",
        message: `Successfully parsed ${moviesArray.length} movie(s). Review and click "Import All" to proceed.`,
      });
    } catch (error) {
      setImportStatus({
        type: "error",
        message: "Invalid JSON format. Please check your input.",
      });
    }
  };

  const handleBulkImport = async () => {
    if (bulkMovies.length === 0) {
      setImportStatus({
        type: "error",
        message: "No movies to import. Please parse JSON first.",
      });
      return;
    }

    try {
      setImportStatus({
        type: "info",
        message: "Importing movies...",
      });

      const response = await moviesApi.createMoviesBatch(bulkMovies);

      setImportStatus({
        type: "success",
        message:
          response.message ||
          `Successfully imported ${bulkMovies.length} movies!`,
      });

      setTimeout(() => {
        resetBulkImport();
        fetchMovies();
      }, 2000);
    } catch (error: any) {
      setImportStatus({
        type: "error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to import movies",
      });
    }
  };

  const resetBulkImport = () => {
    setJsonInput("");
    setBulkMovies([]);
    setImportStatus({ type: null, message: "" });
    setValidationErrors([]);
    setShowBulkImport(false);
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "Example Movie",
        description:
          "This is a sample movie description that explains the plot.",
        releaseDate: "2024-01-01",
        duration: 120,
        rating: 8.5,
        genre: ["Action", "Drama"],
        director: "John Doe",
        cast: ["Actor One", "Actor Two", "Actor Three"],
        posterUrl: "https://example.com/poster.jpg",
        imdbId: "tt1234567",
      },
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "movies-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onSearch={handleSearch} />
      <Sidebar />

      <main className="ml-0 md:ml-64 pt-20 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <div className="flex gap-3 flex-wrap md:flex-nowrap">
              <button
                onClick={() => {
                  setShowBulkImport(!showBulkImport);
                  setShowForm(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors whitespace-nowrap"
              >
                <Upload size={20} />
                {showBulkImport ? "Close Bulk Import" : "Bulk Import"}
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setShowBulkImport(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors whitespace-nowrap"
              >
                <Plus size={20} />
                {showForm ? "Cancel" : "Add Movie"}
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            {/* Bulk Import Section */}
            {showBulkImport && (
              <div className="bg-gray-900 rounded-lg p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Bulk Import Movies</h2>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>

                <div className="bg-gray-800 rounded p-4 text-sm text-gray-300">
                  <p className="font-semibold mb-2">📝 Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Download the JSON template or create your own array of
                      movies
                    </li>
                    <li>
                      Each movie must have: title, description, releaseDate,
                      duration, genre (array), director, posterUrl
                    </li>
                    <li>
                      Optional fields: rating (0-10), cast (array), imdbId
                    </li>
                    <li>Paste the JSON below and click "Parse & Validate"</li>
                    <li>Review the parsed movies and click "Import All"</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-sm mb-2 font-semibold">
                    Paste JSON Data:
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[{"title": "Movie 1", "description": "...", ...}, {"title": "Movie 2", ...}]'
                    rows={10}
                    className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
                  />
                </div>

                {importStatus.type && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded ${
                      importStatus.type === "success"
                        ? "bg-green-600/20 border border-green-600/50"
                        : importStatus.type === "error"
                          ? "bg-red-600/20 border border-red-600/50"
                          : "bg-blue-600/20 border border-blue-600/50"
                    }`}
                  >
                    {importStatus.type === "success" && (
                      <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                    )}
                    {importStatus.type === "error" && (
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                    )}
                    {importStatus.type === "info" && (
                      <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                    )}
                    <p className="text-sm">{importStatus.message}</p>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="bg-red-900/20 border border-red-600/50 rounded p-4">
                    <p className="font-semibold mb-2 text-red-400">
                      Validation Errors:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-300 max-h-60 overflow-y-auto">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {bulkMovies.length > 0 && validationErrors.length === 0 && (
                  <div className="bg-gray-800 rounded p-4">
                    <p className="font-semibold mb-3">
                      Preview ({bulkMovies.length} movies):
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {bulkMovies.map((movie, index) => (
                        <div
                          key={index}
                          className="bg-gray-700/50 rounded p-3 text-sm"
                        >
                          <p className="font-semibold">
                            {index + 1}. {movie.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {movie.director} • {movie.genre?.join(", ")} •{" "}
                            {movie.duration}min
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleJsonParse}
                    disabled={!jsonInput.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <FileJson size={18} />
                    Parse & Validate
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={
                      bulkMovies.length === 0 || validationErrors.length > 0
                    }
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
                  >
                    <Upload size={18} />
                    Import All ({bulkMovies.length})
                  </button>
                  <button
                    onClick={resetBulkImport}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Movie Form */}
            {showForm && (
              <div className="bg-gray-900 rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-4">
                  {editingMovie ? "Edit Movie" : "Create New Movie"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Director *</label>
                      <input
                        type="text"
                        required
                        value={formData.director}
                        onChange={(e) =>
                          setFormData({ ...formData, director: e.target.value })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">
                        Release Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.releaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            releaseDate: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">
                        Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">
                        Rating (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value),
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Poster URL *</label>
                      <input
                        type="url"
                        required
                        value={formData.posterUrl}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            posterUrl: e.target.value,
                          })
                        }
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      Genres (comma-separated) *
                    </label>
                    <input
                      type="text"
                      required
                      value={genreInput}
                      onChange={(e) => handleGenreChange(e.target.value)}
                      placeholder="Action, Drama, Thriller"
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      Cast (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={castInput}
                      onChange={(e) => handleCastChange(e.target.value)}
                      placeholder="Actor 1, Actor 2, Actor 3"
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      IMDB ID (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.imdbId}
                      onChange={(e) =>
                        setFormData({ ...formData, imdbId: e.target.value })
                      }
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <Save size={18} />
                      {editingMovie ? "Update Movie" : "Create Movie"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Movies List */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                All Movies ({movies.length})
              </h2>
              <div className="bg-gray-900 rounded-lg border border-white/10 overflow-x-auto max-h-[600px]">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="text-left p-4">Poster</th>
                      <th className="text-left p-4">Title</th>
                      <th className="text-left p-4">Director</th>
                      <th className="text-left p-4">Genre</th>
                      <th className="text-left p-4">Rating</th>
                      <th className="text-left p-4">Release Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movies.map((movie) => (
                      <tr
                        key={movie._id}
                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-16 h-24 object-cover rounded overflow-hidden"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/100x150/1a1a1a/ffffff?text=" +
                                movie.title;
                            }}
                          />
                        </td>
                        <td className="p-4 font-medium">{movie.title}</td>
                        <td className="p-4 text-white/80">{movie.director}</td>
                        <td className="p-4 text-white/80">
                          {movie.genre.join(", ")}
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1">
                            ⭐ {movie.rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-white/80">
                          {new Date(movie.releaseDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(movie)}
                              className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(movie._id)}
                              className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
