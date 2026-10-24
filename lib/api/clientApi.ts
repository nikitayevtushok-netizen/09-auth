import { AxiosError, AxiosResponse } from "axios";
import type { Note, NoteTag } from "@/types/note";
import type { User } from "@/types/user";
import { api } from "./api";

export type ApiError = AxiosError<{ error?: string; message?: string }>;

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  tag: NoteTag;
}

type NotesApiResponse =
  | Note[]
  | {
      notes: Note[];
      totalPages?: number;
    };

const normalizeNotesResponse = (data: NotesApiResponse): FetchNotesResponse => {
  if (Array.isArray(data)) {
    return {
      notes: data,
      totalPages: 1,
    };
  }

  return {
    notes: data.notes,
    totalPages: data.totalPages ?? 1,
  };
};

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<FetchNotesResponse> => {
  const response: AxiosResponse<NotesApiResponse> = await api.get("/notes", {
    params,
  });

  return normalizeNotesResponse(response.data);
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.get(`/notes/${id}`);
  return response.data;
};

export const createNote = async (payload: CreateNotePayload): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.post("/notes", payload);
  return response.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const response: AxiosResponse<Note> = await api.delete(`/notes/${id}`);
  return response.data;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post<User>("/auth/register", data);
  return res.data;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export const login = async (data: LoginRequest) => {
  const res = await api.post<User>("/auth/login", data);
  return res.data;
};

type CheckSessionResponse = {
  success: boolean;
};

export const checkSession = async () => {
  const res = await api.get<CheckSessionResponse>("/auth/session");
  return res.data.success;
};

export const getMe = async () => {
  const { data } = await api.get<User>("/users/me");
  return data;
};

export type UpdateUserRequest = {
  username?: string;
};

export const updateMe = async (payload: UpdateUserRequest) => {
  const res = await api.patch<User>("/users/me", payload);
  return res.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};
