import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory user store (for demo purposes)
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const users: Map<string, User> = new Map();

// GET /users - List all users
router.get('/', (_req: Request, res: Response) => {
  const userList = Array.from(users.values());
  res.json({
    success: true,
    data: userList,
    count: userList.length,
  });
});

// GET /users/:id - Get user by ID
router.get('/:id', (req: Request, res: Response) => {
  const user = users.get(req.params.id);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
    return;
  }

  res.json({
    success: true,
    data: user,
  });
});

// POST /users - Create new user
router.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };

  if (!name || !email) {
    res.status(400).json({
      success: false,
      error: 'Name and email are required',
    });
    return;
  }

  // Check for duplicate email
  const existingUser = Array.from(users.values()).find(u => u.email === email);
  if (existingUser) {
    res.status(409).json({
      success: false,
      error: 'User with this email already exists',
    });
    return;
  }

  const user: User = {
    id: uuidv4(),
    name,
    email,
    createdAt: new Date(),
  };

  users.set(user.id, user);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// PUT /users/:id - Update user
router.put('/:id', (req: Request, res: Response) => {
  const user = users.get(req.params.id);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
    return;
  }

  const { name, email } = req.body as { name?: string; email?: string };

  if (email && email !== user.email) {
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }
  }

  const updatedUser: User = {
    ...user,
    name: name || user.name,
    email: email || user.email,
  };

  users.set(req.params.id, updatedUser);

  res.json({
    success: true,
    data: updatedUser,
  });
});

// DELETE /users/:id - Delete user
router.delete('/:id', (req: Request, res: Response) => {
  const user = users.get(req.params.id);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
    return;
  }

  users.delete(req.params.id);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Export for testing purposes
export const clearUsers = (): void => {
  users.clear();
};

export const getUserStore = (): Map<string, User> => users;

export default router;
