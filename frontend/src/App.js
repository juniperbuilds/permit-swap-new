import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useParams } from 'react-router-dom';

// Main App Component
function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('There was an error!', error);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <h1>{message}</h1>
        <nav>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/permits">Permit Listings</Link></li>
            <li><Link to="/list-your-permit">List Your Permit</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/permits" element={<PermitListings />} />
          <Route path="/list-your-permit" element={<ListPermit />} />
          <Route path="/chat/:userId" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

// Login Component
function Login() {
  const [authData, setAuthData] = useState({ username: '', password: '' });

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/login', authData)
      .then(response => {
        localStorage.setItem('token', response.data.token);
      })
      .catch(error => {
        console.error('Login failed', error);
      });
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="text" name="username" placeholder="Username" onChange={handleAuthChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleAuthChange} />
      <button type="submit">Login</button>
    </form>
  );
}

// Register Component
function Register() {
  const [authData, setAuthData] = useState({ username: '', password: '' });

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3000/register', authData)
      .then(response => {
        console.log(response.data.message);
      })
      .catch(error => {
        console.error('Registration failed', error);
      });
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input type="text" name="username" placeholder="Username" onChange={handleAuthChange} />
      <input type="password" name="password" placeholder="Password" onChange={handleAuthChange} />
      <button type="submit">Register</button>
    </form>
  );
}

// Permit Listings Component
function PermitListings() {
  const [permits, setPermits] = useState([]);
  const [filter, setFilter] = useState({ location: '', type: '', startDate: '', endDate: '' });

  useEffect(() => {
    axios.get('http://localhost:3000/permits')
      .then(response => {
        setPermits(response.data);
      })
      .catch(error => {
        console.error('Error fetching permits:', error);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    axios.get('http://localhost:3000/permits', { params: filter })
      .then(response => {
        setPermits(response.data);
      })
      .catch(error => {
        console.error('Error fetching filtered permits:', error);
      });
  };

  return (
    <div>
      <h2>Permit Listings</h2>
      <form onSubmit={handleFilterSubmit}>
        <input type="text" name="location" placeholder="Location" onChange={handleFilterChange} />
        <input type="date" name="startDate" onChange={handleFilterChange} />
        <input type="date" name="endDate" onChange={handleFilterChange} />
        <button type="submit">Apply Filter</button>
      </form>

      <ul>
        {permits.map((permit, index) => (
          <li key={index}>
            {permit.location} - {permit.startDate} to {permit.endDate} - {permit.type}
            <br />
            <Link to={`/chat/${permit.user}`}>Send Message</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// List Permit Component
function ListPermit() {
  const [newPermit, setNewPermit] = useState({ location: '', startDate: '', endDate: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPermit(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.post('http://localhost:3000/permits', newPermit, {
      headers: {
        Authorization: token
      }
    })
    .then(response => {
      console.log('Permit added successfully');
      setNewPermit({ location: '', startDate: '', endDate: '', type: '' });
    })
    .catch(error => {
      console.error('Error adding permit:', error);
    });
  };

  return (
    <div>
      <h2>List Your Permit</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="location" placeholder="Location" onChange={handleChange} />
        <input type="date" name="startDate" onChange={handleChange} />
        <input type="date" name="endDate" onChange={handleChange} />
        <input type="text" name="type" placeholder="Type" onChange={handleChange} />
        <button type="submit">Add Permit</button>
      </form>
    </div>
  );
}

// Chat Component
function Chat() {
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3000/messages/${userId}`, {
      headers: {
        Authorization: localStorage.getItem('token'),
      }
    })
    .then(response => {
      setMessages(response.data);
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });
  }, [userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:3000/messages/${userId}`, { content: newMessage }, {
      headers: {
        Authorization: localStorage.getItem('token'),
      }
    })
    .then(response => {
      setMessages([...messages, response.data]);
      setNewMessage('');
    })
    .catch(error => {
      console.error('Error sending message:', error);
    });
  };

  return (
    <div>
      <h2>Chat with Seller</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.content}</li>
        ))}
      </ul>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default App;

