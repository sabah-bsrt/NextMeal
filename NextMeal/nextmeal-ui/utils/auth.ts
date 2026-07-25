export type CurrentUser = {
  id: string;
  name: string;
  email: string;
};

const CURRENT_USER_KEY = "nextmeal_current_user";
const USERS_KEY = "nextmeal_users";

// --- helpers ---
function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- current user ---
export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;
  return readJSON<CurrentUser | null>(CURRENT_USER_KEY, null);
}

export function setCurrentUser(user: CurrentUser) {
  writeJSON(CURRENT_USER_KEY, user);
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

// --- fake DB users (local) ---
type StoredUser = CurrentUser & { password: string };

function getUsers(): StoredUser[] {
  return readJSON<StoredUser[]>(USERS_KEY, []);
}

function setUsers(users: StoredUser[]) {
  writeJSON(USERS_KEY, users);
}

// --- auth actions ---
export function register(name: string, email: string, password: string) {
  if (!email.trim() || !password.trim()) {
    throw new Error("Email and password are required");
  }

  const users = getUsers();
  const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("This email is already registered");

  const newUser: StoredUser = {
    id: `u_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    password,
  };

  setUsers([newUser, ...users]);
  setCurrentUser({ id: newUser.id, name: newUser.name, email: newUser.email });
  return { id: newUser.id, name: newUser.name, email: newUser.email } as CurrentUser;
}

export function login(email: string, password: string) {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Invalid email or password");
  if (user.password !== password) throw new Error("Invalid email or password");

  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { id: user.id, name: user.name, email: user.email } as CurrentUser;
}

export function updateUserProfile(userId: string, patch: Pick<CurrentUser, "name" | "email">) {
  const current = getCurrentUser();
  if (!current) throw new Error("No user");
  if (current.id !== userId) throw new Error("User mismatch");

  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("User not found");

  // prevent email collision
  const emailTaken = users.some(
    (u) => u.id !== userId && u.email.toLowerCase() === patch.email.toLowerCase()
  );
  if (emailTaken) throw new Error("Email is already used by another account");

  const updated: StoredUser = {
    ...users[idx],
    name: patch.name.trim(),
    email: patch.email.trim(),
  };

  users[idx] = updated;
  setUsers(users);
  setCurrentUser({ id: updated.id, name: updated.name, email: updated.email });
  return { id: updated.id, name: updated.name, email: updated.email } as CurrentUser;
}
