import { transformations, users, type User, type InsertUser, type Transformation, type InsertTransformation } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCredits(id: number, usedFreeCredit: boolean, paidCredits?: number): Promise<User>;
  
  // Transformation operations
  createTransformation(transformation: InsertTransformation): Promise<Transformation>;
  getTransformation(id: number): Promise<Transformation | undefined>;
  updateTransformationStatus(id: number, status: string, transformedImagePath?: string, error?: string): Promise<Transformation>;
  getUserTransformations(userId: number): Promise<Transformation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transformations: Map<number, Transformation>;
  private userIdCounter: number;
  private transformationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transformations = new Map();
    this.userIdCounter = 1;
    this.transformationIdCounter = 1;
    
    // Create a default user for development
    this.createUser({
      username: "demo",
      password: "password"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      freeCreditsUsed: false,
      paidCredits: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserCredits(id: number, usedFreeCredit: boolean, paidCredits?: number): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = { 
      ...user,
      freeCreditsUsed: usedFreeCredit ? true : user.freeCreditsUsed,
      paidCredits: paidCredits !== undefined ? paidCredits : user.paidCredits
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Transformation operations
  async createTransformation(insertTransformation: InsertTransformation): Promise<Transformation> {
    const id = this.transformationIdCounter++;
    const now = new Date();
    
    const transformation: Transformation = {
      ...insertTransformation,
      id,
      transformedImagePath: null,
      status: "pending",
      createdAt: now,
      error: null
    };
    
    this.transformations.set(id, transformation);
    return transformation;
  }

  async getTransformation(id: number): Promise<Transformation | undefined> {
    return this.transformations.get(id);
  }

  async updateTransformationStatus(
    id: number, 
    status: string, 
    transformedImagePath?: string,
    error?: string
  ): Promise<Transformation> {
    const transformation = await this.getTransformation(id);
    if (!transformation) {
      throw new Error("Transformation not found");
    }

    const updatedTransformation = {
      ...transformation,
      status,
      ...(transformedImagePath && { transformedImagePath }),
      ...(error && { error })
    };

    this.transformations.set(id, updatedTransformation);
    return updatedTransformation;
  }

  async getUserTransformations(userId: number): Promise<Transformation[]> {
    return Array.from(this.transformations.values())
      .filter(transformation => transformation.userId === userId)
      .sort((a, b) => b.id - a.id); // Sort by most recent
  }
}

export const storage = new MemStorage();
