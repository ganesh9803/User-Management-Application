import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // For editing
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "",
  });
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const usersPerPage = 5; // Number of users per page

  // Fetch Users
  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        const formattedUsers = response.data.map((user) => ({
          id: user.id,
          firstName: user.name.split(" ")[0],
          lastName: user.name.split(" ")[1] || "",
          email: user.email,
          department: "N/A", // Placeholder
        }));
        setUsers(formattedUsers);
      })
      .catch((error) => {
        console.error(error); // Log the error for debugging
        toast.error("Failed to fetch users. Please try again later.");
      });
  }, []);

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate Form Data
  const validateForm = () => {
    if (!formData.firstName.trim()) return "First Name is required.";
    if (!formData.lastName.trim()) return "Last Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!formData.department.trim()) return "Department is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return "Please enter a valid email address.";
    return null;
  };

  // Add User
  const handleAddUser = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const newUser = { ...formData, id: Date.now() }; // Generate unique ID
    axios
      .post("https://jsonplaceholder.typicode.com/users", newUser)
      .then(() => {
        setUsers([...users, newUser]); // Update local state
        setFormData({ id: "", firstName: "", lastName: "", email: "", department: "" });
        toast.success("User added successfully!");
      })
      .catch((error) => {
        console.error(error); // Log the error for debugging
        toast.error("Failed to add user. Please try again.");
      });
  };

  // Edit User
  const handleEditUser = (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    axios
      .put(`https://jsonplaceholder.typicode.com/users/${formData.id}`, formData)
      .then(() => {
        const updatedUsers = users.map((user) =>
          user.id === formData.id ? { ...user, ...formData } : user
        );
        setUsers(updatedUsers); // Update local state
        setFormData({ id: "", firstName: "", lastName: "", email: "", department: "" });
        setCurrentUser(null); // Exit edit mode
        toast.success("User updated successfully!");
      })
      .catch((error) => {
        console.error(error); // Log the error for debugging
        toast.error("Failed to update user. Please try again.");
      });
  };

  // Delete User
  const handleDeleteUser = (id) => {
    axios
      .delete(`https://jsonplaceholder.typicode.com/users/${id}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== id));
        toast.success("User deleted successfully!");
      })
      .catch((error) => {
        console.error(error); // Log the error for debugging
        toast.error("Failed to delete user. Please try again.");
      });
  };

  // Set User for Editing
  const handleEditClick = (user) => {
    setCurrentUser(user.id);
    setFormData(user);
  };

  // Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4 text-center">User Management</h1>

      <form onSubmit={currentUser ? handleEditUser : handleAddUser} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleInputChange}
            className="border p-2"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleInputChange}
            className="border p-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="border p-2"
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleInputChange}
            className="border p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        >
          {currentUser ? "Update User" : "Add User"}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">User List</h2>
        <table className="border-collapse border border-gray-300 w-full text-left">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">First Name</th>
              <th className="border border-gray-300 p-2">Last Name</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Department</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id}>
                <td className="border border-gray-300 p-2">{user.id}</td>
                <td className="border border-gray-300 p-2">{user.firstName}</td>
                <td className="border border-gray-300 p-2">{user.lastName}</td>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">{user.department}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                    onClick={() => handleEditClick(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button
            className={`px-4 py-2 bg-gray-500 text-white ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 bg-gray-500 text-white ${
              currentPage >= Math.ceil(users.length / usersPerPage)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(users.length / usersPerPage)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
