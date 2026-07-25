import { User } from '../types';

const STORAGE_KEY = 'mealPlanner_users';
const SESSION_KEY = 'mealPlanner_currentUser';

export function getAllUsers(): Array<User & { password: string }> {
  const users = localStorage.getItem(STORAGE_KEY);
  return users ? JSON.parse(users) : [];
}

export function saveUser(email: string, password: string, name: string): User {
  const users = getAllUsers();
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    password,
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

export function loginUser(email: string, password: string): User {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;

  const user = window.localStorage.getItem(SESSION_KEY);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  return getCurrentUser() !== null;
}


export function logoutUser(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function logout(): void {
  logoutUser();
}

export function login(email: string, password: string): User {
  return loginUser(email, password);
}

export function register(name: string, email: string, password: string): User {
  return saveUser(email, password, name);
}

export function updateUserProfile(userId: string, updates: Partial<User>): User {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  
  const { password: _, ...userWithoutPassword } = users[userIndex];
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword;
}

