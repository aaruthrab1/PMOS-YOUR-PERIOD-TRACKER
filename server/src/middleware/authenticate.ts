import type { Request, Response, NextFunction } from 'express';
import { createUserClient } from '../config/supabase.js';
import { AppError } from '../utils/AppError.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
  accessToken: string;
  supabase: ReturnType<typeof createUserClient>;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.slice(7);
    const supabase = createUserClient(token);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new AppError('Invalid or expired token', 401);
    }

    (req as AuthenticatedRequest).userId = user.id;
    (req as AuthenticatedRequest).accessToken = token;
    (req as AuthenticatedRequest).supabase = supabase;

    next();
  } catch (err) {
    next(err);
  }
}
