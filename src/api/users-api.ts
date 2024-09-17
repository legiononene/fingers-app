import api from "./index";
import { z } from "zod";
const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
const students = z.object({
  batchId: z.string(),
  student: z.array(
    z.object({
      name: z.string(),
      aadhar_number: z.string(),
    })
  ),
});
const fingers = z.array(
  z.object({
    image: z.string(),
    scale: z.number(),
    primary: z.string().optional(),
  })
);
export const login = (data: z.infer<typeof userSchema>) => {
  return api("/users/login", "POST", { body: JSON.stringify(data) });
};

export const register = (data: z.infer<typeof userSchema>, token: string) => {
  //console.log("Sending data:", data);
  return api("/users/register", "POST", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const ping = (token: string) => {
  return api("/users/ping", "POST", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const getAllStudentsBybatch = (token: string, batchId: string) => {
  return api(`/users/students/${batchId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addStudentIn = (
  token: string,
  batchId: string,
  studentId: string
) => {
  return api(`/users/in/${batchId}/student/${studentId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
export const addStudentOut = (
  token: string,
  batchId: string,
  studentId: string
) => {
  return api(`/users/out/${batchId}/student/${studentId}`, "GET", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteBatch = (batchId: string, token: string) => {
  return api(`/users/delete-batch/${batchId}`, "DELETE", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addStudent = (data: z.infer<typeof students>, token: string) => {
  return api("/users/add-students", "POST", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const DeleteStudent = (studentId: number, token: string) => {
  return api(`/users/delete-student/${studentId}`, "DELETE", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

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

export const addbatch = (data: z.infer<typeof batchSchema>, token: string) => {
  return api("/users/add-batch", "POST", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addFingers = (
  data: z.infer<typeof fingers>,
  studentId: string,
  token: string
) => {
  return api(`/users/add-fingers/${studentId}`, "POST", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
const setFingerSchema = z.object({
  scale: z.number(),
  primary: z.string(),
});

export const setFinger = (
  data: z.infer<typeof setFingerSchema>,
  fingerId: string,
  token: string
) => {
  return api(`/users/set-scale/${fingerId}`, "PUT", {
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
