import { cookies } from "next/headers";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";
import { api } from "./api";
import type { FetchNotesParams, FetchNotesResponse } from "./clientApi";

const getCookieHeader = async () => {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
};

export const fetchNotes = async (
  params: FetchNotesParams,
): Promise<FetchNotesResponse> => {
  const cookieHeader = await getCookieHeader();
  const response = await api.get("/notes", {
    params,
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (Array.isArray(response.data)) {
    return {
      notes: response.data,
      totalPages: 1,
    };
  }

  return {
    notes: response.data.notes,
    totalPages: response.data.totalPages ?? 1,
  };
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const cookieHeader = await getCookieHeader();
  const { data } = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return data;
};

export const getMe = async (): Promise<User> => {
  const cookieHeader = await getCookieHeader();
  const { data } = await api.get<User>("/users/me", {
    headers: {
      Cookie: cookieHeader,
    },
  });

  return data;
};

export const checkSession = async (requestCookieHeader?: string) => {
  const cookieHeader = requestCookieHeader ?? (await getCookieHeader());

  return api.get("/auth/session", {
    headers: {
      Cookie: cookieHeader,
    },
  });
};
