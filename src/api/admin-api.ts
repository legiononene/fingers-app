import api from "./index";
import { z } from "zod";

const adminSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
const batchSchema = z.object({
  name: z.string().min(1),
  in_time: z
    .string()
    .regex(/\b(1[0-2]|0?[1-9]):([0-5][0-9]) ?([APap][Mm])\b/gm),
  out_time: z
    .string()
    .regex(/\b(1[0-2]|0?[1-9]):([0-5][0-9]) ?([APap][Mm])\b/gm),
  isActive: z.boolean().optional(),
});
const students = z.object({
  batchId: z.string(),
  student: z.array(
    z.object({
      name: z.string(),
      aadhar_number: z.string(),
      in_at: z.string(),
      out_at: z.string(),
    })
  ),
});
const fingers = z.array(
  z.object({
    image: z.string(),
    scale: z.number(),
    primary: z.boolean(),
  })
);

export const login = (data: z.infer<typeof adminSchema>) => {
  return api("/admin/login", "POST", { body: JSON.stringify(data) });
};

export const register = (data: z.infer<typeof adminSchema>) => {
  return api("/admin/register", "POST", { body: JSON.stringify(data) });
};

export const addbatch = (data: z.infer<typeof batchSchema>, token: string) => {
  return api("/admin/add-batch", "POST", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
export const addStudent = (date: z.infer<typeof students>, token: string) => {
  return api("/admin/add-students", "POST", {
    body: JSON.stringify(date),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getDashboard = (token: string) => {
  return api("/admin/dashboard", "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addFingers = (
  data: z.infer<typeof fingers>,
  studentId: string,
  token: string
) => {
  return api(`/admin/add-fingers/${studentId}`, "POST", {
    body: JSON.stringify(data),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllStudents = (token: string) => {
  return api(`/admin/students`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getUsersById = (userId: string, token: string) => {
  return api(`/admin/users/${userId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getStudentsBybatch = (batch: string, token: string) => {
  return api(`/admin/batch/${batch}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllbatch = (token: string) => {
  return api(`/admin/batch`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getFingerById = (fingerId: string, token: string) => {
  return api(`/admin/finger/${fingerId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getbatchId = (batchId: string, token: string) => {
  return api(`/admin/batch/${batchId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getStudentId = (studentId: string, token: string) => {
  return api(`/admin/Student/${studentId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteUser = (userId: string, token: string) => {
  return api(`/admin/user/${userId}`, "DELETE", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
